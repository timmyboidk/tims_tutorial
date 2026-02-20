import type { Lesson } from '../types';

export const frontendM1M2: Lesson[] = [
  {
    id: 'fe-1-1', type: 'frontend',
    title: '课程 1.1：配置 SaaS 项目的 React 外壳',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 1,
    instructions: `# 配置 SaaS 项目的 React 外壳与代理机制

## 🎯 业务上下文与我们在做什么？
在开启“短视频 SaaS 看板”的业务代码编写前，坚实的基础设施是成功的保障。本平台选择了构建工具的新王——**Vite**，结合了目前企业中最流行的 **React (Hooks)** 开发范式，以及 **Tailwind CSS** 的原子化解决方案。

![Vite Architecture vs Webpack](/assets/vite-vs-webpack.png)

我们的 SaaS 后端（Spring Boot）将会跑在 \`localhost:8080\` 上。在前后端分离架构下，前端直接用 \`fetch('http://localhost:8080/api')\` 会立刻触发浏览器严格的同源策略（Same-Origin Policy），导致 CORS（跨域资源共享）报错。与其要求后端去修改繁琐的跨域响应头，**最好的工程实践是：在前端开发服务器（Vite）中拦截并代理这些请求**。

## 🔍 代码深度解析与配置

我们需要在 \`vite.config.ts\` 中配置 React 和 Tailwind 插件，同时设置别名和代理服务器：

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
通过 \`resolve.alias\`，我们以后再也不用写出容易引发灾难的 \`../../../../components\` 这种“迷宫路径”了，直接写 \`@/components\`。这就需要设置别名指向 \`./src\` 目录：

\`\`\`typescript
  resolve: {
    alias: {
      // 💡 路径别名：让你在代码里使用 '@/components' 而不是 '../../components'
      '@': path.resolve(__dirname, './src'),
    },
  },
\`\`\`

### 2. 跨域代理服务器 (Proxy)
这个配置指令告诉 Vite，“所有匹配 \`/api\` 的请求，你都不要试图在前端的本地找文件，请作为一座透明的桥，直接原封不动地转发给 \`http://localhost:8080\`。”

\`changeOrigin: true\` 会把向外发送请求时的 \`Host\` 请求头伪装成目标服务器（8080）的地址，骗过可能存在的网关层校验。

\`\`\`typescript
  server: {
    port: 5173,
    proxy: {
      // 💡 代理配置：这解决联调时最常见的 CORS 跨域问题
      // 所有 /api 开头的请求都会被透明转发给 Spring Boot 后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
\`\`\`

## 🧠 底层原理剖析：Vite 为什么比 Webpack 快？以及 Proxy 原理
**Vite vs Webpack**：
在 Webpack 时代，无论你改了一行 CSS 还是加了一个组件，它都必须在内存中把整个项目的依赖树从头到尾**打包（Bundle）**一遍，再吐给浏览器，这在巨型项目中可能会耗时几十秒。而 Vite 利用了现代浏览器天然支持原生 **ESM (ECMAScript Modules)** 的特性。
当你在浏览器里请求 \`import { App } from './App.js'\` 时，Vite 作为一个极为轻量的 HTTP 服务器，拦截到这个请求，然后仅编译 \`App.js\` 这一张卡片发送给前端。这种**按需编译**让它无论项目多大，启动时间永远是毫秒级。

**Proxy 的本质**：
CORS（跨域）是**浏览器**为了保护用户不受 CSRF 攻击而设立的城墙。Vite 的 \`server.proxy\` 完美解决了这个问题：浏览器以为它是同源请求发给了 Vite (运行在 \`localhost:5173\`)，Vite 的 Node.js 底层再发起一个纯净的 HTTP TCP 请求发给内网的 Java。浏览器不知情，跨域问题就此完美解决。`
  },
  {
    id: 'fe-1-2', type: 'frontend',
    title: '课程 1.2：类型严格的 JWT 登录表单',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 2,
    instructions: `# 打造企业级强类型 JWT 登录表单

## 🎯 业务上下文与我们在做什么？
SaaS 系统的第一道大门就是登录认证。用户输入账号密码后，我们会调用认证 API，而后端通常会返回一个含有身份验证信息的 **JWT (JSON Web Token)** 以及该用户的角色。

![JWT Authentication Flow](/assets/jwt-auth-flow.png)

在没有 TypeScript 的时代，如果后端将 \`userId\` 改名叫 \`user_id\`，直到你的程序崩溃前，你都不会察觉。在本次课程中，我们要学习如何建立**前后端的契约（Interface）**，以及如何在 React Hook 中使用泛型来死死钳住异常状态。

## 🔍 代码分步构建

### 1. 定义前后端通信契约
这就是前后端的防线。只要这层契约写清楚了，后面的每一次 \`data.user.role\` 提取都会得到 IDE 完美的代码补全。

\`\`\`typescript
import React, { useState } from 'react';

// 💡 接口定义了后端的承诺，这是全栈联调时前后端沟通的契约
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
这里我们用泛型显式约束了 error 只能是原生 \`Error\` 对象或 \`null\`。如果不声明，React 会把它自动推导为 \`any\`，这在大型系统中是致命的。

\`\`\`typescript
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // 💡 泛型约束：状态只能是 Error 对象或 null
  const [error, setError] = useState<Error | null>(null);
\`\`\`

### 3. 表单提交的类型安全
在监听 Submit 时，如果我们拦截 \`e.preventDefault()\`，必须告诉 TS 这是一个表单事件 (\`React.FormEvent\`)，它才会放行这个方法调用。拿到的令牌我们会将其存储在浏览器的 \`localStorage\` 中。

\`\`\`typescript
  // 💡 明确声明这是表单的提交事件，获得 e.preventDefault() 的类型推导
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      // 💡 强转类型：我们告诉编译器，“相信我，返回值符合 LoginResponse 结构”
      const data = (await res.json()) as LoginResponse;
      
      // 存储 JWT 令牌
      localStorage.setItem('jwt', data.token);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
    }
  };
\`\`\`

### 4. DOM 渲染
最后我们将这些绑定到我们的 JSX 表单元素上：

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

## 🧠 底层原理剖析：React 事件合成与 JWT 结构
**React 的合成事件系统（SyntheticEvent）**：
为什么我们要用 \`React.FormEvent\` 而不是原生 \`SubmitEvent\`？为了抹平浏览器对事件处理的数十种差异，React 引擎写了一个中间层，把所有事件都挂载到了 \`document\` 或 \`root\` 根节点上（事件委托）。传入的 \`e\` 是一个被包装过的安全跨浏览器对象。

**JWT 的无状态魔法**：
Token 放在前端为什么是安全的？签名是由后端用一个除了它没人知道的秘钥（Secret）把头部和负载进行哈希算出来的校验码。如果你篡改了负载（如从 \`USER\` 篡改成 \`ADMIN\`），它和签名就不匹配了，后端验签立刻失败，彻底消灭了 Session 的内存压力。`
  },
  {
    id: 'fe-1-3', type: 'frontend',
    title: '课程 1.3：处理认证的异步状态机',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 3,
    instructions: `# 利用可区分联合体构建异步状态机

## 🎯 业务上下文与我们在做什么？
在处理网络请求时，页面可能会因为网络抖动卡住数秒。如果不展示 Loading 图标，用户的绝望点击会引发竞态问题。

一般的初学者做法是随意声明 \`isLoading: boolean\`, \`data: any\` 和 \`error: string\`，这非常容易产生“非法状态”（例如既 \`isLoading: true\` 又有 \`data\`）。
利用 TypeScript 特有的**可区分联合体（Discriminated Unions）**理念，我们将重构整个认证状态，让其像一台状态机般流转。

![React Discriminated Union State Machine](/assets/react-state-machine.png)

## 🔍 代码分步构建

### 1. 定义状态全集 (可区分联合体)
看！这里用 \`|\` 符号并列了四种绝对互斥的独立状态空间。一旦对象里的 \`status\` 是 \`'loading'\`，那么编译器绝对不允许你访问 \`token\` 这个键，因为它认为那是只有当 \`status === 'success'\` 时才会出现的数据。

\`\`\`typescript
import React from 'react';

// 💡 可区分联合体：status 是钥匙，它决定了对象里能存什么数据
type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; token: string }
  | { status: 'error'; error: string };
\`\`\`

### 2. 编写 Reducer 变迁法则
这种模式灵感来源于 Redux。它规定你不能再随便给某些变量赋值，所有的改变必须通过上报 \`action\` 事件完成。

\`\`\`typescript
// 💡 reducer 仅允许你触发合法的状态变迁，比如从 FETCH 就只能走向 loading
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
      // 💡 此处 TypeScript 要求你必须提供 token，不可能漏掉
      return { status: 'success', token: action.token };
    case 'ERROR':
      return { status: 'error', error: action.error };
    default:
      return state;
  }
}
\`\`\`

### 3. 封装为 Custom Hook
\`useReducer\` 是比 \`useState\` 更高级的 React Hook，非常适合处理“下一个状态极为依赖上一个状态并且拥有多分支逻辑”的复杂情况。

\`\`\`typescript
// 在组件中使用案例：
export function useAuthMachine() {
  const [state, dispatch] = React.useReducer(authReducer, { status: 'idle' });
  
  // 可以在实际业务中这样使用:
  // dispatch({ type: 'SUCCESS', token: 'ey...' })
  
  return { state, dispatch };
}
\`\`\`

## 🧠 底层原理剖析：TS 类型收窄与 React 渲染队列
**TypeScript 类型收窄（Type Narrowing）机制**：
对于编译器而言，\`AuthState\` 是一个四条路走其中一条的岔口。\`status\` 字段被称为**判别属性（Discriminant Property）**。当你在代码中写出一句 \`if (state.status === 'success')\` 时，TS 的控制流分析会介入，宣告“现在只剩带 token 的那一个形状了”，所以你可以肆无忌惮地取用 \`state.token\`。这是将静态检查利用到极限的神技。`
  },
  {
    id: 'fe-1-task', type: 'frontend',
    title: '实战：SaaS 级强类型 Button',
    category: '模块1：现代基础架构与权限', track: '前端架构',
    moduleNumber: 1, lessonNumber: 4,
    instructions: `# 启发式实战：开发企业级强类型 UI 组件库

## 🎯 业务上下文与我们在做什么？
在一个数人开发的大型 SaaS 看板中，会有数百个按钮。如果大家每次都在代码里手写又长又繁琐的 Tailwind 类名，不但极大阻碍开发效率，而且在修改系统主色调时面临无从重构的噩梦。

我们需要剥离样式，制作一个能够**提供语法智能提示**的基础 UI 组件。你的使用体验应该是像积木一样：\`<Button variant="danger" size="lg">删除数据</Button>\`。如果新来的实习生拼错了变为 \`variant="red"\`，它连编译期都过不去！

![Tailwind Variant Button Composition](/assets/tailwind-variants.png)

## 🔍 代码深度解析

### 1. 声明字面量类型与属性继承
**字面量联合类型**（如 \`'sm' | 'md' | 'lg'\`）要求传入的值必须是有限集中的字符串。配合 \`React.ButtonHTMLAttributes\` 的继承，我们将获得非常强大的 API 面。

\`\`\`typescript
import React from 'react';

// 💡 只有这三种变体是被允许的，其他拼写错误在编码阶段就会告警
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// 💡 继承原生 button 的所有属性（比如 type, disabled），无需重复声明
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  size: ButtonSize;
}
\`\`\`

### 2. 通过 Record 映射全量样式
\`Record<K, V>\` 字典映射是一种查阅表结构。当左边声明了涵盖所有属性的 \`K\` 时，如果你漏掉了其中某一项，编译器当即阻止提交，消灭了上线后发现样式缺失的生产事故。

\`\`\`typescript
// 💡 使用 Record<K, V> 映射，确保你为每一种变体都提供了相应的 CSS 类
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#4285F4] text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
\`\`\`

### 3. 组件透传与组装
配合继承系统，把我们解构剩下的未知名对象 (\`...rest\`) 全员直接赋值到底层的 DOM 节点上。

\`\`\`typescript
export function Button({ variant, size, children, className, ...rest }: ButtonProps) {
  return (
    <button
      // 💡 解构原生属性并拼接核心样式
      className={\`font-medium transition-colors rounded-lg \${sizeClasses[size]} \${variantClasses[variant]} \${className || ''}\`}
      {...rest}
    >
      {children}
    </button>
  );
}
\`\`\`

## 🧠 底层原理剖析：React Props 穿透与 CSS 范式
**原子化 CSS（Tailwind）工作原理**：
Vite 在打包挂载 Tailwind 引擎时，会在整个项目进行一次正则扫描。它扫描出了你在所有 TSX 文件中所用到的类名，然后只从其自带的庞大图集中提取相关的类注入生产环境。所以，**绝对不能在这里进行字符串拼接式的动态类名（如 \`bg-\${color}-500\`）**，这会导致扫描器找不到完整的词根而过滤掉 CSS。此方案使用 Record 的完全显式的映射才是正道。`
  },
  {
    id: 'fe-2-1', type: 'frontend',
    title: '课程 2.1：优化短视频 Feed 流卡片',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 1,
    instructions: `# 保护海量节点的优化：React.memo

## 🎯 业务上下文与我们在做什么？
在一个庞大的流式短视频信息板中，当后台通过高射炮般的速度传回数千条 JSON 数据时，浏览器内存里的树结构极其庞大。如果整个根级的状态发生了改变，React 会自动触发自其及其所有成百上千个字组件后代们的递归重新渲染。尽管虚拟 DOM 不会波及物理 DOM 层面，但这万次无效重重遍历足以让你的浏览器掉帧卡死。

![React Memoization Virtual DOM diffs](/assets/react-memo-diff.png)

## 🔍 代码深浅阻断

### 1. 结构与属性声明
我们先定义视频的数据结构。这通常来自后端 API 返回的响应对象。

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

### 2. React.memo 性能隔离
**\`React.memo\`**：这层名为备忘录（memoize）的护盾，套在暴露出去的函数组件上。每次需要重渲染前，React 会用 \`Object.is\` 浅核对上一刻和这一刻传入的 \`{ video, onLike }\` 有没有变动。如果没有，React 断定没必要深入查探，直接使用内存旧实例。

\`\`\`tsx
// 💡 React.memo 告诉引擎：如果内存指针没有变，就不要重刷我的老 DOM
export const VideoCard = React.memo(function VideoCard({ video, onLike }: VideoCardProps) {
  // 💡 模拟一下昂贵的渲染逻辑开销
  console.log('Rendering VideoCard:', video.id);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* lazy loading 对于含有大量图片的 feed 来说是极其至关重要的原生优化 */}
      <img src={video.thumbnail} alt={video.title} className="h-48 w-full object-cover" loading="lazy" />
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-2">{video.title}</h3>
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>@{video.author}</span>
          <span>{(video.views / 1000).toFixed(1)}K views</span>
        </div>
        <button 
          // 💡 点击向上传递事件，交由父组件调用后端API
          onClick={() => onLike(video.id)}
          className="mt-4 w-full py-2 bg-[#E8F0FE] text-[#1967D2] font-medium rounded-lg hover:bg-blue-100"
        >
          点赞支持
        </button>
      </div>
    </div>
  );
});
\`\`\`

## 🧠 底层原理剖析：Virtual DOM 重构机制
**Diffing（求异算法）**：
React 产生出一棵全新的 JS 对象树（Virtual DOM），调和器 (Reconciler) 将老树与新树进行比对。这种操作看似昂贵但因为它承受海量 O(N) 递归。当 Diff 得到变更清单 (Patches) 时，才通过底层绑定批量注入物理 DOM，引发 GPU \`Repaint\` 与 \`Reflow\`。

**注意坑点：** 如果你父组件中是通过内联 \`onLike={() => ... }\` 的方式抛给 memo 组件的，因为每次父级重绘都会重新生成一次内存处于新位置的函数对象地址，它将直接摧毁你所有的 memo 判断屏障造成优化失灵！`
  },
  {
    id: 'fe-2-2', type: 'frontend',
    title: '课程 2.2：构建无限滚动 Hook',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 2,
    instructions: `# 构建原生交互防闭包缺陷的无限滚动 Hook

## 🎯 业务上下文与我们在做什么？
像抖音或是小红书，终极交互形态一定有极度上瘾的**无限瀑布滚动加载**。这本质是在列表底部埋设一个空的预警节点。但是在这写原生的监听代码会让逻辑彻底腐烂，因为有非常多需要复用滚动的页面。我们将其封装暴露为自研 Custom Hook \`useIntersectionObserver\`。

![Intersection Observer Workflow](/assets/intersection-observer.png)

## 🔍 代码分步解析

### 1. 挂载 Ref 与闭包保护
**\`useRef(callback)\` 的绝妙使用**：初学者一定会踩中的惊天巨坑：如果你往 \`Observer\` 里塞了一个包含 \`useState\` 会不断重新渲染所引用的闭包回调，那回调永远只保留着它出世那第一遍的状态。我们利用“静态容器”（Ref）保留住了最新动作指针。

\`\`\`typescript
import { useEffect, useRef } from 'react';

// 💡 这个 Hook 的作用是：当你给它的元素露脸（相交）时，它就执行你的 callback。
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // 💡 useRef(callback) - [破解闭包陷阱的核心] 
  // 由于 callback 在父组件内可能会频繁重现（比如带有 page 状态），
  // 这个 ref 会保证 observer.observe 内触发的始终是最新的逻辑引用。
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
\`\`\`

### 2. 初始化 Intersection 监听
**\`IntersectionObserver\`**：专门替代昂贵且愚蠢的 \`window.addEventListener("scroll")\`。当绑定的物体与视口进行几何裁剪面碰撞发生接触时（Intersecting），底层自动抛出事件。

\`\`\`typescript
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      // 💡 在交叉且回调存在时执行动作
      if (entry.isIntersecting) {
        callbackRef.current();
      }
    }, { threshold: 0.1, ...options });

    observer.observe(target);
    
    // 💡 记得清理监听器，防止内存泄漏
    return () => observer.disconnect();
  }, [options]);

  return targetRef;
}
\`\`\`

## 🧠 底层原理剖析：React 闭包陷阱的数学缘由
**闭包与状态快照（Stale Closures）的恐怖地带**：
当第一次挂载组件，内部会构建出 \`A\` 函数拥有 \`page = 1\`。第三次又生成了 \`C\` 函数 \`page = 3\`。如果不更新依赖里的连接，外挂 Observer 内发生的事件永远执拗呼叫旧时的 \`A\`。

**\`useRef\` 又是如何化险为夷？**
\`useRef\` 构建的盒子永远驻留在底层的同一处堆中不换地址 \`{ current: ... }\`。当触发回调时，它在壳中调用的是内部指向的崭新 \`{ current: C }\`。这种利用二级跳板来逃逸原生回调宿主绑架的做法是 React 工程的基石之一。`
  },
  {
    id: 'fe-2-3', type: 'frontend',
    title: '课程 2.3：使用 Web Worker 卸载排序计算',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 3,
    instructions: `# 压轴：卸载重算力下注 Web Worker 的并发

## 🎯 业务上下文与我们在做什么？
在数据看板应用中如果有一百万行的监控信息，用户点了按“时间”重新排序。如果直接由主线程原封不动算的话（即 \`Array.prototype.sort()\`），它绝对会导致几十秒页面纹丝不动。
我们将创建出一只深渊后台驻场线程 \`Web Worker\` 进行算网分离。

![Web Worker Concurrency Threading](/assets/web-worker-concurrency.png)

## 🔍 代码拆解

### 1. 隐微化内联 Worker 脚本
传统做法是需要一个独立 JS 文件，极易导致 404 及打包配置难题。通过创建 \`Blob\` 并用 URL 的形式，使 Worker 逻辑与应用代码彻底聚合。

\`\`\`typescript
// 💡 Worker 的内核逻辑必须是一个纯净的世界，不能访问 DOM 和 window！
const sortWorkerStr = \`
  self.onmessage = function(e) {
    const { videos, sortBy } = e.data;
    // 💡 注意：sort 会在原地修改数组，我们解构一份防副作用
    const sorted = [...videos].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      return a.title.localeCompare(b.title);
    });
    // 💡 计算完后原路发送回去
    self.postMessage(sorted);
  };
\`;

function createWorker() {
  const blob = new Blob([sortWorkerStr], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}
\`\`\`

### 2. 挂接 React Hook
用极其现代的前端黑魔法，将异步线程通讯封装成了丝般顺滑的声明式 React Hook，用起来毫无波澜。

\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

export function useWorkerSort(videos: any[], sortBy: string) {
  const [sorted, setSorted] = useState(videos);
  const workerRef = useRef<Worker | null>(null);

  // 💡 Init 初始化
  useEffect(() => {
    workerRef.current = createWorker();
    workerRef.current.onmessage = (e) => setSorted(e.data);
    
    // 💡 组件销毁时掐断线程电源
    return () => workerRef.current?.terminate();
  }, []);

  // 💡 每当列表或排序条件改变，发送任务给多线程后台处理
  useEffect(() => {
    workerRef.current?.postMessage({ videos, sortBy });
  }, [videos, sortBy]);

  return sorted;
}
\`\`\`

## 🧠 底层原理剖析：JS 单线程宿命与并发模型
**事件循环（Event Loop）与阻塞**：
不管是在接受数据，还是操作 DOM，都必须挤进 V8 引擎唯一的调用栈内。如果做巨型的阻塞计算，所有队列都会陷入假死崩溃。

**Actor 模型的孤岛双雄**：
\`Worker\` 是传统并发里辉煌在 Erlang 上的 **Actor 模型**。这两个平行宇宙，互相绝不触碰死锁，而是依靠 \`postMessage\` 的邮筒与监听信号兵传递序列化结构交流，这是一场高贵而纯洁的双向异步会谈。`
  },
  {
    id: 'fe-2-task', type: 'frontend',
    title: '实战：整合无限 Feed 流业务闭环',
    category: '模块2：组件架构与视频流', track: '前端架构',
    moduleNumber: 2, lessonNumber: 4,
    instructions: `# 启发式终结战：装配万法合流的前端聚合器

## 🎯 业务上下文与我们在做什么？
架构再美如果不进行最后一步的高精密拼装，它只能变成零碎的散件系统。本课你要像一个全能工程师一样把你之前亲自做的拥有抗闭包免疫能力的 \`useIntersectionObserver\` 等，完美拼接在一张统一管控宏观数据的聚合展示页面 \`InfiniteSaaSFeed\` 中。这构成经典的一条由下发往上的“自研聚合骨架流”。

![SaaS Feed Architecture](/assets/infinite-feed-layout.png)

## 🔍 代码拆解

### 1. 引入并装载业务模块
首先我们要导入所有的自定义组件。并设置状态机来锁住高并发触发的瀑布接口调用。

\`\`\`tsx
import React, { useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VideoCard } from '@/components/VideoCard';

export default function InfiniteSaaSFeed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
\`\`\`

### 2. 状态提升与节流拉取
**防竞态加载锁 (\`if (loading) return;\`)**：这是保护接口爆炸的基础开关。
我们将 \`VideoCard\` 彻底愚昧化处理，使得如“点赞发送 Kafka”的高阶网络操作提升留在我们这一顶层。

\`\`\`typescript
  // 💡 分页逻辑并添加并发请求锁
  const fetchMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    // 模拟一下从 Spring Boot API 拿数据
    const newVideos = [{ 
      id: String(Date.now()), 
      title: 'New React Hook Tutorial', 
      author: 'CodeForge', 
      views: 50000, 
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop' 
    }];
    
    setVideos(prev => [...prev, ...newVideos]);
    setPage(p => p + 1);
    setLoading(false);
  }, [page, loading]);

  // 💡 我们早前写的完美的神级 Hook，此时派上了极大的用武之地
  const sentinelRef = useIntersectionObserver(fetchMore);
\`\`\`

### 3. DOM 归位合并
挂载我们的组件并通过哨兵 div 引发触发效应。

\`\`\`tsx
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">Trending Tech</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <VideoCard 
            key={v.id} 
            video={v} 
            // 将真正的网络业务逻辑写在顶层聚合体
            onLike={(id: string) => console.log('Liking video and pushing to Kafka: ', id)} 
          />
        ))}
      </div>

      {/* 💡 滚动底部的哨兵元素：它永远静静守候在那里等待你往下划到它 */}
      <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-6">
        {loading && <div className="text-[#4285F4] animate-pulse">Loading next chunk...</div>}
      </div>
    </div>
  );
}
\`\`\`

## 🧠 结语概括
这一系列动作宣告了前端现代最佳实践的心法落地。瀑布滚动不再是用极恶劣的 \`scroll\` 疯狂触发回调堆积成的垃圾代码，而是用底层 \`IntersectionObserver\` 去掉计算；对所有展示类节点一律 \`React.memo\` 进行严防死守；并将所有的沉重逻辑向左推入 Web Worker 的多线程内室，以此获得帧率恒定在 60 大关的完美体验。`
  },
];
