import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// 导入我们刚刚写的通用 API 处理模块
import apiApp from './api/progress.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const app = express();

// 💡 1. 挂载通用后端 API (提供持久化功能)
app.use((req: Request, res: Response, next: NextFunction): void => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(apiApp);

// 监听数据库连接事件以提供更好的排查反馈
mongoose.connection.on('error', (err: Error) => {
    console.error('MongoDB error monitored by central server:', err);
});

// 💡 2. 挂载前端静态文件目录 (Vite 打包出来的 dist)
const staticPath: string = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// 💡 3. SPA 路由回退 (处理 React Router)
// 注意：Express 5.x 的 path-to-regexp 移除了未命名通配符，安全做法是使用原生正则 /.*/
app.get(/.*/, (req: Request, res: Response): void => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// 💡 4. 启动服务 (仅在 Docker/本地 通过 node 启动时执行)
const PORT: number = Number(process.env.PORT) || 80;
const HOST: string = '0.0.0.0'; // 💡 必须绑定到 0.0.0.0 才能在 Docker 容器外访问
app.listen(PORT, HOST, () => {
    console.log(`Server is running statically on http://${HOST}:${PORT}`);
});
