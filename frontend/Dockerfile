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
# 使用极小体积的 Node alpine 服务，不仅托管打包出来的静态文件，还内置 Express API 路由来实现持久化功能！
FROM node:20-alpine

WORKDIR /app

# 从 builder 拷贝构建好的完全静态页面
COPY --from=builder /app/dist ./dist
# 拷贝 Express 的核心支撑文件和依赖
COPY package.json package-lock.json ./
RUN npm install --production

# 拷贝后端代码层
COPY server.js ./
COPY api ./api

# (由于取消了 Nginx，需要移除 nginx.conf 的相关拷贝)

# 💡 暴露 80 端口给外部映射（注意 server.js 默认监听 80）
EXPOSE 80

# 💡 启动 Express 服务
CMD ["node", "server.js"]
