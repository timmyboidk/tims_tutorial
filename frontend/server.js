import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入我们刚刚写的通用 API 处理模块
import apiApp from './api/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 💡 1. 挂载通用后端 API (提供持久化功能)
app.use(apiApp);

// 💡 2. 挂载前端静态文件目录 (Vite 打包出来的 dist)
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// 💡 3. SPA 路由回退 (处理 React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// 💡 4. 启动服务 (仅在 Docker/本地 通过 node 启动时执行)
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running statically on port ${PORT}`);
});
