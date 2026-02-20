import type { Lesson } from '../types';

export const frontendM1M2: Lesson[] = [
  {
    id: 'fe-1-1', type: 'frontend',
    title: '课程 1.1：配置 SaaS 项目的 React 外壳',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 1,
    instructions: `# 配置 SaaS 项目的 React 外壳与代理机制

## 业务上下文
在开启前端业务代码编写前，需要搭建基础架构。本平台选择 Vite 构建工具，结合 React 开发范式与 Tailwind CSS。

![Vite Architecture vs Webpack](/assets/vite-vs-webpack.png)

SaaS 后端运行在 \`localhost:8080\`。在前后端分离架构下，前端直接请求接口会触发浏览器的同源策略限制，导致 CORS 跨域报错。工程推崇的做法是：在开发环境（Vite）中配置代理来转发请求。

## 代码与配置

在 \`vite.config.ts\` 中配置 React 和 Tailwind 插件，同时设置路径别名和代理服务器：

\`\`\`typescript
/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
\`\`\`

### 1. 别名配置 (Alias)
通过 \`resolve.alias\` 设置别名指向 \`./src\` 目录，可以直接使用 \`@/components\` 而不是相对路径：

\`\`\`typescript
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
\`\`\`

### 2. 跨域代理服务器 (Proxy)
配置代理将匹配 \`/api\` 的请求转发给 \`http://localhost:8080\`。

\`changeOrigin: true\` 会修改请求头中的 \`Host\` 为目标服务器地址，以通过网关校验。

\`\`\`typescript
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
\`\`\`

## 原理解析：Vite 优势与 Proxy
**Vite vs Webpack**：
Webpack 需要将整个项目的依赖打包后发送给浏览器，在大型项目中耗时较长。Vite 利用现代浏览器支持原生 ESM (ECMAScript Modules) 的特性，按需编译请求的模块，启动速度快。

**Proxy 的本质**：
CORS 跨域限制是浏览器为了保护用户安全而设立的机制。服务器之间的数据请求不存在跨域限制。Vite 的 \`server.proxy\` 就是利用此特性，在开发服务器层面将请求转发给后端，从而解决跨域问题。`
  },
  {
    id: 'fe-1-2', type: 'frontend',
    title: '课程 1.2：类型严格的 JWT 登录表单',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 2,
    instructions: `# 开发类型严格的 JWT 登录表单

## 业务上下文
登录认证是系统的基础功能。调用认证 API 后，后端返回包含身份信息的 JWT (JSON Web Token) 及用户角色。

在 TypeScript 中，我们需要定义接口来约束返回的数据结构，并通过泛型处理组件状态。

## 代码分步构建

### 1. 定义数据接口
明确前后端通信的数据结构，以便获得代码层面的类型检查。

\`\`\`typescript
import React, { useState } from 'react';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
  };
}
\`\`\`

### 2. 状态与泛型约束
使用泛型显式约束 error 状态只能是 \`Error\` 对象或 \`null\`。

\`\`\`typescript
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [error, setError] = useState<Error | null>(null);
\`\`\`

### 3. 表单提交处理
处理表单提交时，指定事件类型为 \`React.FormEvent\`。获取到 JWT 后，将其存储在 \`localStorage\` 中。

\`\`\`typescript
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = (await res.json()) as LoginResponse;
      localStorage.setItem('jwt', data.token);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
    }
  };
\`\`\`

### 4. DOM 渲染
渲染表单 JSX：

\`\`\`tsx
  return (
    <form onSubmit={handleLogin} className="p-6 bg-white shadow-md rounded-xl">
      {error && <p className="text-red-500 mb-4">{error.message}</p>}
      <input className="block border p-2 mb-2 w-full" type="text" placeholder="Username"
        value={username} onChange={e => setUsername(e.target.value)} />
      <input className="block border p-2 mb-4 w-full" type="password" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">登录</button>
    </form>
  );
};

export default LoginForm;
\`\`\`

## 原理解析：事件合成与 JWT
**React 的合成事件（SyntheticEvent）**：
为了抹平浏览器事件差异，React 实现了一套事件委托机制，将事件统一绑定到根节点，并向回调函数传入定制的事件对象。

**JWT 无状态认证**：
JWT 的签名由后端通过密钥对头部和负载进行哈希生成。若负载被篡改，签名验证将失败，从而确保了安全性并避免了服务端的 Session 存储开销。`
  },
  {
    id: 'fe-1-3', type: 'frontend',
    title: '课程 1.3：处理认证的异步状态',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 3,
    instructions: `# 利用可区分联合体处理异步状态

## 业务上下文
在网络请求中，通常需要维护加载中、成功、失败等状态。分别声明多个布尔变量容易产生无效的状态组合。

TypeScript 的可区分联合体（Discriminated Unions）可以用来定义互斥的状态集合。

## 代码分步构建

### 1. 定义状态全集
定义四种互斥状态。在指定 \`status\` 的同时，约束该状态下允许存在的字段。

\`\`\`typescript
import React from 'react';

type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; token: string }
  | { status: 'error'; error: string };
\`\`\`

### 2. 编写 Reducer 函数
状态的更新需要通过分发指定的 \`action\` 来完成。

\`\`\`typescript
function authReducer(
  state: AuthState,
  action: 
    | { type: 'FETCH' }
    | { type: 'SUCCESS'; token: string }
    | { type: 'ERROR'; error: string }
): AuthState {
  switch (action.type) {
    case 'FETCH':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', token: action.token };
    case 'ERROR':
      return { status: 'error', error: action.error };
    default:
      return state;
  }
}
\`\`\`

### 3. 封装 Custom Hook
在复杂状态逻辑中， \`useReducer\` 提供了比 \`useState\` 更严谨的状态管理方式。

\`\`\`typescript
export function useAuthMachine() {
  const [state, dispatch] = React.useReducer(authReducer, { status: 'idle' });
  
  // 示例: dispatch({ type: 'SUCCESS', token: 'token-string' })
  return { state, dispatch };
}
\`\`\`

## 原理解析：TS 类型收窄
**TypeScript 类型收窄（Type Narrowing）**：
\`status\` 字段作为判别属性，在条件判断 \`if (state.status === 'success')\` 内，TS 编译器能够自动推断当前的数据对象结构，允许安全地访问关联属性。`
  },
  {
    id: 'fe-1-task', type: 'frontend',
    title: '实战：强类型组件',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 4,
    instructions: `# 实战：开发强类型 UI 组件

## 业务上下文
大型项目中通常需要公共 UI 组件。通过封装公共样式，配合 TypeScript 的类型提示，可以提升代码质量和可维护性。

## 代码深度解析

### 1. 字面量类型与属性提取
使用字面量联合类型约束组件的属性，并继承 \`React.ButtonHTMLAttributes\` 来获取原生 DOM 属性定义。

\`\`\`typescript
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  size: ButtonSize;
}
\`\`\`

### 2. 通过 Record 定义样式映射
利用 \`Record\` 映射各个状态所对应的 Tailwind CSS 类名，这能保证没有缺失的配置项。

\`\`\`typescript
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
\`\`\`

### 3. 组件组装与传参
将原生属性解构并传递给实际的 DOM 元素。

\`\`\`typescript
export function Button({ variant, size, children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={\`font-medium transition-colors rounded-lg \${sizeClasses[size]} \${variantClasses[variant]} \${className || ''}\`}
      {...rest}
    >
      {children}
    </button>
  );
}
\`\`\`

## 原理解析
**Tailwind 扫描机制**：
Vite 打包时会静态扫描源码找出使用的 Tailwind 类。因此不能使用变量拼接的方式生成类名（如 \`bg-\${color}-500\`），而应使用已知的全量字符串映射，以保证打包提取的内容完整。`
  },
  {
    id: 'fe-2-1', type: 'frontend',
    title: '课程 2.1：列表性能优化',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 1,
    instructions: `# React 冗余渲染优化：React.memo

## 业务上下文
在列表视图中，数据量通常较大。如果父组件的状态发生变化，React 默认会重新渲染所有的后代组件。对于复杂列表，这会引起性能问题。

## 代码解析

### 1. 数据结构声明
定义渲染组件所需的数据结构接口。

\`\`\`typescript
import React from 'react';

interface Video {
  id: string;
  title: string;
  author: string;
  views: number;
  thumbnail: string;
}

interface VideoCardProps {
  video: Video;
  onLike: (id: string) => void;
}
\`\`\`

### 2. React.memo 隔离层
使用 \`React.memo\` 包装组件，React 将在属性没有变化的情况下跳过该组件的重新渲染。

\`\`\`tsx
export const VideoCard = React.memo(function VideoCard({ video, onLike }: VideoCardProps) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100">
      <img src={video.thumbnail} alt={video.title} className="h-48 w-full object-cover" loading="lazy" />
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-2">{video.title}</h3>
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>@{video.author}</span>
          <span>{(video.views / 1000).toFixed(1)}K views</span>
        </div>
        <button 
          onClick={() => onLike(video.id)}
          className="mt-4 w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100"
        >
          点赞支持
        </button>
      </div>
    </div>
  );
});
\`\`\`

## 原理解析
**Virtual DOM Diff 算法**：
React 的调和算法会递归比较新旧 Virtual DOM。当传入属性采用内联函数定义（如 \`onLike={() => ...}\`）时，每次渲染都会分配新地址，导致 \`React.memo\` 检测到属性变动而失效。因此，需要配合 \`useCallback\` 使用。`
  },
  {
    id: 'fe-2-2', type: 'frontend',
    title: '课程 2.2：构建无限滚动 Hook',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 2,
    instructions: `# 构建封装无限滚动的 Hook

## 业务上下文
实现无限列表加载时，需要在列表尾部放置触发节点。手动监听全局的 \`scroll\` 事件不仅消耗性能而且代码耦合严重。我们可以将其封装为一个自定义 Hook。

## 代码解析

### 1. 结构化 Ref 与闭包处理
利用 \`useRef\` 缓存函数引用，可以保证传给监听对象的过程始终指向最新的回调函数。

\`\`\`typescript
import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
\`\`\`

### 2. 初始化 IntersectionObserver
\`IntersectionObserver\` 是浏览器原生 API，提供目标元素与其祖先元素相交状态变化的监听能力。

\`\`\`typescript
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callbackRef.current();
      }
    }, { threshold: 0.1, ...options });

    observer.observe(target);
    
    return () => observer.disconnect();
  }, [options]);

  return targetRef;
}
\`\`\`

## 原理解析：闭包状态一致性
如果直接在 \`useEffect\` 中使用闭包引用回调函数，由于事件监听未随状态变更而解绑与重新绑定，调用的逻辑将一直停留在第一次渲染时的环境。使用 \`useRef\` 更新函数体可以解决这一常见难题。`
  },
  {
    id: 'fe-2-3', type: 'frontend',
    title: '课程 2.3：使用 Web Worker',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 3,
    instructions: `# 使用 Web Worker 卸载计算

## 业务上下文
在处理大型数组排序计算时，计算阻塞会直接导致浏览器卡顿。使用 \`Web Worker\` 可以将这些逻辑拆分至独立的子线程中。

## 代码解析

### 1. 通过 Blob 动态生成 Worker 脚本
通过转换为 object URL，可以在纯前端工程内部生成并初始化 Worker 流程，避免管理独立依赖文件。

\`\`\`typescript
const sortWorkerStr = \`
  self.onmessage = function(e) {
    const { videos, sortBy } = e.data;
    const sorted = [...videos].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      return a.title.localeCompare(b.title);
    });
    self.postMessage(sorted);
  };
\`;

function createWorker() {
  const blob = new Blob([sortWorkerStr], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}
\`\`\`

### 2. 封装为 Hook
封装挂载与通讯细节，提供标准的 Hook API 供主业务调用。

\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

export function useWorkerSort(videos: any[], sortBy: string) {
  const [sorted, setSorted] = useState(videos);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = createWorker();
    workerRef.current.onmessage = (e) => setSorted(e.data);
    
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    workerRef.current?.postMessage({ videos, sortBy });
  }, [videos, sortBy]);

  return sorted;
}
\`\`\`

## 原理解析
**事件循环（Event Loop）**：
JavaScript 单线程执行意味着主线程阻塞将中断用户交互。Web Worker 提供基于独立线程的并行运算环境，它和主线程通过数据序列化的方式独立进行 \`postMessage\` 交流。`
  },
  {
    id: 'fe-2-task', type: 'frontend',
    title: '实战：组装无限列表业务闭环',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 4,
    instructions: `# 实战：无限流容器组装

## 业务上下文
本课程将组装之前编写的组件和自定义 Hook，在一个聚合视图中实现具备分页加载能力的页面。

## 代码解析

### 1. 组件初始化与状态维护
定义列表数据来源和状态锁机制以防止多重并发请求。

\`\`\`tsx
import React, { useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VideoCard } from '@/components/VideoCard';

export default function InfiniteFeed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
\`\`\`

### 2. 请求节流拉取业务
处理 \`useCallback\` 和加载阈值的逻辑，对底层触发作出反馈。

\`\`\`typescript
  const fetchMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    // 模拟数据源
    const newVideos = [{ 
      id: String(Date.now()), 
      title: 'Hook Tutorial', 
      author: 'Author', 
      views: 50000, 
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop' 
    }];
    
    setVideos(prev => [...prev, ...newVideos]);
    setPage(p => p + 1);
    setLoading(false);
  }, [page, loading]);

  const sentinelRef = useIntersectionObserver(fetchMore);
\`\`\`

### 3. 主界面布局
组合展示层组件。

\`\`\`tsx
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-4">趋势内容</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <VideoCard 
            key={v.id} 
            video={v} 
            onLike={(id: string) => console.log('Action: ', id)} 
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-6">
        {loading && <div className="text-gray-500">加载中...</div>}
      </div>
    </div>
  );
}
\`\`\`

## 模式总结
这是前端通用的单向数据流与生命周期编排范式结合。对列表数据源统一提取，事件统一回收，以提高子组件的适用范围并提升了架构整洁度。`
  },
];
