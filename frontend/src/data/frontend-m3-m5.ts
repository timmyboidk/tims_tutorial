import type { Lesson } from '../types';

export const frontendM3M5: Lesson[] = [
  {
    id: 'fe-3-1', type: 'frontend',
    title: '课程 3.1：Next.js SSR 处理视频详情页',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 1,
    instructions: `# 使用 Server-Side Rendering (SSR) 处理 SEO

## 业务上下文
在传统的 React SPA 中，初始加载的 HTML 不包含业务数据，这对搜索引擎抓取和社交媒体分享预览并不友好。

通过 Next.js 的服务端渲染 (SSR)，可以在服务器端预先获取数据并生成完整的 HTML 返回给浏览器，提升首屏渲染速度并优化 SEO。

![SSR Metadata Inject](/assets/ssr-metadata.png)

## 代码解析

### 1. 动态生成 Metadata
使用 Next.js App Router 的 \`generateMetadata\` 钩子可以在服务端预获取数据并注入 \`title\`、\`description\` 和开放图谱 (OpenGraph) 标签。

\`\`\`typescript
import type { Metadata } from 'next';
import VideoPlayer from '@/components/VideoPlayer';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);
  const video = await res.json();
  
  return {
    title: \`\${video.title} - 视频展示平台\`,
    description: video.description,
    openGraph: { images: [video.thumbnail] }
  };
}
\`\`\`

### 2. 构建服务端 React 组件 (Server Component)
服务端组件支持 \`async/await\` 语法。它会在渲染阶段停顿以获取服务端数据，最终输出带有完整内容的 HTML。

\`\`\`tsx
export default async function VideoPage({ params }: { params: { id: string } }) {
  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);
  const video = await res.json();

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
      <VideoPlayer url={video.url} />
    </main>
  );
}
\`\`\`

## 原理解析：SSR 生命周期与 Hydration
**服务端预渲染**：
Node 环境在接收到请求时，提前执行 React 渲染过程，输出静态 HTML 骨架。由于页面不再需要等待 JavaScript 全额解析完毕才展示数据，白屏时间（FCP）显著缩短。

**注水 (Hydration)**：
首屏加载完成后，客户端的 React 将开始执行，并在现有的纯静态 DOM 上挂载交互事件（如 \`onClick\`）。此时原本无交互的静态内容转变为动态应用。`
  },
  {
    id: 'fe-3-2', type: 'frontend',
    title: '课程 3.2：React Server Components',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 2,
    instructions: `# React Server Components 优化渲染性能

## 业务上下文
面临大型化的列表数据渲染（如大量评论）时，传统的 CSR (Client-Side Rendering) 会导致向客户端传输大量的 JSON 数据并在客户端层级发生繁重的渲染，容易造成性能瓶颈乃至内存溢出。

利用 RSC (React Server Components)，你可以将复杂的组件计算完全放在服务端内完成。

## 代码解析

### 1. 缓存与 ISR (Incremental Static Regeneration)
默认情况下，Next.js App Router 中的组件均作为 Server Component 运行。通过 \`fetch\` 设置 \`revalidate\` 时间，可以拦截高并发流量并直接利用在生命周期内所存续的 HTML 缓存。

\`\`\`typescript
import React from 'react';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default async function CommentsSection({ videoId }: { videoId: string }) {
  const res = await fetch(\`http://api-service:8080/api/videos/\${videoId}/comments\`, {
    next: { revalidate: 60 } 
  });
  const comments: Comment[] = await res.json();
\`\`\`

### 2. 服务端视图组装
将遍历与计算在服务端展开。

\`\`\`tsx
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">网友评论 ({comments.length})</h2>
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>用户 {c.userId}</span>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-800">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
\`\`\`

## 原理：Server Components 体积零增加特性
在过往架构中，引入繁重业务依赖库（例如重型的时间格式化或 Markdown 解析库）会极大影响下发至浏览器的 Bundle size。\nRSC 确保所涉及的特定服务端代码永远不被下传至客户端。因此组件无论在内部引入何种复杂依赖以达成生成目标，这部分体积对用户的加载代价始终为零。`
  },
  {
    id: 'fe-3-3', type: 'frontend',
    title: '课程 3.3：独立架构与互动机制',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 3,
    instructions: `# 利用独立架构结合乐观更新策略

## 业务上下文
在基于 Server Components 构筑好的静态内容中，必须加入动态交互（如点赞按钮、评论输入）。独立架构（Islands Architecture）允许开发者在静态渲染的 HTML 文档上穿插独立的互动组件区域。

## 代码解析

### 1. 申明 Client Component
\`'use client'\` 指令是一个界定声明，它告知打包系统该组件逻辑中包含类似于状态挂载 \`useState\` 或是浏览器事件绑定等客户端专属 API。它将被作为客户端侧 JavaScript 单独分发并在 Hydration 期间恢复交互能力。

\`\`\`tsx
'use client';

import { useState } from 'react';

interface LikeButtonProps {
  videoId: string;
  initialLikes: number;
}
\`\`\`

### 2. Optimistic UI (乐观更新) 模式
乐观更新模式指组件发送后端请求时，假定行为将总是成功并即刻反馈于视图层，而无需等待繁琐的网络验证结束，极大的削减了用户的交互体感延迟。

\`\`\`tsx
export function InteractiveLikeButton({ videoId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await fetch(\`/api/videos/\${videoId}/like\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('jwt')}\` }
      });
    } catch (e) {
      // 网络请求回撤回退机制
      setIsLiked(isLiked);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      alert('操作失败');
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={\`font-bold py-2 px-6 rounded-full transition-transform active:scale-95 \${\n        isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'\n      }\`}
    >
      {isLiked ? '已赞' : '点赞'} {likes.toLocaleString()}
    </button>
  );
}
\`\`\`

## 架构准则
在 Next.js 的服务端客户端渲染生态中，请遵循基本定律：**服务端组件能引入客户端组件作为末端，但客户端组件严禁载入不含客户端声明的服务端组件。** 这也是由于服务端环境资源隔离的原因。`
  },
  {
    id: 'fe-4-1', type: 'frontend',
    title: '课程 4.1：构建看板布局',
    category: '模块4：SaaS 洞察看板', track: '前端架构',
    moduleNumber: 4, lessonNumber: 1,
    instructions: `# 掌握 CSS Grid 定位技巧构建大屏体系

## 业务上下文
构建数据展示型的统一监控台界面是复杂管理系统的核心工作之一。二维网页格系统通常选用 **CSS Grid** 而不仅依靠一维流式的 flexbox 进行整体框架层支撑。

## 代码排版逻辑

### 1. KPI 状态原子组件：StatCard
抽象底层状态面板展示信息作为公共原子组件。使用通用属性封装数值表现与外在 UI 模型。

\`\`\`tsx
import React from 'react';

interface StatProps {
  title: string;
  value: number | string;
  trend: number;
  info: string;
}

const StatCard = ({ title, value, trend, info }: StatProps) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col shadow-sm relative overflow-hidden">
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-extrabold text-[#202124]">{value}</div>
    
    <div className="mt-4 flex items-center justify-between">
      <span className={\`text-xs font-bold \${trend > 0 ? 'text-green-500' : 'text-red-500'}\`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% 从上周
      </span>
      <span className="text-xs text-gray-400">{info}</span>
    </div>
    
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-blue-500 opacity-5 rounded-full blur-2xl"></div>
  </div>
);
\`\`\`

### 2. 构建核心 CSS Grid 网格骨架
**\`grid-cols-1 md:grid-cols-2 xl:grid-cols-4\`** 这是经典的 Mobile First （移动端优先）自适应定义原则：在窄屏下表现为 1 排跨度，触达 \`md\` 宽度尺寸界限时排开为并列的对称 2 列，最终向宽大荧幕扩张成为满额包含 4 槽并行体系的呈现态。

\`\`\`tsx
export default function DashboardGrid() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">数据中心</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="日均流量数" value="2,405,119" trend={12.5} info="过去24小时" />
        <StatCard title="缓存利用率" value="98.2%" trend={0.4} info="缓存缺失率较低" />
        <StatCard title="新增账号数" value="14,233" trend={-2.1} info="包含部分社交登录" />
        <StatCard title="系统异常" value="0" trend={0} info="运转正常" />
      </div>
    </div>
  );
}
\`\`\`

## 原理概括
借助 \`display: grid\` 所声明建立的原生二维空间框架内，排版系统会生成具有轨道定位并自带内部隔离空间 BFC (Block Formatting Context) 特性的格子从而极大限度防止外部元素的溢出挤压崩溃连锁反应现象产生。`
  },
  {
    id: 'fe-4-2', type: 'frontend',
    title: '课程 4.2：可视化实时数据',
    category: '模块4：SaaS 洞察看板', track: '前端架构',
    moduleNumber: 4, lessonNumber: 2,
    instructions: `# 构建基础 SVG 图表基元

## 业务上下文
在应对体量微弱但视觉需求强烈的实时数据线谱（Sparklines）展现阶段时，过度引入超大体量图形算法依赖如 ECharts，极易增添工程额外编译负担。
通过使用具备轻量原生特性的 **SVG** (可缩放矢量图形) 等基础数学工具与组件集成化结合便能有效满足数据直观反应效果。

## 代码解析

### 1. 业务坐标尺寸收缩推导
核心逻辑是对收束范围内的极差进行百分比转化投射：采集数组内最高下限基线获取对应值在 Y 轴像素尺度的占有率。

\`\`\`tsx
import React from 'react';

interface LineChartProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = '#4285F4' }: LineChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const height = 40;
  const width = 100;
\`\`\`

### 2. SVG 原生 Path 指令字符串生成
在 SVG 内建立矢量坐标描述路径依靠 \`M\` (Move To, 直向移动起点)，以及连线节点指令 \`L\` (Line To, 指定划线抵达位置)。配合 Array 函数即可轻松实现。

\`\`\`tsx
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return \`\${x},\${y}\`;
    })
    .join(' L ');

  return (
    <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-10 overflow-visible">
      <path
        d={\`M \${points}\`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm transition-all"
      />
    </svg>
  );
}
\`\`\``
  },
  {
    id: 'fe-5-1', type: 'frontend',
    title: '课程 5.1：引入 Axios 拦截器',
    category: '模块5：集成与发布', track: '前端架构',
    moduleNumber: 5, lessonNumber: 1,
    instructions: `# 建立请求管理代理基准

## 业务上下文
面对多组件间对于需要请求校验后端 API 的重复鉴权调用开销，以及由于超时状态而诱发的大规模重构隐忧。
统一为底层的发送与传出执行设定统一出海防范规则 —— **Axios 拦截器** 是必争的框架最佳实践节点。

## 代码部署体系

### 1. 底层拦截全局实例化
锚定所有的通用前置配置。

\`\`\`typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});
\`\`\`

### 2. Request 控制流处理
请求发出时的回调会拦截住本次 \`config\` 参数并为所有网络事务载入规范鉴权内容头标（如 OAuth 标准内的 Header Authorization）。

\`\`\`typescript
apiclient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
\`\`\`

### 3. Response 接收回访管理层
进行静默的数据过滤拦截，若接受由后端服务器发还的不具备鉴权通行权限抛转信号（401 Unauthorized）。强制执行登出并执行本地凭证注销及定向刷新。

\`\`\`typescript
apiclient.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response?.status === 401) {
      console.error('鉴权失效，重新引导登录');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
\`\`\`

## 架构原则分析：Promise Pipeline
拦截器体系实为一种多层次的级联回调阵列（\`promise.then(chain[x], chain[x+1])\`）。这也是为什么在每个钩子的末尾必须存在有效状态如 \`return config\` 或是上抛拦截返回处理，否则流水线调用将出现中断死循环。`
  },
  {
    id: 'fe-5-2', type: 'frontend',
    title: '课程 5.2：实战集成与安全探讨',
    category: '模块5：集成与发布', track: '前端架构',
    moduleNumber: 5, lessonNumber: 2,
    instructions: `# 功能的集成连接与后端实战交融

## 业务上下文
这里进行最终底层认证接口通信模拟的整体交互应用。

## 联调代码结构

### 1. 发起真实登录认证模拟
向指定业务通信的服务器节点发送核心校验凭证，对获取传回数据妥善处置保护于应用域层：

\`\`\`tsx
import React, { useState } from 'react';
import { apiClient } from './apiClient';

export default function AuthGate() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));
  const [profile, setProfile] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const res = await apiClient.post('/auth/login', { username: 'admin', password: 'password' });
      
      const newToken = res.data.token;
      localStorage.setItem('jwt', newToken);
      setToken(newToken);
    } catch (err) {
      alert('服务请求错误或者配置不完整');
    }
  };
\`\`\`

### 2. 纯粹化的后续 API 通信
这部分的组件只需要明确自己拉取内容的所需地址。繁细的携带 JWT 和失败跳转已经在外部被前述拦截器完全吸收掌控：

\`\`\`tsx
  const fetchSecretProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      // 外部重定向已经处理错误
    }
  };

  return (
    <div className="p-10 text-center">
      {!token ? (
        <button onClick={handleLogin} className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow">
          系统请求接驳
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 font-bold">Token 保存有效状态中</p>
          <button onClick={fetchSecretProfile} className="bg-blue-600 text-white px-6 py-2 rounded shadow">
            抓取后端被保护状态内容
          </button>
          
          {profile && <pre className="text-left bg-gray-100 p-4 mt-4 text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
\`\`\`

## 探讨
需要注意的是，存放授权信息（诸如 JWT Token）于前端直接解析的 \`localStorage\` 中是具备被外界脚本（Cross Site Scripting XSS）非法执行夺取其全部内容的隐患和直接风险的。在严紧的安全系统中，常利用设置不可操作标签如 \`HttpOnly\` 属性的高阶 Http Cookie 数据交换等方式隔离拦截越权探针，这也是构建前端高级边界安全不可缺失的部分。`
  }
];
