import express, { Request, Response } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ──────────────────────────────────────────────
// 💡 TypeScript 接口定义
// ──────────────────────────────────────────────

/** 前端 POST /api/progress 请求体 */
interface ProgressData {
    userId?: string;
    lessonId: string;
    code: string;
}

/** Mongoose 文档接口 — 对应一条学习进度记录 */
interface ProgressDocument extends Document {
    userId: string;
    lessonId: string;
    code: string;
    createdAt: Date;
    updatedAt: Date;
}

/** GET /api/progress 的查询参数 */
interface ProgressQuery {
    userId?: string;
}

/** API 统一返回格式 */
interface ProgressResponse {
    success: boolean;
    records?: Array<{ lessonId: string, code: string }>;
    record?: { lessonId: string, code: string };
    error?: string;
}

// ──────────────────────────────────────────────
// 💡 Express 与 MongoDB 初始化
// ──────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cors());

// 💡 1. 尝试连接 MongoDB (如果是 Vercel 环境会自动复用这块逻辑，如果是 Docker 则使用环境变量)
const MONGO_URI: string | undefined = process.env.MONGO_URI;
let useMongo = false;

if (MONGO_URI) {
    useMongo = true;
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(MONGO_URI)
            .then(() => console.log('Connected to MongoDB for progress persistence'))
            .catch((err: Error) => console.error('MongoDB connection error:', err));
    }
} else {
    console.log('No MONGO_URI provided, falling back to local file system for progress persistence (ideal for Docker Volumes)');
}

// 💡 2. 定义 Mongoose Schema 和 Model (仅在使用 Mongo 时有实质意义)
const progressSchema = new Schema<ProgressDocument>({
    userId: { type: String, required: true },
    lessonId: { type: String, required: true },
    code: { type: String, default: '' }
}, { timestamps: true });

// 防止在热更新或 Vercel Serverless 环境中重复定义 Model
const Progress = mongoose.models.Progress || mongoose.model<ProgressDocument>('Progress', progressSchema);

// 💡 JSON File System 辅助函数
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'progress.json');

async function getLocalData(): Promise<Record<string, Record<string, string>>> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const exists = await fs.stat(FILE_PATH).catch(() => false);
        if (!exists) return {};
        const buffer = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(buffer);
    } catch {
        return {};
    }
}

async function saveLocalData(data: Record<string, Record<string, string>>) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ──────────────────────────────────────────────
// 💡 3. API 路由处理
// ──────────────────────────────────────────────

// 获取指定用户的所有已缓存的代码记录
app.get('/api/progress', async (req: Request<{}, ProgressResponse, {}, ProgressQuery>, res: Response<ProgressResponse>) => {
    try {
        const userId: string = (req.query.userId as string) || 'default_user'; // 真实环境应从 JWT 中取

        if (useMongo) {
            const records = await Progress.find({ userId });
            res.json({ success: true, records: records.map((r: ProgressDocument) => ({ lessonId: r.lessonId, code: r.code })) });
        } else {
            const data = await getLocalData();
            const userRecords = data[userId] || {};
            const records = Object.entries(userRecords).map(([lessonId, code]) => ({ lessonId, code }));
            res.json({ success: true, records });
        }
    } catch (error: unknown) {
        console.error('Progress GET Error:', error);
        res.status(500).json({ success: false, error: 'Database/FS error' });
    }
});

// 保存用户手敲的代码缓存
app.post('/api/progress', async (req: Request<{}, ProgressResponse, ProgressData>, res: Response<ProgressResponse>) => {
    try {
        const { lessonId, code }: ProgressData = req.body;
        const userId: string = req.body.userId || 'default_user';

        if (!lessonId) {
            res.status(400).json({ success: false, error: 'lessonId is required' });
            return;
        }

        if (useMongo) {
            const record = await Progress.findOneAndUpdate(
                { userId, lessonId },
                { code: code !== undefined ? code : '' },
                { upsert: true, new: true }
            ) as ProgressDocument;
            res.json({ success: true, record: { lessonId: record.lessonId, code: record.code } });
        } else {
            const data = await getLocalData();
            if (!data[userId]) data[userId] = {};
            data[userId][lessonId] = code || '';
            await saveLocalData(data);
            res.json({ success: true, record: { lessonId, code: data[userId][lessonId] } });
        }
    } catch (error: unknown) {
        console.error('Progress POST Error:', error);
        res.status(500).json({ success: false, error: 'Database/FS error' });
    }
});

// 对于 Vercel 来说，我们导出 default 给 Vercel 运行时调用
export default app;
