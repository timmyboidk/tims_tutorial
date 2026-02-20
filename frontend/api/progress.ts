import express, { Request, Response } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import cors from 'cors';

// ──────────────────────────────────────────────
// 💡 TypeScript 接口定义
// ──────────────────────────────────────────────

/** 前端 POST /api/progress 请求体 */
interface ProgressData {
    userId?: string;
    lessonId: string;
    completed?: boolean;
}

/** Mongoose 文档接口 — 对应一条学习进度记录 */
interface ProgressDocument extends Document {
    userId: string;
    lessonId: string;
    completed: boolean;
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
    completedLessons?: string[];
    record?: ProgressDocument;
    error?: string;
}

// ──────────────────────────────────────────────
// 💡 Express 与 MongoDB 初始化
// ──────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cors());

// 💡 1. 尝试连接 MongoDB (如果是 Vercel 环境会自动复用这块逻辑，如果是 Docker 则使用环境变量)
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/progress_db';
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err: Error) => console.error('MongoDB connection error:', err));
}

// 💡 2. 定义 Mongoose Schema 和 Model
const progressSchema = new Schema<ProgressDocument>({
    userId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

// 防止在热更新或 Vercel Serverless 环境中重复定义 Model
const Progress = mongoose.models.Progress || mongoose.model<ProgressDocument>('Progress', progressSchema);

// ──────────────────────────────────────────────
// 💡 3. API 路由处理
// ──────────────────────────────────────────────

// 获取指定用户的所有已完成课程
app.get('/api/progress', async (req: Request<{}, ProgressResponse, {}, ProgressQuery>, res: Response<ProgressResponse>) => {
    try {
        const userId: string = (req.query.userId as string) || 'default_user'; // 真实环境应从 JWT 中取
        const records = await Progress.find({ userId, completed: true });
        res.json({ success: true, completedLessons: records.map((r: ProgressDocument) => r.lessonId) });
    } catch (error: unknown) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// 标记课程完成/取消完成
app.post('/api/progress', async (req: Request<{}, ProgressResponse, ProgressData>, res: Response<ProgressResponse>) => {
    try {
        const { lessonId, completed }: ProgressData = req.body;
        const userId: string = req.body.userId || 'default_user';

        if (!lessonId) {
            res.status(400).json({ success: false, error: 'lessonId is required' });
            return;
        }

        const record = await Progress.findOneAndUpdate(
            { userId, lessonId },
            { completed: completed !== undefined ? completed : true },
            { upsert: true, new: true }
        ) as ProgressDocument;

        res.json({ success: true, record });
    } catch (error: unknown) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// 对于 Vercel 来说，我们导出 default 给 Vercel 运行时调用
export default app;
