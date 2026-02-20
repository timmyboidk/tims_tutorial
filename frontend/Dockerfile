# 💡 阶段 1：构建阶段 (builder)
# 使用带有 Node 环境的官方镜像来打包 React 项目
FROM node:20-alpine AS builder

# 💡 设定工作目录
WORKDIR /app

# 💡 只拷贝依赖描述文件，安装依赖（善用 Docker 缓存层机制，如果 package.json 没变则极速跳过这一步）
COPY package.json package-lock.json ./
RUN npm install

# 💡 将业务代码全量拷贝进去，进行构建
COPY . .
RUN npm run build

# =========================================================

# 💡 阶段 2：生产服务阶段 (production)
# 抛弃上一个包含源码与海量 node_modules 的庞大阶段
# 仅仅取用一个极小体积（大概十几兆）的 Nginx 高性能 Web 服务器来伺服静态文件
FROM nginx:alpine

# 💡 移除 Nginx 默认的欢迎页面
RUN rm -rf /usr/share/nginx/html/*

# 💡 从第一个阶段 (builder) 中提取产物（dist 文件夹）放入 Nginx 托管目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 💡 使用自定义 Nginx 配置来支持 React / Vite 单页应用 (SPA) 路由，并且支持反向代理到 Backend 侧
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 💡 暴露默认被抛出的 80 端口（这并不意味着一定是对外的，还要看 Docker Compose 怎么 map 这个端口）
EXPOSE 80

# 💡 CMD: 保持 Nginx 跑在容器前台（daemon off），这样进程不死，容器不退
CMD ["nginx", "-g", "daemon off;"]
