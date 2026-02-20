import type { Lesson } from '../types';

export const frontendM3M5: Lesson[] = [
  {
    id: 'fe-3-1', type: 'frontend',
    title: '课程 3.1：Next.js SSR 处理视频详情页',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 1,
    instructions: `# 使用 Server-Side Rendering (SSR) 决胜 SEO 战场

## 🎯 业务上下文与我们在做什么？
在传统的 React SPA 中，爬虫抓取到的只有一个孤零零的 \`<div id="root"></div>\`。当用户想把视频分享到微信或 Twitter 时，社交平台的爬虫机器根本不会去执行你的 JS，导致别人看到的分享永远是统一的白板标题“短视频 SaaS”，且没有视频精美封面。

借助 **Next.js** 的服务端渲染 (SSR)，我们将把页面的组装点挪移到我们无比强大的 Node.js 服务器内核里。

![SSR vs CSR Metadata Serialization](/assets/ssr-metadata.png)

## 🔍 代码分步构建

### 1. 生成动态 Metadata (SEO的秘密武器)
这是 Next.js App Router 的 \`generateMetadata\` 钩子。它必定且唯一地运行在**服务端**。在吐出 HTML 流之前，它会去调用 Java API 获取这部视频的数据，把 \`title\`、\`description\` 和开放图谱 (OpenGraph) 缩略图塞进头部。

\`\`\`typescript
import type { Metadata } from 'next';
import VideoPlayer from '@/components/VideoPlayer';

// 💡 动态生成页面的 Meta 标签，这对 SaaS 营销至关重要
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // 这里在 Node.js 服务器端运行
  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);
  const video = await res.json();
  
  return {
    title: \`\${video.title} - 短视频 SaaS\`, // 💡 给爬虫看的
    description: video.description,
    openGraph: { images: [video.thumbnail] } // 💡 在社交媒体分享时的封面图
  };
}
\`\`\`

### 2. 构建服务端 React 组件 (Server Component)
这不是传统的 \`useEffect\` 无限 Loading！这是直接加了 \`async\` 的组件。它挂起等待服务端取回数据，然后渲染为带内容的 HTML 字符串发送到客户端。

\`\`\`tsx
// 💡 Next.js 服务端组件渲染页面 HTML
export default async function VideoPage({ params }: { params: { id: string } }) {
  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);
  const video = await res.json();

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
      {/* 💡 发送完整的包含 Video DOM 的 HTML 回到终端浏览器 */}
      <VideoPlayer url={video.url} />
    </main>
  );
}
\`\`\`

## 🧠 底层原理剖析：SSR 生命周期与 Hydration
**Server-Side Rendering (SSR) 脱水/注水流**：
Node 端在毫秒内跑一遍 React（这叫**脱水 Dehydrate**，把数据固化在静态 HTML 木乃伊体里）。浏览器立刻展示网页，用户看到了精美的页面，这就是为什么**白屏时间（FCP）极短**的原因。

这之后，JS 执行引擎下载 React 核心并遍历 DOM，为其挂载上事件神经系统（\`onClick\`...）。这一步称之为 **Hydration（注水复苏）**。自此，静态骨架重获新生变成动态应用！`
  },
  {
    id: 'fe-3-2', type: 'frontend',
    title: '课程 3.2：React Server Components 处理超长评论',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 2,
    instructions: `# RSC (React Server Components)：前端性能的核聚变

## 🎯 业务上下文与我们在做什么？
设想一部爆款视频下方有一百万条精彩网友评论。要把包含 10MB 的文本全量发给一台只有极少内存的老旧手机上运行的 JS，势必导致浏览器 OOM（内存溢出）强行闪退。

我们要利用 **RSC**，在企业级的八十核超级服务器上，把这百兆级的纯文本瞬间拼接为**极简的 HTML** 再下发给手机客户端。

![RSC Server Generation vs Client Hydration](/assets/rsc-diagram.png)

## 🔍 代码拆解：在后端的 React 战场

### 1. 设置 ISR 缓存拦截暴走流量
在 Next.js 的 App Router 目录中，任何没有打上 \`'use client'\` 烙印的组件都是 Server Component。当 \`fetch\` 携带着 \`next: { revalidate: 60 }\` 的配置时，如果同时有大 V 直播 10 万人并发访问该页面，除第一人外，后面一分钟内所有的用户都不会去打扰 Spring Boot 系统，Node.js 直接使用它刚刚在内存快照中缓存生成的静态极薄 HTML 挡住潮水。

\`\`\`typescript
// 💡 注意：默认情况下，Next.js App Router 里的所有组件都是 RSC
import React from 'react';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

// 💡 这是一个 async 组件，只有在服务端才能这么写
export default async function CommentsSection({ videoId }: { videoId: string }) {
  // 💡 在企业级集群中，这个 fetch 走的是内网，毫秒级延迟
  const res = await fetch(\`http://api-service:8080/api/videos/\${videoId}/comments\`, {
    next: { revalidate: 60 } // 💡 ISR 缓存，每 60 秒才真正去后端查一次
  });
  const comments: Comment[] = await res.json();
\`\`\`

### 2. 只产生 HTML 的极致剪裁
将上万条评论利用服务器多核并发展示：

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

## 🧠 底层原理：Server Components 真正的神迹在哪？
**零体积侵入（Zero Bundle Size）**：
在以往，如果你引入一款重达 5MB 的日期转换库 \`Moment.js\`，这 5MB 的库最终都难逃被强行打包进下发给用户的 \`chunk.js\` 中。
但由于 **RSC 永远不会穿越网线抵达客户端（客户端只接收纯纯 HTML 产物）**！这意味着你在服务器侧引入 10 个几百兆分析文本过滤敏感词的怪兽包依赖库，前端也是毫无感知体积依然为 0 的！你不仅保住了手机电量，还取得了服务器内网级别的超级数据存取运算。`
  },
  {
    id: 'fe-3-3', type: 'frontend',
    title: '课程 3.3：岛屿架构与互动点赞',
    category: '模块3：Next.js 与服务端渲染', track: '前端架构',
    moduleNumber: 3, lessonNumber: 3,
    instructions: `# 混合动力：岛屿架构与 Optimistic UI

## 🎯 业务上下文与我们在做什么？
如前两节课所述，我们的详情页都已经被 RSC 在服务端早早铸造成了极速渲染的静态“汪洋大海（Sea of Static HTML）”。
但是网页绝对不能缺失生机勃勃的互动！当你点击右下角“点赞按钮”时，它要执行弹跳动画，向外侧后端 Kafka 队列深埋写库命令。这就好像在这片静态海洋上，漂浮着几座高度活跃的**“岛屿”（Islands Architecture）**。

![Islands Architecture Overview](/assets/islands-architecture.png)

## 🔍 建设岛屿

### 1. 划定 Client Boundary
**\`'use client'\` 指令**是明确的分界碑。它的存在标志着告诉 Next 打包体系：把这段组件相关逻辑抽离，**向浏览器里实际分发 JS** 并赋予它 \`useState\` 互动复苏。

\`\`\`tsx
// 💡 这行代码是界限：告诉 Next.js 这里需要发送 React JS 代码到浏览器
'use client';

import { useState } from 'react';

interface LikeButtonProps {
  videoId: string;
  initialLikes: number;
}
\`\`\`

### 2. Optimistic UI (乐观更新) 与错误回滚 (Rollback)
在 \`handleLike\` 中，我们根本不等由于网络跨洲所需可能达的一秒漫游验证期！我们*假定世界一直美好*，立刻自己用局部的 \`setLikes\` 让前端数字跳动，这给予了如丝般顺滑极爽的反馈。这是让高级 SaaS 用户痴迷的关键。这叫**乐观更新**。如果出错了呢？我们在 \`catch\` 里进行了无情回溯。

\`\`\`tsx
export function InteractiveLikeButton({ videoId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    // 💡 乐观更新：不等后端返回，立刻把数 +1 变红，给用户极速的反馈体验
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      // 💡 下发给后端，后端会把这个行为抛入 Kafka 消息队列异步持久化
      await fetch(\`/api/videos/\${videoId}/like\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('jwt')}\` }
      });
    } catch (e) {
      // 💡 如果请求失败，必须回滚刚才的乐观状态
      setIsLiked(isLiked);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      alert('点赞失败，请检查网络');
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={\`font-bold py-2 px-6 rounded-full transition-transform active:scale-95 \${\n        isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'\n      }\`}
    >
      {isLiked ? '❤️ 已赞' : '🤍 点赞'} {likes.toLocaleString()}
    </button>
  );
}
\`\`\`

## 🧠 底层逻辑法则
在此防线体系下必须建立一条铁律：**服务端组件能 Import 客户端组件，但客户端组件永远禁止反向载入服务端组件！**。因为这会把服务端的内网特权与安全性彻底暴露并崩溃。我们需讲求模块抽离技巧，在叶子节点处互动点缀汪洋大海！`
  },
  {
    id: 'fe-4-1', type: 'frontend',
    title: '课程 4.1：构建 SaaS 运营数据看板',
    category: '模块4：SaaS 洞察看板', track: '前端架构',
    moduleNumber: 4, lessonNumber: 1,
    instructions: `# 掌控大局：使用 CSS Grid 构建现代企业管理大屏网格

## 🎯 业务上下文与我们在做什么？
所有企业系统的命门都系于一块巨型的实时监控看板（Dashboard）上！运营随时需要观测服务器的总消息负荷以及各个报表流水（KPI）。
我们要彻底抛弃嵌套十几层的传统一维 \`flexbox\` 的笨拙去设计外布局。本节课要带你彻底领略二维引擎：**CSS Grid** 与 Tailwind 流畅极其精密的融合。

## 🔍 代码拆解：上帝视角排盘

### 1. 原子化 KPI 组件：StatCard
我们将组件隔离接收核心指标（比如趋向 \`trend\`）反射出颜色的细碎细节。这能释放 Dashboard 外层的宏观管控精力。配合阴影框等做出现代科技风的质感。

\`\`\`tsx
import React from 'react';

interface StatProps {
  title: string;
  value: number | string;
  trend: number;
  info: string;
}

// 💡 原子组件：SaaS 仪表盘中到处可见的指标卡片
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
    
    {/* 💡 装饰性的色块：右上角增加界面呼吸感与悬浮光晕高级感 */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-[#4285F4] opacity-5 rounded-full blur-2xl"></div>
  </div>
);
\`\`\`

### 2. 神级响应系统 —— CSS Grid 注入
**\`grid-cols-1 md:grid-cols-2 xl:grid-cols-4\`** 这是 Mobile First 的巅峰灵魂之作：
告诉浏览器狭窄带屏幕下上下折叠一柱擎天（默认 1 行横跨）；当中宽 iPad 并拢时向左右伸拉成 2 栏（md）；当全尺寸桌面巨幕伸展时，立刻铺展开 4 列并行的大阵列展示（xl 取决于 Tailwind Breakpoints 断点）！不用再写无穷无尽媒体查询规则包了。

\`\`\`tsx
export default function DashboardGrid() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">运营中控台 / KPI</h1>
      
      {/* 💡 响应式 Grid 核心魔法 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="今日总点赞请求 (Kafka)" value="2,405,119" trend={12.5} info="过去24小时" />
        <StatCard title="视频热点命中率 (Redis)" value="98.2%" trend={0.4} info="缓存 Miss 率 <2%" />
        <StatCard title="新增注册用户" value="14,233" trend={-2.1} info="包含微信/手机号" />
        <StatCard title="Kafka DLQ 堆积异常" value="0" trend={0} info="系统运行健康" />
      </div>
    </div>
  );
}
\`\`\`

## 🧠 底层原理：Box Model 机制与 BFC 重绘防污染
以住的 Float 是漂浮脱轨流体力学，而 Flexbox 是为了处理弹性排队的单线系统。在构建全视角仪表盘网格这种交错平铺二维空间定位结构面前，一维模型常常搞出灾难塌陷漏洞。
CSS Grid 是引擎提供原生的一个最正规的**二维排盘法阵**。声明它是 \`display: grid\` 的瞬息，引擎会自动隐居生成四维骨架槽。任何物品只用投于槽位之中！由于其完全内部隔离 BFC 的机制，彻底断绝外部一切元素挤压崩塌连锁反应的隐患。这是真正的终极桌面应用武器。`
  },
  {
    id: 'fe-4-2', type: 'frontend',
    title: '课程 4.2：可视化实时数据',
    category: '模块4：SaaS 洞察看板', track: '前端架构',
    moduleNumber: 4, lessonNumber: 2,
    instructions: `# 纯手工绘制数据结界：SVG 数据驱动图谱

## 🎯 业务上下文与我们在做什么？
仅仅只是为了在左上角边栏画一个不足两指宽的迷你趋势起伏（Sparkline），你甚至强插包拉扯了体积巨大恐龙时代的商业 \`ECharts\` 或 \`D3.js\` 进你的生产依赖！在 SaaS 中你不能肆意引入那些超级组件包而拖重项目的脚步。我们将使用浏览器自带底层最轻量古老强大的原生矢量核心：**SVG**（可缩放矢量图形），手敲实现图表组件以展现极致编码素描之美妙。

## 🔍 代码逐段解析与映射法则

### 1. View Mapping 归一化提取极点差值
如果获取的随机大数据流如 \`[1, 54, ... 989]\`。将其实时缩减塞入一个尺寸固定 \`100x40\` 的网框里，就是所谓的绝对比例归一化数学思想：取高低差极差，然后除以基数乘以实际显示容器长度比例大小（View Mapping 实战）。

\`\`\`tsx
import React from 'react';

interface LineChartProps {
  data: number[]; // e.g. [10, 20, 15, 40, 30]
  color?: string;
}

// 💡 一个轻量、无外部依赖的 SVG 微缩折线图 (Sparkline)
export function Sparkline({ data, color = '#4285F4' }: LineChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const height = 40;
  const width = 100;
\`\`\`

### 2. 生生代演：SVG 代码信标语言组装
在 SVG 里我们发出给浏览器的绝对绘图“代码信标”：
\`M 0,39 L 25,10 L 50,40...\` 其中 \`M\` 代表移笔移动到此处初始原点 (Move To)，\`L\` 指画一条直线穿梭切往何处 (Line To)。通过原生 JS \`Array.map().join(' L ')\` 就生成了一条丝滑串起的代码指引路基。

\`\`\`tsx
  // 💡 将数组中的值，映射到 x/y 坐标上生成一段连续路径
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
\`\`\`

## 🧠 原理：SVG 无限高清缩放与 Retina 抗锯齿为什么没有马赛克？
**Canvas (点阵画家)**：在画布上靠极高的像素格子堆出来的图形。在极致的高清屏幕或当无限推近时，强制填充必然生成可悲恶心的大马赛克粗糙犬牙。
**SVG (精妙几何家)**：它是基于“物理方程表述”！无论被放映到百倍屏幕广场大尺寸液晶球上，其指令依然只是数学法则！显卡实时将其用矢量方程微分复原演算成当时屏幕最高阶锐化的点阵图呈现！永远无损锐利，不可阻拦。`
  },
  {
    id: 'fe-5-1', type: 'frontend',
    title: '课程 5.1：网络核心设施与 Axios 拦截器',
    category: '模块5：前后端全栈集成', track: '前端架构',
    moduleNumber: 5, lessonNumber: 1,
    instructions: `# 打造全链路网络基建防波堤与暗桩

## 🎯 业务上下文与我们在做什么？
如果我们有成百上千个页面都在拉取不同的后端 API（如获取用户头像、消息通知等），那大家都要写一堆判断令牌、添加 Head 请求头、并监控如果后端一旦 401 踢人超时的判断。这必定引发海量失误及重灾区维护负担。
我们必须在一切前端系统要往后端发起握手请求的出海关卡，建立全系统强制代理海关：**Axios 拦截器**。这层护盾让上面的无数傻瓜组件能够毫无心理负担地取用资源。

![Axios Interceptors Architecture](/assets/axios-interceptors.png)

## 🔍 代码分步部署

### 1. 源头锚定 (The Global Client Instance)
\`axios.create\` 将所有的长链接超时基础与基准位置配置死锁于一点。

\`\`\`typescript
import axios from 'axios';

// 💡 建立统一兵站：利用 Vite 的代理，我们将向同域名的 /api 发送所有请求 
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});
\`\`\`

### 2. 出港拦截强攻战术 (Request Interceptor)
在飞向网关的上一瞬完成突击挂载包裹 JWT 魔术前缀的指令操作。

\`\`\`typescript
// 💡 请求拦截器：像武警安检，在任何请求冲出浏览器之前截留它，打上身份烙印
apiclient.interceptors.request.use(
  (config) => {
    // 💡 从 localStorage 提取命脉令牌
    const token = localStorage.getItem('jwt');
    if (token) {
      // 💡 被 OAuth 认证核心框架强制要求的 Bearer 魔术字标识
      config.headers['Authorization'] = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
\`\`\`

### 3. 入境安保与静默流产 (Response Interceptor)
后端把我们拦住给了个 401 Unauthorized，立刻就地处决其非法状态令牌切回登录，上方的数百名调用者连错误原因是什么都不配知道就已经回到了大堂。

\`\`\`typescript
// 💡 响应拦截器：不管上层业务在干嘛，在这里先过滤阻截所有的过期重灾情况！
apiclient.interceptors.response.use(
  (response) => response, // 正常 200 就畅通放行
  (error) => {
    if (error.response?.status === 401) {
      // 💡 401 说明用户越权或者令牌朽烂！我们立刻把此劣迹抹掉将他提送滚出客栈大门！
      console.error('鉴权中心宣告失败，将由保卫科遣送登录...');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
\`\`\`

## 🧠 Js 拦截器与 Promise 闭门造车流 (Pipeline Pattern) 原理
这本质是由许许多多级联回调连绵延挂组成的巨大承诺反应链！
\`promise = promise.then(chain[x], chain[x+1])\`。
由于它是 \`Array\` 链队叠组合出的结构：这就解释了你写该钩子时为啥在底部必有一句死令法则 \`return config\` 或者 \`return response\`。你若不把这棒子完好如初抛给下一顺位的拦截人，整个接力就会当空折断从而坠毁报错抛死整个全局通讯局域网！`
  },
  {
    id: 'fe-5-2', type: 'frontend',
    title: '课程 5.2：实战前后端闭环联调',
    category: '模块5：前后端全栈集成', track: '前端架构',
    moduleNumber: 5, lessonNumber: 2,
    instructions: `# 启程破晓全线联调：贯穿天际全栈神界

## 🎯 业务上下文与我们在做什么？
在整座孤岛暗自生长到了最高顶端的一课！这被赐名为 \`AuthGate\` 的门将组装出战迎接前线的检验轰击。在此我们要在之前做出的那个极其强劲的 Axios 护心防卫锁里。验证通过 Spring Security 铜墙铁壁最终跨向 Java API 服务器的腹心深渊，一瞬间如果返回取来了后端禁区那深层密档时，宣告全栈联通成闭环！

## 🔍 代码终点解剖

### 1. 前线特种征调进攻司令塔
这便是真实业务展现页面代码。没有任何冗长而低迷的代码附庸。直接叫板 Spring Boot 大军核心发起攻擂：

\`\`\`tsx
import React, { useState } from 'react';
import { apiClient } from './apiClient';

export default function AuthGate() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));
  const [profile, setProfile] = useState<any>(null);

  const handleLogin = async () => {
    try {
      // 💡 发起硬核的真实网络连接：调用 Spring Boot 的 LoginController 击溃它拿回钥匙
      const res = await apiClient.post('/auth/login', { username: 'admin', password: 'password' });
      
      const newToken = res.data.token;
      localStorage.setItem('jwt', newToken);
      setToken(newToken);
    } catch (err) {
      alert('后端服务未启动或用户名错误！');
    }
  };
\`\`\`

### 2. 收割者展示战绩
高度抽象。我们不管如何过验证和带锁！一切全部依赖底层封装过的铁壁拦截大军拦截。调用代码简直纯净得令人心醉。

\`\`\`tsx
  const fetchSecretProfile = async () => {
    try {
      // 💡 这里不再需要拼凑那一层层臭长的 Headers 了，底层安检器暗自保驾护送我们拿钱。
      const res = await apiClient.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      // 有任何错乱早被拦截踢送走了
    }
  };

  return (
    <div className="p-10 text-center">
      {!token ? (
        <button onClick={handleLogin} className="bg-[#34A853] text-white px-8 py-3 rounded-full font-bold shadow-md">
          全链路冲刺一键登录
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 font-bold">✓ Token 保存在浏览器深库</p>
          <button onClick={fetchSecretProfile} className="bg-blue-600 text-white px-6 py-2 rounded shadow">
            抓取后端重装防护的用户资料特档
          </button>
          
          {/* 这里只展示提取回的战果 */}
          {profile && <pre className="text-left bg-gray-100 p-4 mt-4 text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
\`\`\`

## 🧠 XSS 的浩劫与架构防线结语
许多前端新手会将此绝密钥匙放于 \`localStorage\` 这个地方，他们殊不知这就如同裸奔的儿童游荡在那荒郊！此地非常容易被他人用名为 XSS (Cross Site Scripting 跨站非法注入神引攻击) 的远古流氓剧本将代码偷灌于如系统内的随便哪些展示文章板区。一旦其他正常人划到，恶毒系统潜入这库并光速卷拿这令旗通往外站传给他们以你名义操控肆虐！
\n大型生产云级防波堤是将数据放置入 Cookie 深心处，依靠在 Java 中设置强印封条打上 \`HttpOnly\` 绝对阻截客户端窃听（使得无上的 JS 原生抓取全部失忆）。在进阶与系统高级进化之中您必须不断攀爬来完善全维屏障结界，为您的项目与用户建起一座极度森冷庞大的帝国安防之山！`
  }
];
