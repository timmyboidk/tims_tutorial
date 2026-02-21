import type { Lesson } from '../types';

export const advancedFrontend: Lesson[] = [
  {
    id: 'fe-adv-state', type: 'frontend',
    title: 'Zustand 企业级状态管理',
    category: '进阶：高级前端架构', track: '前端架构',
    moduleNumber: 6, lessonNumber: 1, language: 'typescript',
        illustrationUrl: '/illustrations/w3_react_hooks_flow_1771635574572.png',
    startingCode: '', targetCode: '',
    instructions: `# 引入 Zustand 替代 Context API

## 业务上下文
在复杂的企业级 React SaaS 应用中，跨组件层级的状态共享是核心痛点。虽然 React 提供了自带的原生 Context API，但如果将其用于存储高频度变动的数据源（如输入框实时联动、鼠标坐标系追踪），Context 内置的消费模式会导致订阅在 Provider 节点下方的所有组件无论是否使用了该变动字段，全部遭遇无条件的级联强制重渲染（Re-render Cascades）。
为解决该性能消耗瓶颈，利用第三方状态管理微内核如 **Zustand** 构建独立于组件树外的单一全局状态流引擎，并实现精准颗粒度的按需订阅范式是业界公认的高端实现方案。

## 代码与配置解析

\`\`\`typescript
import { create } from 'zustand';

// 1. 基干层状态树全览类型设定
interface ConfigState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

// 2. Zustand 核心状态槽生成模型：摆脱 React 生命周期干涉的超脱型 Store 
export const useConfigStore = create<ConfigState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  // set 修改器会采用 Object.assign 机制自动并合前序层叠状态，无需全量回写
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// 组件域实际接入侧应用：
export function SidebarToggle() {
  // 3. 极细化精准分片（Selector 机制）
  // 这里的读取声明等于告知状态机：本组件只有在 sidebarOpen 发生绝对值变化时才会被触发被动重绘
  const sidebarOpen = useConfigStore((state) => state.sidebarOpen);
  const toggle = useConfigStore((state) => state.toggleSidebar);

  return (
    <button onClick={toggle}>
      {sidebarOpen ? '收起系统侧边总枢' : '全展面板详情布局'}
    </button>
  );
}
\`\`\`

## 底层原理深度剖析
**Zustand 的观察者模式 (Observer Pattern) 与不可变态 (Immutability)**：
相较于 React 内部极度依赖虚拟 DOM 比较向下散列的流式循环推送，Zustand 在其底层实际上是建立了一套极简的 **Pub/Sub (发布-订阅) 数据流引擎模型**。
当你执行 \`create\` 环节后，它便在 JS 独立堆内存节点中划分出一块封地存放该对象实体。并在框架外部保留了一组注册着无数对应各依赖组件 \`forceUpdate\` 挂钩函数的集合。一旦 \`set()\` 驱动了某个节点的绝对不可变指针更新，其内部系统将通过比照 (Object.is) 寻觅哪些具体的选针器（Selector）的返回值脱离了锚点，随后精确通知该部分对应的函数列触发强行的 \`render\` 生命周期。这彻底截断了层层剥皮传递比对导致的高昂系统效能开支。`
  },
  {
    id: 'fe-adv-perf', type: 'frontend',
    title: 'React 终极性能优化',
    category: '进阶：高级前端架构', track: '前端架构',
    moduleNumber: 6, lessonNumber: 2, language: 'typescript',
        illustrationUrl: '/illustrations/w3_react_optimizations_1771635739563.png',
    startingCode: '', targetCode: '',
    instructions: `# React 性能防卫：useMemo 与闭包引用击穿

## 业务上下文
面临客户端中重度复杂密集计算需求（如千万级数组元素的深层迭代过滤排序解析，或是重型高宽幅列表）场景时。上层节点的其它状态变更行为常常引发当前作用域内计算过程反复多次运转，极易引爆主线程拥堵阻塞与掉帧现象（Jank）。此时应当动用体系内的 **useMemo** 与 **useCallback** 防范屏障针对相关纯函数结果进行空间时间置换并对防危引用进行地址锚定封存。

## 代码与配置解析

\`\`\`typescript
import React, { useState, useMemo, useCallback } from 'react';

interface ExpensiveListProps {
  items: string[];
  onItemClick: (item: string) => void;
}

// 1. 对于底层深重列表视图加入静态防御阻绝网 React.memo()
const ExpensiveList = React.memo(({ items, onItemClick }: ExpensiveListProps) => {
  return (
    <ul>
      {items.map((it) => (
        <li key={it} onClick={() => onItemClick(it)}>{it}</li>
      ))}
    </ul>
  );
});

export default function FilterView() {
  const [query, setQuery] = useState('');
  const [clicks, setClicks] = useState(0);

  // 模拟出需要极致性能支撑运转的前端伪万量级长排数据集体
  const rawData = Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`);

  // 2. 算力开销阻滞器：通过依赖探针包裹将无意义反复进行的全列重构阻挡在墙外
  const filtered = useMemo(() => {
    // 此时仅在 query 更改事件触发才会解锁重放进行重新遍历
    if (!query) return rawData.slice(0, 100);
    return rawData.filter(i => i.includes(query)).slice(0, 100);
  }, [query]); 

  // 3. 内存地址防滑钉：对回调指针实施绝对定死锁定策略
  const handleClick = useCallback((item: string) => {
    console.log(\`交互回调确认击发： \${item}\`);
  }, []);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..." />
      {/* 任意操作此纯状态切换组件并不会波及引发对下方长列表与重算区的数据池连带刷新 */}
      <button onClick={() => setClicks(c => c + 1)}>不相关按钮交互频率: {clicks}</button>
      <ExpensiveList items={filtered} onItemClick={handleClick} />
    </div>
  );
}
\`\`\`

## 底层原理深度剖析
**纯函数稳定性引用与堆栈对象比对穿透失控**：
一切以 \`{}\`, \`[]\`, \`() => {}\` 匿名符号声明的对象及函数体类型都从属于宿主堆内存系统内的引用传参范畴体系。
若在渲染环内裸写 \`const handle = () => {}\`，每一帧调度的该作用域便会在内存表里另分配一片全新序列空间的同构异形体。\n处于最内核受防级的 \`ExpensiveList\` 其在浅层属性比对防线阶段（\`prevProps.onItemClick === nextProps.onItemClick\`），由于指针比对不同而宣告失守被强突击穿全面崩溃致使 \`memo()\` 成为无效掩体。\n利用 \`useCallback()\` 本质上在底层 React Fiber 对象节点上建立了一个不会消失且连延持存挂载映射属性节点。不仅阻断了分配回收损耗，更保持了向后文传递时引用的同位同构不堕逻辑。`
  },
  {
    id: 'fe-adv-next', type: 'frontend',
    title: 'Next.js：SSG 静态站点生成',
    category: '进阶：高级前端架构', track: '前端架构',
    moduleNumber: 6, lessonNumber: 3, language: 'typescript',
        illustrationUrl: '/illustrations/w3_nextjs_ssr_arch_1771635590252.png',
    startingCode: '', targetCode: '',
    instructions: `# SSG 预置数据静态生成架构体系

## 业务上下文
若是对于“帮助页公告中心”或是“平台固定架构协议文档”此类不掺杂私人敏感隔离属性，同时常年不做高频修正变动信息的纯静态公进展页面组群。即使使用了 SSR 也会因为存在了后端 Node.js 对于每个请求接盘而进行的实时渲染操作进而空转极大地浪费计算实例云端机位。通过指定架构退化至 **SSG (Static Site Generation 静态生成层)**，系统会在应用编译打包节点中抓取完并烧录封锁一切网络获取内容资源，最终输出一堆无懈可击纯 HTML 源文下派置全球的 CDN 边缘云节点进行极速秒开级派发。

## 代码与配置解析

\`\`\`typescript
import React from 'react';

// 1. 设置 Next.js 编译器宏路由准入标志策略 
// 斩源命令系统让该模块完全脱离运行时服务推演层
export const dynamic = 'force-static';

interface Post {
  id: number;
  title: string;
  body: string;
}

export default async function HelpCenterPage() {
  // 2. Fetch API 的扩展劫持：声明预取锁止周期 
  const res = await fetch('https://api.cms-system.com/docs/core-protocols', {
    // 这个强制命令意味着它只会在 npm run build (构建期流水线 CI) 时拉下并固定被写死进最终输出静态体系 HTML 中
    cache: 'force-cache',
  });
  const post: Post = await res.json();

  return (
    <article className="prose lg:prose-xl p-8 max-w-2xl mx-auto border bg-white rounded-2xl shadow-sm mt-8">
      <h1>{post.title}</h1>
      <p className="border-b pb-4 text-gray-500">文档最终归档版本期锁定：流水线建构时间戳位记号</p>
      <div className="mt-6 text-gray-800 leading-relaxed font-serif track-wide">{post.body}</div>
    </article>
  );
}
\`\`\`

## 底层原理深度剖析
**Time to First Byte (TTFB) 极限对撞机与 CDN 边缘网络**：
对比传统 CSR 面临长长的时间黑洞（TTFB 甚至会因 JS 执行耗损至长达 3 秒开外）。即使 SSR 服务端渲染在每次调用期间其至少同样包含了网络握手和数据抓取的固定周期不可破 100ms~ 500ms 服务延时消耗。
而 SSG 的纯文本导出特性，使其能够如静态大屏海报般挂载驻留推落于诸如（Cloudflare / Vercel Edge 等）CDN 内容分发网格内极其贴近用户物理家庭端侧所在的机房内。它的分派行为脱离了算力逻辑仅执行于无脑的缓存原版流复制派发任务上，所以网络响应到达下层端点时间（TTFB）可压榨拉平至于极其丧心病狂的 \`~15 毫秒\` 内极值。这对于大型网站优化 Google 搜录评分 (Lighthouse Metrics) 是决胜指标操作。`
  },
  {
    id: 'fe-adv-ws', type: 'frontend',
    title: '全双工战线：WebSockets 实时推送',
    category: '进阶：高级前端架构', track: '前端架构',
    moduleNumber: 6, lessonNumber: 4, language: 'typescript',
        illustrationUrl: '/illustrations/frontend_architecture.png',
    startingCode: '', targetCode: '',
    instructions: `# WebSocket 双全工长连接通道架构

## 业务上下文
在短时视频高容量迸发的流媒体平台上，如果试图展示主播房间内实时汇集的密集关注人气流量波动跳级展示。过去使用的 HTTP 短轮询（Pooling：前端靠 \`setInterval\` 定期轮番扫寻砸门索取结果）将会造成成千上万无效包头协议载荷对网关系统的暴风洗劫拖垮。
引接浏览器端全原生协议底层内建的 **WebSocket (WS)** 构建恒流持存隧道链路，它搭建起一条彻底免除掉传统 HTTP 一问一答枷锁闭环限制的双向奔流通路管线。

## 代码与配置解析

\`\`\`typescript
import React, { useEffect, useState, useRef } from 'react';

interface ActiveViewer {
  videoId: string;
  count: number;
}

export function RealtimeViewerDashboard() {
  const [viewers, setViewers] = useState<ActiveViewer[]>([]);
  // 1. 设置越限钩子引用来存贮隧道接驳持存引用以应对注销撤档控制
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. 将底层协议族从 http:// 转拉为 ws:// 发出升级晋升网络挂接请求信息
    const ws = new WebSocket('ws://api-service.cluster.local:8080/ws/viewers/trends');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('协议升级连贯，通道已进入长守恒放开态：Ready');
    };

    // 3. 拦截服务端单向自由下抛的字节文本消息序列并映射进虚拟呈现树组态内
    ws.onmessage = (event) => {
      try {
        const data: ActiveViewer[] = JSON.parse(event.data);
        setViewers(data);
      } catch (err) {
        console.error('序列转换抛落结构解析断点防沉迷', err);
      }
    };

    // 4. 安全阀清理析构函数：保证组件遭遇下架回收拆毁退避周期中彻底清空死握链接进程通道
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // 空挂载列表意为伴随组件存续的全周期间只建立并打通那一根独苗连接管道通道

  return (
    <div className="bg-[#111827] text-white p-6 rounded-xl shadow-2xl border border-gray-800">
      <h2 className="text-xl font-bold flex items-center mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse mr-3 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
        高通量时流中控面板列矩阵
      </h2>
      <ul className="space-y-3">
        {viewers.length === 0 && <span className="text-gray-500 text-sm tracking-wide">管道序列暂空...正在维持侦探等候接驳源</span>}
        {viewers.map((v) => (
          <li key={v.videoId} className="flex justify-between items-center border-b border-gray-800/50 pb-2">
            <span className="font-mono text-sm text-cyan-400">Stream # {v.videoId.slice(0, 8)}</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
              {v.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## 底层原理深度剖析
**HTTP 协议握手头部拥挤症侯群与 WS 信道升级握手机制**：
每一个传统的单发 HTTP 请求均被要求在网络堆栈底部配备体积肥胖庞大臃肿且占位达千百字节量级的诸如 Headers、Cookies 及源头校验体。如果在高频请求域中发送这将发生极为高比例的无效废柴数据占比拖行阻塞问题。
WebSocket 的底层连接发源本质也是一条 HTTP 探针，它在前导包体内携带着要求进行协议跃升的标头：\`Connection: Upgrade\`, 和 \`Upgrade: websocket\` 。
一旦拥有对向拦截解析力的服务器系统对标识别并给予成功接收（往往回执以 \`HTTP 101 Switching Protocols\` 状态命令报），该 TCP 底层信标连接层再不会进行被动释放切断，而是转交退位于完全剔除掉了啰嗦额外网络元信息头标的纯真态精简帧传递格式层执行（只持有 \`2 bytes\` 耗能包附着层架构）。这也就为达成百万级平行并发信道集群建立起可能。`
  }
];
