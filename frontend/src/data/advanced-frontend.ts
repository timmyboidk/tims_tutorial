import type { Lesson } from '../types';

export const advancedFrontend: Lesson[] = [
    {
        id: 'fe-adv-state', type: 'frontend',
        title: 'Zustand 企业级状态管理',
        category: '进阶：高级前端架构', track: '前端架构',
        moduleNumber: 6, lessonNumber: 1, language: 'typescript',
        startingCode: '',
        instructions: `# 引入 Zustand 替代 Context API\n\n## 业务上下文\nContext API 虽然内置，但当其中的状态频繁更新时，会导致嵌套在 Provider 下的所有组件不必要的重新渲染。而在复杂的 SaaS 应用中，我们需要在不影响性能的前提下于多处共享状态。Zustand 就是现代、轻量、无需 Provider 包裹的状态树方案。\n\n## 学习目标\n- 定义并导出 Zustand Store。\n- 理解 Zustand 的切片与按需订阅机制。`,
        targetCode: `import { create } from 'zustand';\n\ninterface ConfigState {\n  theme: 'dark' | 'light';\n  sidebarOpen: boolean;\n  toggleSidebar: () => void;\n  setTheme: (theme: 'dark' | 'light') => void;\n}\n\n// 💡 核心：使用 create 函数定义全局 Store，它可以在任何 React 组件体之外读取与修改\nexport const useConfigStore = create<ConfigState>((set) => ({\n  theme: 'light',\n  sidebarOpen: true,\n  // 💡 直接修改单个状态，Zustand 会进行不可变合并\n  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),\n  setTheme: (theme) => set({ theme }),\n}));\n\n// 💡 用法\nexport function SidebarToggle() {\n  // 💡 精准切片（Selector）使得仅当 sidebarOpen 变化时，本组件才会重绘\n  const sidebarOpen = useConfigStore((state) => state.sidebarOpen);\n  const toggle = useConfigStore((state) => state.toggleSidebar);\n\n  return (\n    <button onClick={toggle}>\n      {sidebarOpen ? '收起侧边栏' : '展开侧边栏'}\n    </button>\n  );\n}\n`,
        comments: [
            { line: 10, text: '// 💡 创建全局状态树，摆脱组件层级的束缚' },
            { line: 14, text: '// 💡 set() 函数支持回调的形式，获取上一时刻的聚合状态' },
            { line: 21, text: '// 💡 性能金钥匙：只订阅你需要的那个碎片' },
        ],
    },
    {
        id: 'fe-adv-perf', type: 'frontend',
        title: 'React 终极性能优化',
        category: '进阶：高级前端架构', track: '前端架构',
        moduleNumber: 6, lessonNumber: 2, language: 'typescript',
        startingCode: '',
        instructions: `# React 性能优化：闭包与引用问题\n\n## 业务上下文\n在遇到重型计算或长列表时，由于父组件的微小更新导致的级联渲染可能会让页面卡顿。React 提供了 \`useMemo\` 和 \`useCallback\` 来锁定计算结果与函数引用。\n\n## 学习目标\n- \`useMemo\` 缓存重度计算结果。\n- \`useCallback\` 锁定传递给下游组件的回调函数的引用。`,
        targetCode: `import React, { useState, useMemo, useCallback } from 'react';\n\ninterface ExpensiveListProps {\n  items: string[];\n  onItemClick: (item: string) => void;\n}\n\n// 💡 Memozied 子组件，依靠引用相等来防守不必要的渲染\nconst ExpensiveList = React.memo(({ items, onItemClick }: ExpensiveListProps) => {\n  console.log('Heavy render triggered!');\n  return (\n    <ul>\n      {items.map((it) => (\n        <li key={it} onClick={() => onItemClick(it)}>{it}</li>\n      ))}\n    </ul>\n  );\n});\n\nexport default function FilterView() {\n  const [query, setQuery] = useState('');\n  const [clicks, setClicks] = useState(0);\n\n  // 💡 模拟数万条数据的纯静态列表\n  const rawData = Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`);\n\n  // 💡 只有当 query 发生改变时，才重新迭代这 10000 条数据\n  const filtered = useMemo(() => {\n    if (!query) return rawData.slice(0, 100);\n    return rawData.filter(i => i.includes(query)).slice(0, 100);\n  }, [query]); // ❌ 若不用 useMemo，输入 query 甚至点击其它无关按钮时，都会走上面这一大坨过滤逻辑\n\n  // 💡 锁定回调引用。如果用普通函数，每次 FilterView 更新都会生成新的 \n  // onItemClick 指针，从而击穿 ExpensiveList 的 React.memo 防线\n  const handleClick = useCallback((item: string) => {\n    console.log(\`You clicked \${item}\`);\n  }, []);\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..." />\n      <button onClick={() => setClicks(c => c + 1)}>Clicks: {clicks}</button>\n      <ExpensiveList items={filtered} onItemClick={handleClick} />\n    </div>\n  );\n}\n`,
        comments: [
            { line: 8, text: '// 💡 配合下方的 useCallback，构成完整的防御掩体' },
            { line: 27, text: '// 💡 极大地减免计算开销' },
            { line: 34, text: '// 💡 保护防线不被击穿的盾牌' },
        ],
    },
    {
        id: 'fe-adv-next', type: 'frontend',
        title: 'Next.js：SSG 静态站点生成',
        category: '进阶：高级前端架构', track: '前端架构',
        moduleNumber: 6, lessonNumber: 3, language: 'typescript',
        startingCode: '',
        instructions: `# SSG 静态生成预渲染\n\n## 业务上下文\n之前我们在 M3 利用了 SSR 为视频详情做直出渲染。但是，像“关于平台”、“帮助中心”这种万年不变的页面，如果你每次访问都在服务器现算一遍，不仅浪费资源，访问速度也会大打折扣。这时候就需要 SSG (Static Site Generation)。\n\n## 学习目标\n- 在构建期前置数据获取。\n- 理解 SSG 和 SSR 的本质区别。`,
        targetCode: `// 这是一个基于 Next.js App Router 约定构建的静态页面组件\n\n// 💡 强行告知 Next.js：这个文件在打包成最终产物时，就给我生成一堆 .html 文件，不要在服务器上动态运行\nexport const dynamic = 'force-static';\n\ninterface Post {\n  id: number;\n  title: string;\n  body: string;\n}\n\n// 💡 执行发生在 npm run build 阶段。服务器上的 Node.js 环境去请求 CMS 获取内容。\nexport default async function HelpCenterPage() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', {\n    // 💡 让 Next.js 永远缓存这个请求响应，直到重新部署（SSG 的精髓）\n    cache: 'force-cache',\n  });\n  const post: Post = await res.json();\n\n  return (\n    <article className="prose lg:prose-xl p-8 max-w-2xl mx-auto">\n      <h1>{post.title}</h1>\n      <p>发布时间：构建时刻抓取</p>\n      <div className="mt-4text-gray-700">{post.body}</div>\n    </article>\n  );\n}\n`,
        comments: [
            { line: 4, text: '// 💡 强制切入 SSG 模式的最快方式' },
            { line: 15, text: '// 💡 这个配置让 Next.js 在 Build 时将其烘焙为死静态数据' },
        ],
    },
    {
        id: 'fe-adv-ws', type: 'frontend',
        title: '全双工战线：WebSockets 实时推送',
        category: '进阶：高级前端架构', track: '前端架构',
        moduleNumber: 6, lessonNumber: 4, language: 'typescript',
        startingCode: '',
        instructions: `# WebSocket 实时连接\n\n## 业务上下文\n在短视频运营后台，如果有大 V 发布了新视频导致流量激增，运营人员应该在第一时间查看到报警和弹幕趋势，而不是每隔 5 秒傻拉一回接口（Polling）。基于浏览器的 WebSocket (WS) 给我们提供了一根连绵不断的数据吸管。\n\n## 学习目标\n- 浏览器原生 \`WebSocket\` 对象的集成。\n- 组件生命周期内的监听和销毁。\n- 结合 React 状态渲染。`,
        targetCode: `import React, { useEffect, useState, useRef } from 'react';\n\ninterface ActiveViewer {\n  videoId: string;\n  count: number;\n}\n\nexport function RealtimeViewerDashboard() {\n  const [viewers, setViewers] = useState<ActiveViewer[]>([]);\n  const wsRef = useRef<WebSocket | null>(null);\n\n  useEffect(() => {\n    // 💡 拨通长连接电话，建立隧道\n    const ws = new WebSocket('ws://localhost:8080/ws/viewers');\n    wsRef.current = ws;\n\n    ws.onopen = () => {\n      console.log('✅ WebSocket 隧道已就绪！');\n    };\n\n    // 💡 每当后端源源不断地压入数据，该监听器触发\n    ws.onmessage = (event) => {\n      try {\n        const data: ActiveViewer[] = JSON.parse(event.data);\n        setViewers(data);\n      } catch (err) {\n        console.error('Payload 解析异常', err);\n      }\n    };\n\n    // 💡 当用户切换到详情页时，务必掐断长连接防止内存泄露与后端线程浪费\n    return () => {\n      if (ws.readyState === WebSocket.OPEN) {\n        ws.close();\n      }\n    };\n  }, []);\n\n  return (\n    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl">\n      <h2 className="text-xl font-bold flex items-center mb-4">\n        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></span>\n        全局实时在线监控面板\n      </h2>\n      <ul className="space-y-2">\n        {viewers.length === 0 && <span className="text-gray-500 text-sm">暂无活跃数据...</span>}\n        {viewers.map((v) => (\n          <li key={v.videoId} className="flex justify-between border-b border-gray-700 py-1">\n            <span className="font-mono text-sm text-blue-400">视频 {v.videoId.slice(0, 8)}</span>\n            <span className="font-bold text-green-400">{v.count.toLocaleString()}</span>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n`,
        comments: [
            { line: 14, text: '// 💡 实例化对象并直指内网的服务地址，建立一次握手' },
            { line: 21, text: '// 💡 数据接收雷达' },
            { line: 31, text: '// 💡 清理函数的必修课：有始有终绝不断线重连堆积' },
        ],
    }
];
