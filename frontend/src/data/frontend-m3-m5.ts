import type { Lesson } from '../types';

export const frontendM3M5: Lesson[] = [
    {
        id: 'fe-3-1', type: 'frontend',
        title: '课程 3.1：Next.js SSR 处理视频详情页',
        category: '模块3：Next.js 与服务端渲染', track: '前端架构',
        moduleNumber: 3, lessonNumber: 1, language: 'typescript',
        startingCode: '',
        instructions: `# 使用 Server-Side Rendering (SSR) 决胜 SEO 战场

## 🎯 业务上下文与我们在做什么？
在传统的 React 单页应用 (SPA) 中，当你右键点击网页选择“查看网页源代码”时，你会悲哀地发现，整个 HTML 里只有一个孤零零的 \`<div id="root"></div>\`。所有的内容都是在几十毫秒后靠着庞大的 JavaScript 包（Bundle）在浏览器端动态绘制出来的。
这种架构对于“短视频 SaaS 平台”是致命的。当用户想要把某个精彩搞笑视频（如 \`/video/123\`）分享到微信聊天框、Twitter 或者即刻上时，这些社交平台的爬虫机器根本不会去执行你的 JS。它们只抓取死板的 HTML 源文件中的 \`<meta>\` 标签。结果就是，别人看到的分享永远是统一的白板标题“短视频 SaaS”，且没有对应视频的精美封面。
借助 **Next.js** 的服务端渲染 (SSR)，我们将把页面的组装点从用户的手机浏览器，前置挪移到我们无比强大的 Node.js 服务器内核里。

## 🔍 代码深度解析
- **\`generateMetadata\`**：这是 Next.js App Router 暴露出的特殊生命周期钩子。它必定且唯一地运行在**服务端**。在真正的向浏览器吐出 HTML 流之前，它会去内部调用 Java API 获取这部视频的数据，把提取出来的 \`title\`、\`description\` 和专供社交分享的封面图（OpenGraph/OG 图）硬生生注入到 \`<head>\` 被爬虫瞬间读取的最外层。
- **\`async function VideoPage\`**：在传统的纯前端 React 中，我们绝不可能直接在函数式组件上标注 \`async\` 并在它主体里进行 \`await fetch\` （如果不借助乱七八糟的外部库）。因为那是违背同步纯函数调和定律的。而在这里，它是合法的！因为此时它是跑在 Node.js 环境中，在数据没回来前，它就在服务器挂起等待，拿到数据后直接拼装出满载数据的一串漂亮 HTML 发下云端。

### 🧠 底层原理剖析：SSR 生命周期与 Hydration 脱水/注水流
**Server-Side Rendering (SSR) 到底是怎么做的？**
当用户在浏览器输入网址按下回车。请求直达 Next.js / Node.js 服务器。Node 端会在毫秒内跑一遍你的 React 组件（这叫脱水 Dehydrate，把数据固化在毫无交互的静态 HTML 木乃伊体里）。浏览器光速收到了这份带着满屏幕内容的 HTML，所以**白屏时间（FP / FCP）极短**，用户立刻看到了精致排布好的含有视频和评论的页面。
但是这时候，你如果点击上面的“重播按钮”，网页是不会有任何反应的！因为此时的页面依然只是毫无灵魂的骨架。等过了几百毫秒，隐藏在背后的 JS 执行引擎才把 React 框架的核心 JS 下载完毕并在浏览器运行，React 会遍历这份冰冷的 DOM，为其挂载上 \`onClick\`、\`onMouseOver\` 等事件神经系统。这一步称之为 **Hydration（注水复苏）**。自此，静态骨架才终于重获新生变成动态应用！\n\n## 📝 完整参考代码\n\`\`\`typescript\nimport type { Metadata } from 'next';
import VideoPlayer from '@/components/VideoPlayer';

// 💡 动态生成页面的 Meta 标签，这对 SaaS 营销至关重要
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // 这里在 Node.js 服务器端运行
  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);
  const video = await res.json();
  
  return {
    title: \`\${video.title} - 短视频 SaaS\\n\`\`\``,
        targetCode: `import type { Metadata } from 'next';\nimport VideoPlayer from '@/components/VideoPlayer';\n\n// 💡 动态生成页面的 Meta 标签，这对 SaaS 营销至关重要\nexport async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {\n  // 这里在 Node.js 服务器端运行\n  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);\n  const video = await res.json();\n  \n  return {\n    title: \`\${video.title} - 短视频 SaaS\`, // 💡 给爬虫看的\n    description: video.description,\n    openGraph: { images: [video.thumbnail] } // 💡 在社交媒体分享时的封面图\n  };\n}\n\n// 💡 Next.js 服务端组件渲染页面 HTML\nexport default async function VideoPage({ params }: { params: { id: string } }) {\n  const res = await fetch(\`http://localhost:8080/api/videos/\${params.id}\`);\n  const video = await res.json();\n\n  return (\n    <main className="max-w-4xl mx-auto p-4">\n      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>\n      {/* 💡 发送完整的包含 Video DOM 的 HTML 回到终端浏览器 */}\n      <VideoPlayer url={video.url} />\n    </main>\n  );\n}\n`,
        comments: [
            { line: 5, text: '// 💡 动态提取参数并请求后端，产出精准 SEO 内容' },
            { line: 11, text: '// 💡 让每个视频页在微信里都有独立的封面与标题' },
            { line: 24, text: '// 💡 这段 HTML 会被爬虫完美解析' },
        ],
    },
    {
        id: 'fe-3-2', type: 'frontend',
        title: '课程 3.2：React Server Components 处理超长评论',
        category: '模块3：Next.js 与服务端渲染', track: '前端架构',
        moduleNumber: 3, lessonNumber: 2, language: 'typescript',
        startingCode: '',
        instructions: `# RSC (React Server Components)：前端性能的核聚变

## 🎯 业务上下文与我们在做什么？
在传统的单页 React 中。我们经常能看到这样的代码：请求来了，由于没有数据先显示个 \`Loading...\`，2秒后请求好了，\`setData\` 从而再刷新回带几千条数据的 \`List\`。
设想一部千万点击量的爆款视频，下方有一百万条精彩的网友评论。如果按照老路子，要把包含 10M 文本的巨型 JSON 全量发给只有 4GB 内存的老年机，用手机 JS 去将这个庞然大物解析并灌入 React 的繁重节点树中，结果只有一个：直接导致手机浏览器内存溢出（OOM）强行闪退崩断。我们要利用 **RSC**，在企业级的八十核超级服务器上，把这百兆级的纯文本瞬间拼接为极简 HTML 给手机发过去。

## 🔍 代码深度解析
- **无 \`'use client'\` 的默认组件**：在 Next.js 的 App Router 目录中，任何没有打上 \`'use client'\` 开头烙印的组件，都是且只能是服务器组件（Server Component）。
- **\`next: { revalidate: 60 }\` 的内网暴击与缓存穿透封锁**：在服务器里跑的 \`fetch\`，请求指向的是微服务内网的那个 \`http://api-service:8080\`，内网带宽高且无需外网握手，毫秒即发。更恐怖的是这个对象可以指定缓存（ISR）。如果同时有大 V 直播 10 万人访问这个页面，除了第一个倒霉蛋需要等服务器去 Java 真正要数据拼装耗时（哪怕是十几毫秒），接下去的一分钟内的 99,999 个人，Node.js 连发都不发包，直接将缓存在内存中的纯纯的渲染好的最终态 HTML 无限制瞬发出去。这才是海量高并发架构。

### 🧠 底层原理剖析：Server Components 真正的神迹在哪？
**零体积侵入（Zero Bundle Size）**：
在以往，如果你要在页面上引入一款重达 5MB 的日期转换库 \`Moment.js\` 去处理上百条评论的时间排版。无论是在使用 CSR 还是前课提及的传统 SSR 模式里，这 5MB 的库最终都难逃被强行打包进下发给用户的 \`chunk.js\` 中。
但是 RSC 打破了这个物理法则！
\nRSC 因为被宣判永远待在 Server 里，它永远不会穿越网线抵达客户端。客户端只接收它**执行过后的纯纯 HTML 产物**。
于是，你在这 RSC 里尽情挥斥方遒——引哪怕 10 个体积几十兆的极其复杂的 Markdown To HTML 重重叠叠各种怪异包用于安全过滤用户那上百万乱七八糟的奇怪输入。对于拿老旧千元安卓机的最终受众来说：这颗 \`CommentsSection\` 服务组件产生给他们网路的负载量仅仅是极少轻微的几个带有 p 标签。你不仅保住了电量，保住了网速，也保住了生命力。\n\n## 📝 完整参考代码\n\`\`\`typescript\n// 💡 注意：默认情况下，Next.js App Router 里的所有组件都是 RSC
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
  const res = await fetch(\`http://api-service:8080/api/videos/\${videoId}/comments\\n\`\`\``,
        targetCode: `// 💡 注意：默认情况下，Next.js App Router 里的所有组件都是 RSC\nimport React from 'react';\n\ninterface Comment {\n  id: string;\n  userId: string;\n  content: string;\n  createdAt: string;\n}\n\n// 💡 这是一个 async 组件，只有在服务端才能这么写\nexport default async function CommentsSection({ videoId }: { videoId: string }) {\n  // 💡 在企业级集群中，这个 fetch 走的是内网，毫秒级延迟\n  const res = await fetch(\`http://api-service:8080/api/videos/\${videoId}/comments\`, {\n    next: { revalidate: 60 } // 💡 ISR 缓存，每 60 秒才真正去后端查一次\n  });\n  const comments: Comment[] = await res.json();\n\n  return (\n    <section className="mt-8">\n      <h2 className="text-xl font-semibold mb-4 border-b pb-2">网友评论 ({comments.length})</h2>\n      <div className="space-y-4">\n        {comments.map((c) => (\n          <div key={c.id} className="p-4 bg-gray-50 rounded-lg">\n            <div className="flex justify-between text-sm text-gray-500 mb-2">\n              <span>用户 {c.userId}</span>\n              <span>{new Date(c.createdAt).toLocaleDateString()}</span>\n            </div>\n            <p className="text-gray-800">{c.content}</p>\n          </div>\n        ))}\n      </div>\n    </section>\n  );\n}\n`,
        comments: [
            { line: 12, text: '// 💡 并发与数据直接在服务端组装，不占用手机资源' },
            { line: 15, text: '// 💡 性能关键：一分钟内的所有用户访问都吃这个带静态页面的缓存！' },
            { line: 26, text: '// 💡 发送到浏览器的只有这段纯纯的 HTML，体积极小' },
        ],
    },
    {
        id: 'fe-3-3', type: 'frontend',
        title: '课程 3.3：岛屿架构与互动点赞',
        category: '模块3：Next.js 与服务端渲染', track: '前端架构',
        moduleNumber: 3, lessonNumber: 3, language: 'typescript',
        startingCode: '',
        instructions: `# 混合动力：岛屿架构与 Optimistic UI

## 🎯 业务上下文与我们在做什么？
如前两节课所述，我们的详情页和成百上千条长长的评论区都已经被 RSC 在服务端早早被铸造成为冷冰冰而极速渲染的静态“汪洋大海（Sea of Static HTML）”。
但是在一个网页中，你绝对不能缺失那些星星点点的生机勃勃。右下角那个“爱心点赞按钮”，当你点到它，它要在前端做高频的弹跳动画，立刻变成鲜红，还要触发向外侧后端 Kafka 队列抛请求。静态大海是死板的是无知觉的！只有客户端（Client Components）可以容纳交互！这就好像在这片静态海洋上，漂浮着几座高度活跃充满活火山与生命力的**“岛屿”（Islands Architecture）**。

## 🔍 代码深度解析
- **\`'use client'\` 指令顶示**：这是明确的分界碑。当我们在这里声明这句话不仅意味着它要在这重新启用被 RSC 严密禁止的 \`useState\` / \`onClick\` 等系统机能。也标志着告诉 Next 打包体系：把这段组件有关的逻辑及附庸依赖抽离，**向浏览器里实际分发 JS**，并在注水 Hydration 阶段在这个区域进行生命复苏抢救。
- **乐观更新（Optimistic Update）的艺术**：在 \`handleLike\` 中，我们根本不等由于网络跨越大洲所需可能达 2 秒漫游周期的底端验证回答。而是假定世界一直美好，在刚按下的瞬间，立马自己骗自己地使用局本的 \`setLikes\` 让前端数字跳动，使人获得如丝般顺滑极爽点击反馈。这才是打造让企业为之买单、让用户离不开的高级 SaaS 产品的灵魂心法。
- **被掩盖的回滚处理引擎（Rollback）**：命运并非一直完美，如果 Spring Boot 挂了真的没处理上呢。在 \`catch (e)\` 块内我们极为严谨冷静地做了时光回溯，恢复其为原始面貌，再进行通知补偿。

### 🧠 底层原理剖析：Server - Client 交接边界流控
**不可逆的组件序列包裹**：
在此体系下必须建立一条清晰的上下级物理定律防线：**服务端组件能 Import 并渲染客户端组件，但客户端组件绝对禁止反向载入服务端组件！**。
这是因为如果客户端包裹服务端组件，服务端组件那个只存在于核心业务机房里的环境已经被客户端打穿从而带出了安全隐患以及它不具有 Node.js 特色（如没有 \`fs\` 硬盘读权限模块）自然完全运行不了导致崩溃。这就造成我们在编写根业务树骨架时极其讲求模块抽离技巧，“脏乱差”以及高互动的留守叶子，冰清玉洁负责搬运骨干数据或静态展示的安防在中端，这造就了 Next.js 新型应用的优渥且强硬的心智模型架构图谱。\n\n## 📝 完整参考代码\n\`\`\`typescript\n// 💡 这行代码是界限：告诉 Next.js 这里需要发送 React JS 代码到浏览器
'use client';

import { useState } from 'react';

interface LikeButtonProps {
  videoId: string;
  initialLikes: number;
}

export function InteractiveLikeButton({ videoId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    // 💡 乐观更新：不等后端返回，立刻把数 +1 变红，给用户极速的反馈体验
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      // 💡 下发给后端，后端会把这个行为抛入 Kafka 消息队列异步持久化
      await fetch(\`/api/videos/\${videoId}/like\\n\`\`\``,
        targetCode: `// 💡 这行代码是界限：告诉 Next.js 这里需要发送 React JS 代码到浏览器\n'use client';\n\nimport { useState } from 'react';\n\ninterface LikeButtonProps {\n  videoId: string;\n  initialLikes: number;\n}\n\nexport function InteractiveLikeButton({ videoId, initialLikes }: LikeButtonProps) {\n  const [likes, setLikes] = useState(initialLikes);\n  const [isLiked, setIsLiked] = useState(false);\n\n  const handleLike = async () => {\n    // 💡 乐观更新：不等后端返回，立刻把数 +1 变红，给用户极速的反馈体验\n    setIsLiked(!isLiked);\n    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));\n\n    try {\n      // 💡 下发给后端，后端会把这个行为抛入 Kafka 消息队列异步持久化\n      await fetch(\`/api/videos/\${videoId}/like\`, {\n        method: 'POST',\n        headers: { Authorization: \`Bearer \${localStorage.getItem('jwt')}\` }\n      });\n    } catch (e) {\n      // 💡 如果请求失败，必须回滚刚才的乐观状态\n      setIsLiked(isLiked);\n      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));\n      alert('点赞失败，请检查网络');\n    }\n  };\n\n  return (\n    <button \n      onClick={handleLike}\n      className={\`font-bold py-2 px-6 rounded-full transition-transform active:scale-95 \${\n        isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'\n      }\`}\n    >\n      {isLiked ? '❤️ 已赞' : '🤍 点赞'} {likes.toLocaleString()}\n    </button>\n  );\n}\n`,
        comments: [
            { line: 2, text: '// 💡 激活浏览器的 onClick 与 useState 机能' },
            { line: 17, text: '// 💡 这是 SaaS 用户体验的灵魂：绝不让用户等网络转圈' },
            { line: 28, text: '// 💡 兜底措施：发生意外时把 UI 还原' },
        ],
    },
    {
        id: 'fe-4-1', type: 'frontend',
        title: '课程 4.1：构建 SaaS 运营数据看板',
        category: '模块4：SaaS 洞察看板', track: '前端架构',
        moduleNumber: 4, lessonNumber: 1, language: 'typescript',
        startingCode: '',
        instructions: `# 掌控大局：使用 CSS Grid 构建现代企业管理大屏网格

## 🎯 业务上下文与我们在做什么？
所有企业系统的命门都系于一块巨型的实时监控看板（Dashboard）上！运营妹子必须时刻坐镇监控 Kafka 处理的总消息，因为缓存脱落问题产生的漏点以及核心拉新报表等业务关键数据大盘（KPI）。
我们不再使用乱七八糟嵌套十几层的 \`div\` 结合传统一维 \`flexbox\` 的笨拙去设计外布局。本节课要带你彻底领略原子化框架下的二维上帝引擎：**CSS Grid** 与 Tailwind 流畅且精密的响应体系进行融合碰撞。

## 🔍 代码深度解析
- **\`grid-cols-1 md:grid-cols-2 xl:grid-cols-4\`**：这是 Mobile First（移动端优先）的响应式灵魂之作。你告诉浏览器网格规则如下：如果处于狭窄带鱼屏幕下则全部上下折叠单成列队一柱擎天（默认 1 行横跨到底），当中宽的 iPad 等设备加入时立刻向左右裂变对称拉伸成 2 栏对称结构（md 断点）；当到达巨型桌面监视器宽屏铺展则豪情拉扯开 4 列并行的大阵列展示！其流畅性和精准让人惊叹且只要通过仅仅3个单词！
- **组件原子化拆分：\`StatCard\`**：你不能把这4个长得大同小异几乎全是一样带有发量高光圈与箭头提示的板块卡片生硬去反复手撕4遍长长的嵌套标签结构，那绝非高级工程师所作。要以面向数据封装，接收形参属性（比如趋势 \`trend\` 与 \`info\`）进行条件反射渲染红绿不同指向样式。从而极聚浓缩核心主体，让总网格的架构清爽剔透不可方物。

### 🧠 底层原理剖析：Box Model 机制与 BFC 重绘防污染
**CSS Grid 两维排版的几何引擎究竟是怎么一回事？**
以往统治江湖数十年的 Float，它是在流体脱离布局强行挂浮的，不仅伴临塌方极其可怜还要每次都要忍受去写 \`clear:both\` 进行丑陋弥合打补；而后来 Flex 崛起统一了一维行或者一列间的弹射响应分布比例；但到了构建真正的棋盘网格 Dashboard 面前由于必须在空间坐标里的纵横网度交点上做准确定位他们俩都会造成成吨堆叠的 DOM 冗余去包。
\nGrid 是原生存在渲染环境内部的一个纯**二维布局引擎**。当声明它是 \`display: grid\` 的瞬息，引擎会自动隐居生成由那无数看不见的网格线构筑形成的细胞阵列轨道骨架并在那划分区域。此时任何子物置放时浏览器只需单纯去把它们如填充卡槽按位送入分配好的网格交线轨道内！不会再有以前为了达到此种规整平铺而出现的一大堆乱串或高低塌陷问题（BFC，Block Formatting Context的终极隔离防护边界），这就是其所被尊称 Web CSS 领域最后圣杯的根源。\n\n## 📝 完整参考代码\n\`\`\`typescript\nimport React from 'react';

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
    
    {/* 💡 装饰性的色块：增加界面呼吸感与高级感 */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-[#4285F4] opacity-5 rounded-full blur-2xl"></div>
  </div>
);

export default function DashboardGrid() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">运营中控台 / KPI</h1>
      
      {/* 💡 响应式 Grid：手机上1列，平板2列，极宽桌面4列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="今日总点赞请求 (Kafka)" value="2,405,119" trend={12.5} info="过去24小时" />
        <StatCard title="视频热点命中率 (Redis)" value="98.2%" trend={0.4} info="缓存 Miss 率 <2%" />
        <StatCard title="新增注册用户" value="14,233" trend={-2.1} info="包含微信/手机号" />
        <StatCard title="Kafka DLQ 堆积异常" value="0" trend={0} info="系统运行健康" />
      </div>
    </div>
  );
}
\n\`\`\``,
        targetCode: `import React from 'react';\n\ninterface StatProps {\n  title: string;\n  value: number | string;\n  trend: number;\n  info: string;\n}\n\n// 💡 原子组件：SaaS 仪表盘中到处可见的指标卡片\nconst StatCard = ({ title, value, trend, info }: StatProps) => (\n  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col shadow-sm relative overflow-hidden">\n    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>\n    <div className="text-3xl font-extrabold text-[#202124]">{value}</div>\n    \n    <div className="mt-4 flex items-center justify-between">\n      <span className={\`text-xs font-bold \${trend > 0 ? 'text-green-500' : 'text-red-500'}\`}>\n        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% 从上周\n      </span>\n      <span className="text-xs text-gray-400">{info}</span>\n    </div>\n    \n    {/* 💡 装饰性的色块：增加界面呼吸感与高级感 */}\n    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-[#4285F4] opacity-5 rounded-full blur-2xl"></div>\n  </div>\n);\n\nexport default function DashboardGrid() {\n  return (\n    <div className="p-8 bg-gray-50 min-h-screen">\n      <h1 className="text-2xl font-bold text-gray-900 mb-8">运营中控台 / KPI</h1>\n      \n      {/* 💡 响应式 Grid：手机上1列，平板2列，极宽桌面4列 */}\n      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">\n        <StatCard title="今日总点赞请求 (Kafka)" value="2,405,119" trend={12.5} info="过去24小时" />\n        <StatCard title="视频热点命中率 (Redis)" value="98.2%" trend={0.4} info="缓存 Miss 率 <2%" />\n        <StatCard title="新增注册用户" value="14,233" trend={-2.1} info="包含微信/手机号" />\n        <StatCard title="Kafka DLQ 堆积异常" value="0" trend={0} info="系统运行健康" />\n      </div>\n    </div>\n  );\n}\n`,
        comments: [
            { line: 12, text: '// 💡 border 与 shadow-sm 的组合成就了经典的现代卡片质感' },
            { line: 17, text: '// 💡 商业指标少不了趋势箭头，用颜色和箭头强化感知' },
            { line: 24, text: '// 💡 背景微芒光效（Blur）' },
            { line: 34, text: '// 💡 利用 Tailwind 非常轻易地实现企业级流式网格架构' },
        ],
    },
    {
        id: 'fe-4-2', type: 'frontend',
        title: '课程 4.2：可视化实时数据',
        category: '模块4：SaaS 洞察看板', track: '前端架构',
        moduleNumber: 4, lessonNumber: 2, language: 'typescript',
        startingCode: '',
        instructions: `# 纯手工绘制数据结界：SVG 数据驱动图谱

## 🎯 业务上下文与我们在做什么？
那些空有一堆数字的企业平台显得干瘪而不可视，极易陷入审美疲劳引发数据判断钝化失误。但是如果仅仅为了画这个用来装点门面放在左上角边角上不足巴掌大的一条线（Sparkline），你甚至都去费劲心机将那如小山般足有过数 MB 庞然大物的商业库如 \`ECharts\` 或者体积同样恐怖的 \`D3.js\` 打包扯进你的项目中！这不仅仅是对依赖体积的一种恐怖的罪恶增加而是直接丧失了底层绘制能力与优雅掌控性的表现。
我们将使用浏览器底层最原始古老坚固的原生画布：**SVG (可缩放矢量图形)** 与现代 React 强绑定手写一个属于自己的完全纯粹轻便极速图表组件！

## 🔍 代码深度解析
- **数学轴线缩放 \`range / max / min\`**：如何把杂乱的一组类似 \`[1, 54, 989]\` 这千差万别的数硬生生的压塞在我们强制只能显示的 100 x 40 小方框上？这就是我们在做极其经典的视图映射（View Mapping）。我们抓出最大最小极限落点差去算出它的相对比例再对他们进行一个高纯度的归一化乘除按百分比按下去。
- **神圣语言连接：\`Array.map().join(' L ')\` 语法**：在 SVG 里画一条线并不是操纵什么像素，而是直接发出给浏览器的绝对绘图“代码命令信标”：
\`M 0,39 L 25,10 L 50,40...\` 其中 \`M\` 代表拿着笔挪到某坐标 (Move To)， \`L\` 指的是拿着正在出油墨的笔划向新的去处 (Line To)。用原生 Array.map 等非常顺滑地在数据点上循环便动态生成这连串神秘精巧坐标集。让数据直达视觉！

### 🧠 底层原理剖析：SVG vs Canvas 底层宣讲
**Retina 视网膜高清防拉伸机制与渲染路径：**
当你缩放一个网页被逼到几千度极限或者用非常高端的 4K 分辨去审视这图形线条时为何连一点点微小可怜的阶梯状犬牙毛边也没有！它的原理是因为这根本就不是像素构成！
\n**Canvas (画家视角)**：那是分配到了内存用一层密集的红绿彩色小格子布列而铺就而成的，画一笔留下的仅是内存中各种位置被染黑破坏过的像素！当拉长后由于系统靠插值强拉点阵它必然会形成巨大的马赛克糊状崩开导致严重变色！
\n**SVG (几何学家视角)**：这种机制它传出的不是图像而是严谨如机械指令的“数学表达公式”。这就意味着不论如何将其向宇宙深处无限的放大投映。它都是显卡与浏览器重新接收后依靠内部那套实时运算着无理数级别最高精度的微分数学系统方程计算着出在那一当前时刻下最为丝滑锐利的物理向量坐标圆规硬描绘出界线框格。
这也是我们要通过它手写 Sparklines 来保留大屏展示极其高精纯度不可被取代特性的究源原因。\n\n## 📝 完整参考代码\n\`\`\`typescript\nimport React from 'react';

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
        className="drop-shadow-sm"
      />
    </svg>
  );
}
\n\`\`\``,
        targetCode: `import React from 'react';\n\ninterface LineChartProps {\n  data: number[]; // e.g. [10, 20, 15, 40, 30]\n  color?: string;\n}\n\n// 💡 一个轻量、无外部依赖的 SVG 微缩折线图 (Sparkline)\nexport function Sparkline({ data, color = '#4285F4' }: LineChartProps) {\n  if (data.length === 0) return null;\n\n  const max = Math.max(...data);\n  const min = Math.min(...data);\n  const range = max - min || 1;\n\n  const height = 40;\n  const width = 100;\n  \n  // 💡 将数组中的值，映射到 x/y 坐标上生成一段连续路径\n  const points = data\n    .map((val, i) => {\n      const x = (i / (data.length - 1)) * width;\n      const y = height - ((val - min) / range) * height;\n      return \`\${x},\${y}\`;\n    })\n    .join(' L ');\n\n  return (\n    <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-10 overflow-visible">\n      <path\n        d={\`M \${points}\`}\n        fill="none"\n        stroke={color}\n        strokeWidth="2"\n        strokeLinecap="round"\n        strokeLinejoin="round"\n        className="drop-shadow-sm"\n      />\n    </svg>\n  );\n}\n`,
        comments: [
            { line: 9, text: '// 💡 我们不仅只用现成的库，了解底层的渲染思想让你脱颖而出' },
            { line: 19, text: '// 💡 核心数学：按照最大/最小值缩放 Y 轴像素比例' },
            { line: 30, text: '// 💡 生成 SVG Path 路径语法 M x1,y1 L x2,y2' },
        ],
    },
    {
        id: 'fe-5-1', type: 'frontend',
        title: '课程 5.1：网络核心设施与 Axios 拦截器',
        category: '模块5：前后端全栈集成', track: '前端架构',
        moduleNumber: 5, lessonNumber: 1, language: 'typescript',
        startingCode: '',
        instructions: `# 打造全链路网络基建防波堤与暗桩

## 🎯 业务上下文与我们在做什么？
在前端的 1.2 和 1.3 模块中我们拿到那个宝贵的证明本人身份的认证 \`JWT\` 后把它丢到了暗沉无光的浏览器仓库里（\`localStorage\`）。
但在大工程里，如果要让你随后发起去拿取好友聊天信息，拉取个人订单据，这上千个分散在不同团队同事负责所写的业务组件，他们如果每个人都要因为需要拿用户身份从而苦哈哈在每个 \`fetch\` 后附加 \`headers: { 'Authorization': \`Bearer ... \` }\` 这种模板代码，更糟糕地是为了防御后端的 JWT 突然有一天超时报废从而给这每个文件里都塞上一堆 \`if(status === 401) goto login\` 代码。那将成为无孔不入不可维护的惊悚灾害！
我们要建立绝对拦截枢纽：**Axios 拦截器**。我们要在它们飞向网卡与进入上层建筑执行时，设立安检仪与净水机，拦截、加工并在其失效时完成拦截与熔断踢回的统一大政方针处理。

## 🔍 代码深度解析
- **\`axios.create\`**：这构造出我们属于专门访问内网这台核心机主力的请求炮管子，把所有这杆发出去带有的超时以及基础公共端口全部写死锚定在核心基础源头，一源改万源随！
- **防御前阵 - \`interceptors.request.use\`**：每一次只要是被上层调这个 \`apiclient.get/post\` 只要打出来的子弹流出出大门都会被在此截留，将刚才被压箱底的 JWT 安置进规范最严格的带有 HTTP 要求的 \`Bearer\` 魔术前缀的授权头里面护送出国。
- **守城后阵 - \`interceptors.response.use\`**：无论后面回来的是何种妖魔或者响应报错这里进行统一收拢如果那把后端的 Spring Security 无情拒绝并且打回的 Http 无情状态码为 401：无需废话，将它残存在的破烂令牌给扯丢掉并且极快速度送客重定向强送路由扔回避风港（\/login）。保证其他上层业务不再因为接到不正常报废体抛红导致大面积 UI 碎裂！

### 🧠 底层原理剖析：JS 拦截器与 Promise 链的底层链接挂载
** Axios 这个拦截模式（Interceptors）是如何在微观深处发生的？**
当我们看这华丽封装底布里的真面目。他依靠了极度老辣深邃的设计：**Promise 链的数组流接力（Pipeline Pattern）**。
在内部这甚至只是个叫 \`handlers\` 链队列结构。当你压入 request 时他将其推到队首放入一个待执行堆叠中 (\`arr.unshift\`)，如果是 response 他则丢进末端去 (\`arr.push\`)。
最终所有发起都是由内部生成一个巨大的极度壮丽核心运行管区调用代码组合，这句关键执行代码其本质无非就是这样不断出栈并且递归衔接去构成一条线大循环：
\n\`promise = promise.then(chain[x], chain[x+1])\`。
这就解释了你在这里写这个钩子时为啥必须 \`return config\` 或者 \`return response\`（你不作为承接将这些棒子交递给下一个，这条由许许多多级联回调连绵延挂组成的巨大承诺反应链就因为被死掐中断抛出一个致命未定义报错！）。
这是一个教科书级别用原生原生对象控制流构建巨大拦截管线的极致思想显形！\n\n## 📝 完整参考代码\n\`\`\`typescript\nimport axios from 'axios';

// 💡 建立统一兵站：利用 Vite 的代理，我们将向同域名的 /api 发送所有请求 
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 💡 请求拦截器：像安检员，在任何请求冲出浏览器之前截留它打上烙印
apiclient.interceptors.request.use(
  (config) => {
    // 💡 从 localStorage 提取身份令牌
    const token = localStorage.getItem('jwt');
    if (token) {
      // 💡 注入 OAuth2 / JWT 规范要求的 Bearer 授权头
      config.headers['Authorization'] = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 💡 响应拦截器：不管上层业务在干嘛，在这里先过滤所有非预期错误
apiclient.interceptors.response.use(
  (response) => response, // 正常 200 就放行
  (error) => {
    if (error.response?.status === 401) {
      // 💡 401 意味着令牌已经过期失效，我们无情地把用户踢回登录页
      console.error('鉴权失败，即将跳转登录...');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
\n\`\`\``,
        targetCode: `import axios from 'axios';\n\n// 💡 建立统一兵站：利用 Vite 的代理，我们将向同域名的 /api 发送所有请求 \nexport const apiClient = axios.create({\n  baseURL: '/api',\n  timeout: 5000,\n});\n\n// 💡 请求拦截器：像安检员，在任何请求冲出浏览器之前截留它打上烙印\napiclient.interceptors.request.use(\n  (config) => {\n    // 💡 从 localStorage 提取身份令牌\n    const token = localStorage.getItem('jwt');\n    if (token) {\n      // 💡 注入 OAuth2 / JWT 规范要求的 Bearer 授权头\n      config.headers['Authorization'] = \`Bearer \${token}\`;\n    }\n    return config;\n  },\n  (error) => Promise.reject(error)\n);\n\n// 💡 响应拦截器：不管上层业务在干嘛，在这里先过滤所有非预期错误\napiclient.interceptors.response.use(\n  (response) => response, // 正常 200 就放行\n  (error) => {\n    if (error.response?.status === 401) {\n      // 💡 401 意味着令牌已经过期失效，我们无情地把用户踢回登录页\n      console.error('鉴权失败，即将跳转登录...');\n      localStorage.removeItem('jwt');\n      window.location.href = '/login';\n    }\n    return Promise.reject(error);\n  }\n);\n`,
        comments: [
            { line: 4, text: '// 💡 搭配我们在 FE 1.1 中配的 Vite Proxy 食用更佳' },
            { line: 9, text: '// 💡 Request 强袭装甲：任何组件发起 fetch 都会无感带上 Token' },
            { line: 15, text: '// 💡 我们即将呼叫后端的 JwtRequestFilter' },
            { line: 26, text: '// 💡 全局兜底网络故障，永远不要让白屏抛给用户' },
        ],
    },
    {
        id: 'fe-5-2', type: 'frontend',
        title: '课程 5.2：实战前后端闭环联调',
        category: '模块5：前后端全栈集成', track: '前端架构',
        moduleNumber: 5, lessonNumber: 2, language: 'typescript',
        startingCode: '',
        instructions: `# 启程破晓闭环联调：接通万物脉络网络之神

## 🎯 业务上下文与我们在做什么？
在整座孤岛独自发展壮大到了最尾声一环。这个叫 \`AuthGate\` 的巨大门锁组装点即将承受它最严肃的神圣检验！
这是一场真正的系统级别集成。你将作为全栈主创把我们亲手写的最底层登录模块发起网络，再让它拿到那把开启新世界的钥匙。拿到后依靠我们在上次打好的 Axios 将军把守过的道路，发起毫无带锁的随意拿去索取。而它将会跨过千重网关、微服务与重洋网卡来到我们亲自书写的 Spring Boot 的深处大本营！如果全剧终了并且数据传传带回。你将可以极为豪迈骄傲宣布这块前段已经全面并拢贯通进入企业大盘流！

## 🔍 代码深度解析
- **极简获取态：\`apiClient.get('/users/profile')\`**：你能发现在这段高绝层的真实展示业务层面上，根本完全没有出现任何繁杂罗嗦又拖沓且令人嫌恶的那一段获取认证以及加装标头的累赘附庸代码嘛？没有！这叫做高度抽象并且对底层实现的“完全无感知”。它唯一负责的只是发送自己的需求：我们要 \`profile\` 其它都不管并且信任下面那个刚刚用好在 Axios 所做的防御屏障！如果那个屏障被破报错了，下面因为我们拦截到了拦截踢去了登录所以这边连捉拿异错那一部分也是完全略去了绝大多数不需要被关心的核心逻辑！！

### 🧠 底层原理剖析：跨环境安全界以及大结局展望
**LocalStorage 与持久存储的攻防之争：XSS！**
很多人对于这里有无边无际的抱怨认为不应当存在！把这绝密天机一般至大之钥匙 JWT 放在一个极其透明谁来这只需按下 \`F12\` 然后按输入框查查并随便调用点小 \`javascript\` JS 即便如你我也能翻翻看得底朝天的叫做 \`localStorage\` 这个地方！这必然遭遇极可怕的网络浩劫 \`XSS(跨站脚本攻击 Cross-Site Scripting)\` 这个远古黑魔法灾潮的侵略。一旦别人在那评论区或者名称那注入一点点恶心的非法带勾脚本窃取，就能一瞬间复制并传到他们的后台，让所有人在第二天变成那些受黑控制发散流视频广告控制的可怜人！
那该咋防这块？！
这就需要依托后端强大的力量甚至在 Cookie 深处注入打上了 \`HttpOnly\`（阻断任何 JS 提取权限的绝对深宫结界）的标志下分发传输而不是发这种可以随意把玩的纯透明 JWT 串或者需要更严密的层层验证如通过 Redis 等二次把关，这在后端的 M6 以及更深的云边际，都有极深究源破解！这也是你走向进阶防波堤架构极佳的跳板，现在且感受着顺利调通拿到数据的极度畅快感吧！\n\n## 📝 完整参考代码\n\`\`\`typescript\nimport React, { useState } from 'react';
import { apiClient } from './apiClient';

export default function AuthGate() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));
  const [profile, setProfile] = useState<any>(null);

  const handleLogin = async () => {
    try {
      // 💡 发起硬核的真实网络连接：调用 Spring Boot 的 LoginController
      const res = await apiClient.post('/auth/login', { username: 'admin', password: 'password' });
      
      // 💡 存储命脉
      const newToken = res.data.token;
      localStorage.setItem('jwt', newToken);
      setToken(newToken);

    } catch (err) {
      alert('后端服务未启动或用户名错误！');
    }
  };

  const fetchSecretProfile = async () => {
    try {
      // 💡 由于设置了拦截器，这里完全不用管 Token，直接要数据即可，非常清爽
      const res = await apiClient.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      // 拦截器如果返回 401 我们早就被重定向踢走了，不需要处理越权
    }
  };

  return (
    <div className="p-10 text-center">
      {!token ? (
        <button onClick={handleLogin} className="bg-[#34A853] text-white px-8 py-3 rounded-full font-bold shadow-md">
          全链路一键登录
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 font-bold">✓ Token 保存在浏览器中</p>
          <button onClick={fetchSecretProfile} className="bg-blue-600 text-white px-6 py-2 rounded shadow flex mx-auto">
            抓取后端被保护的用户资料
          </button>
          {profile && <pre className="text-left bg-gray-100 p-4 mt-4 text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
\n\`\`\``,
        targetCode: `import React, { useState } from 'react';\nimport { apiClient } from './apiClient';\n\nexport default function AuthGate() {\n  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));\n  const [profile, setProfile] = useState<any>(null);\n\n  const handleLogin = async () => {\n    try {\n      // 💡 发起硬核的真实网络连接：调用 Spring Boot 的 LoginController\n      const res = await apiClient.post('/auth/login', { username: 'admin', password: 'password' });\n      \n      // 💡 存储命脉\n      const newToken = res.data.token;\n      localStorage.setItem('jwt', newToken);\n      setToken(newToken);\n\n    } catch (err) {\n      alert('后端服务未启动或用户名错误！');\n    }\n  };\n\n  const fetchSecretProfile = async () => {\n    try {\n      // 💡 由于设置了拦截器，这里完全不用管 Token，直接要数据即可，非常清爽\n      const res = await apiClient.get('/users/profile');\n      setProfile(res.data);\n    } catch (err) {\n      // 拦截器如果返回 401 我们早就被重定向踢走了，不需要处理越权\n    }\n  };\n\n  return (\n    <div className="p-10 text-center">\n      {!token ? (\n        <button onClick={handleLogin} className="bg-[#34A853] text-white px-8 py-3 rounded-full font-bold shadow-md">\n          全链路一键登录\n        </button>\n      ) : (\n        <div className="space-y-4">\n          <p className="text-green-600 font-bold">✓ Token 保存在浏览器中</p>\n          <button onClick={fetchSecretProfile} className="bg-blue-600 text-white px-6 py-2 rounded shadow flex mx-auto">\n            抓取后端被保护的用户资料\n          </button>\n          {profile && <pre className="text-left bg-gray-100 p-4 mt-4 text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>}\n        </div>\n      )}\n    </div>\n  );\n}\n`,
        comments: [
            { line: 11, text: '// 💡 等待后端的 AuthenticationManager 进行认证校验' },
            { line: 14, text: '// 💡 将后端赐予的令牌收入囊中' },
            { line: 26, text: '// 💡 看看拦截器这优雅的抽象：业务代码纯粹极简' },
        ],
    }
];
