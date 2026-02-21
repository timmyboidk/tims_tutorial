# 短视频 SaaS 学习看板 (Short Video SaaS Dashboard)

欢迎来到 **短视频 SaaS 学习看板** 项目！本项目是一个全栈工程化教学平台，采用真实的企业级业务场景（类似于 TikTok / 抖音 的后台管理与数据大盘），带你从零到一掌握现代化的大前端架构与高并发后端微服务体系。

## 核心技术栈
- **前端架构**：React 19, TypeScript, Tailwind CSS v4, Next.js (SSR / RSC), Web Workers.
- **后端架构**：Spring Boot 3, MyBatis, Redis 缓存, Kafka 消息队列.
- **工程化与部署**：Vite 工具链, Docker 多阶段构建, Docker Compose 容器编排, Kubernetes (K8s) 基础.

---

## 快速启动指引：一键运行全栈应用

为了让你能在任何电脑上（Windows, Mac, Linux）无痛体验和学习整个平台，我们提供了 Docker 容器化的一键启动方案。

### 前置要求
你只需要在电脑上安装好：
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (推荐最新版)

### 运行步骤
1. **克隆/下载本仓库**到你的本地电脑。
2. 打开终端（Terminal / PowerShell），进入**项目的根目录**。
3. 执行一键召唤命令（这会在后台自动拉取环境并编译整个应用）：
   ```bash
   docker compose up -d --build
   ```
4. **验证启动状态：**
   执行 `docker compose ps` 确保所有容器状态为 `running`。如果某个容器 `Exit 1`，请执行 `docker compose logs [服务名]` 查看报错。
5. **在浏览器中打开：** [http://localhost:5173](http://localhost:5173) 即可进入沉浸式学习看板！

### 连不上 http://localhost:5173 怎么办？ (Troubleshooting)
如果你在浏览器中看到“拒绝连接”，请尝试以下排查：

1. **检查本地端口冲突**：
   可能你本地已经启动了 `npm run dev` 占用了 5173 端口。
   - 执行 `lsof -i :5173` (Mac/Linux) 或 `netstat -ano | findstr :5173` (Windows) 检查。
   - 如果有冲突，请先关掉本地开发进程，或在 `docker-compose.yml` 中修改映射端口（例如 `"5174:80"`）。

2. **尝试使用 127.0.0.1**：
   有些系统的浏览器对 `localhost` 解析有差异，请尝试访问：[http://127.0.0.1:5173](http://127.0.0.1:5173)。

3. **容器未完全启动**：
   初次启动需要下载大量镜像。请查看日志确认 Express 服务已就绪：
   ```bash
   docker compose logs -f frontend
   ```
   看到 `Server is running statically on http://0.0.0.0:80` 即表示启动成功。

### 如何停止服务？
当你学习完毕，想要释放电脑内存时：
```bash
docker compose down
```

---

## 本地开发指南 (如果不使用 Docker)

如果你想亲自修改跑在本地的代码（开发模式），你可以分别启动前端和后端：

### 1. 启动前端学习看板
前端由 Vite 强力驱动，提供极速的 HMR（热更新）体验。
```bash
cd frontend
npm install
npm run dev
```
访问 `http://localhost:5173`。

### 2. 启动后端 API (需要 Java 环境)
*注意：本平台大部分的互动功能（如点赞、登录、拉取数据流）都依赖于后端。如果没有启动后端，前端将使用部分模拟数据。*
```bash
cd backend
# 对于 Mac/Linux:
./gradlew bootRun
# 对于 Windows:
.\gradlew.bat bootRun
```
*备注：后端本地裸奔依赖于你本机是否安装了 MySQL, Redis 和 Kafka。强烈建议后端基础设施使用 Docker Compose 启动。*

---

## 课程模块大纲

本平台包含两条核心学习主线，你可以通过页面左侧的星际路线图进行自由探索：

### 方向一：超大规模前端架构
- **基础架构与鉴权**：Vite 代理解决 CORS，基于 JWT 的登录状态机编写。
- **主线程性能优化**：`React.memo` 阻止瀑布渲染，使用 Intersection Observer 实现无限瀑布流，利用 Web Workers 进行十万级数据的离线排序。
- **服务端渲染 (SSR)**：掌握 Next.js 的 Server Components 与 Islands Architecture（岛屿架构），解决 SaaS 平台的 SEO 与首屏性能痛点。

### 方向二：弹性企业后端与 DevOps
- **高并发与中间件**：Spring Boot 整合 MyBatis 查库，利用 Redis 保护数据库免受读流量冲击，利用 Kafka 为点赞系统实现“削峰填谷”。
- **分布式事务与弹性**：掌握微服务 Saga 模式解决跨库事务（VIP 订阅扣款问题），引入 Circuit Breaker（熔断器）防范微服务雪崩效应。
- **容器化与运维编排**：编写极致压缩的 Dockerfile，配置 `docker-compose.yml` 组建内网通信，了解 Kubernetes (K8s) 的横向扩缩容理念。
