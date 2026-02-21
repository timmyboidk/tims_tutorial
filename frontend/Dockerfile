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
# 使用 Nginx 来托管打包出来的静态文件，并且进行 API 代理
FROM nginx:alpine

# 从 builder 拷贝构建好的完全静态页面
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 💡 暴露 80 端口给外部映射
EXPOSE 80

# 💡 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
