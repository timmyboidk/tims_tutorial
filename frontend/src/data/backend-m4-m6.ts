import type { Lesson } from '../types';

export const backendM4M6: Lesson[] = [
    {
        id: 'be-4-1', type: 'backend',
        title: '课程 4.1：微服务 Saga 跨库事务（购买会员）',
        category: '模块4：分布式事务与容错', track: '后端工程',
        moduleNumber: 4, lessonNumber: 1, language: 'java',
        illustrationUrl: '/illustrations/w3_microservices_saga_1771635780394.png',
        startingCode: '',
        instructions: `# Saga 编排与分布式跨库事务

## 业务上下文
在单体架构中，购买“打赏特效套餐”涵盖扣减余额与发放特权两个步骤，可通过一个 \`@Transactional\` 注解依托本地数据库的 ACID 特性保证原子性。
但在微服务架构中，计费服务和特权服务分别拥有独立的内网数据库实例。如果计费服务成功扣款后，特权服务由于网络分区或宕机导致发放失败，就会产生严重的数据不一致问题。为此，我们引入 **Saga 状态机模式与 Kafka 事件驱动引擎** 进行分布式容错与最终一致性补偿（Compensation）。

## 代码与配置解析
- **主叫方发流 \`initiateVipPurchase\`**：首先在一个本地 \`@Transactional\` 的包裹下完成安全的本域数据扣款操作。随后，向 Kafka 总线发射一个异步事件包裹（如 \`vip-grant-requests\`），通知下游服务推进后续流程。
- **顺位接收执行点 \`grantVipAccess\`**：下游特权管理服务截取事件后执行本地的发放操作。如果在此阶段捕捉到系统内部报错或网络连接断裂导致发放授权失败，必须在 \`Catch\` 块中主动对外发出一封逆向的补偿追回事件（如 \`vip-refund-compensation\`）。
- **终极逆流补偿 \`executeRefund\`**：作为最开始的资金扣流发起方，一旦监听到退单信息，立即启动与最初 \`扣款\` 行为具有相反属性的补账回滚逻辑 —— \`退款补偿\`。通过这套正反向的机制组合达到最终业务平齐。

## 底层原理深度剖析
**CAP 定理与传统两阶段提交（2PC）的瓶颈**
分布式系统面临 CAP 定理（一致性、可用性、分区容错性无法同时绝对满足）的限制。若采用传统的 2PC 或 XA 全局事务强锁机制，所有参与的子系统必须等待统一的协调者发送提交指令。这在网络存在高延迟抖动的微服务跨库调用的场景下，极易导致大面积的数据库线程持锁不释放，从而在并发洪峰中拖垮整个系统集群的吞吐瓶颈。

**Saga 柔性事务（最终一致性）的本质**
Saga 属于 BASE 理论的典型实践，它放弃了追求强一致性的锁定开销，容忍各个独立服务在执行中间态那零点几秒的“不一致真空”窗口流产生。
在微服务环境中，这依赖极度坚固的重试队列（Retry）与回拨对冲（Compensation）链路。即使经历网络故障，在修复后系统也能依靠订阅尚未被签收（Acknowledge）的事件消息执行自动的补账对冲，最终使数据走向总账平齐的收敛状态（**Eventual Consistency**）。这是大型电商和金融系统处理高并发分布式容灾架构唯一的标准方案。
`,
        targetCode: `package com.codeforge.payment.saga;\n\nimport org.springframework.kafka.core.KafkaTemplate;\nimport org.springframework.kafka.annotation.KafkaListener;\nimport org.springframework.stereotype.Service;\nimport org.springframework.transaction.annotation.Transactional;\n\n// 跨越多个微服务模块的 Saga 补偿组合模式\n@Service\npublic class VipSubscriptionSaga {\n\n    // ...省略依赖注入代码\n\n    // [核心发源地：计费模块] 用户付款逻辑\n    @Transactional\n    public void initiateVipPurchase(String userId, double amount) {\n        // 保持本地数据库事务原子性\n        paymentRepository.deduct(userId, amount);\n        System.out.println("用户账单已发生本地结算: " + userId);\n        \n        // 放出异步事件流向下一环节解耦\n        kafkaTemplate.send("vip-grant-requests", userId);\n    }\n\n    // [流转节点：特权发放集群] 独立于计费环境的微服务\n    @KafkaListener(topics = "vip-grant-requests")\n    public void grantVipAccess(String userId) {\n        try {\n            // 执行特权发放\n            userRepository.makeVip(userId);\n            System.out.println("成功下发特权标识并更新数据库态");\n        } catch (Exception e) {\n            // 出现网络等异常时，极其关键的补救策略启动\n            System.err.println("特权写入操作抛出异常，发射补偿拦截事件执行平账");\n            kafkaTemplate.send("vip-refund-compensation", userId);\n        }\n    }\n\n    // [逆向流：计费模块] 接收补偿信号后的防滑回退\n    @KafkaListener(topics = "vip-refund-compensation")\n    public void executeRefund(String userId) {\n        // 精确对冲撤销上游失效带来的错误写库影响\n        System.out.println("执行对冲回退指令，补偿被误扣的额度: " + userId);\n        paymentRepository.refund(userId, 9.99);\n    }\n}\n`,
        comments: [
            { line: 16, text: '// 此环节享有 RDBMS 原生的 ACID 本地保护' },
            { line: 26, text: '// 网络分层架构下容易发生超时或连接拒绝的高危点' },
            { line: 36, text: '// 此层逻辑必须保证幂等性（Idempotency）以防重试过度' },
        ],
    },
    {
        id: 'be-4-2', type: 'backend',
        title: '课程 4.2：Resilience4j 断路器与雪崩防治',
        category: '模块4：分布式事务与容错', track: '后端工程',
        moduleNumber: 4, lessonNumber: 2, language: 'java',
        startingCode: '',
        instructions: `# Resilience4j 断路器与雪崩效应防治

## 业务上下文
在多层次交织的微服务请求网格中，如果处在调用链最底端的边缘算法模块（如个性化推荐）由于逻辑缺陷产生响应大面积超时，不断涌入的前置 API 流量会使得其 Tomcat 内的核心承载线程悉数阻塞。在短时间内，主集群将由于被全部拖累而发生全局服务器连接宕机，这被称为**系统雪崩（Cascading Failures）**。
我们需要引入容错中间件 \`Resilience4j\` 为每个不具备绝对可靠性的远端调用配置熔断机制。若探知下游错误率超标，即时切断路由防止级联拖死。

## 代码与配置解析
- **\`@CircuitBreaker\` 熔断注记**：声明阻断探测规则。如果被修饰调用的外部方法频繁报错或者超出时限，它将在请求触达前实现物理层面的瞬间阻回。
- **降级后手策略 \`fallbackMethod\`**：在网络链路被截断后，设计者不应允许该异常溢出导致前端的白屏显示。通过指向一个通用的降级预案方法（如返回静态预置榜单数据），系统能在保留核心流运行顺畅的同时，在终端降阶性维持基础可用。

## 底层原理深度剖析
**熔断闭合与探活试探的有限状态机模型 (State Machine)**
熔断器内核依托一个以时间环路感知的精算状态机进行动态切换：
1. **闭合（Closed）**：系统的健康原始态。流量进行常规放行，后台统计并监控拦截执行过程中的 HTTP 错误率。
2. **断开（Open）**：当错误率触碰预设红线阈值（如 >50%），状态机切开阻断器。后续所有试图进入的请求将直接在框架内存层被抛出 \`CallNotPermittedException\` 并路由进指定的 fallback 方法。此时，不稳定的远端服务得到充分的喘息空间以避免被持续压垮。
3. **半开试探模式（Half-Open）**：断路器带有智能化的复苏设计。在经过一段缓冲的休眠时间（如 30 秒）后，系统会放入限制次数的探测请求。如果样例测试发现依然在超时或报错，则立刻降回 Open 态继续防卫挂起：如果探测通过且耗时修复至正常基准，则解除武装恢复至原始的 Closed 全挂载通道运作。
`,
        targetCode: `package com.codeforge.resilience;\n\nimport io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;\nimport org.springframework.stereotype.Service;\n\n@Service\npublic class FeedAggregatorService {\n\n    private final RecommendationClient recommendationClient;\n\n    public FeedAggregatorService(RecommendationClient recommendationClient) {\n        this.recommendationClient = recommendationClient;\n    }\n\n    // 断路器配置："recommendation" 策略判定错误率越界时自动跳开拦截\n    // 熔断抛错全平滑过度至 fallbackMethod 进行降级输出着陆\n    @CircuitBreaker(name = "recommendation", fallbackMethod = "fallbackForRecommendations")\n    public String getPersonalizedFeed(String userId) {\n        \n        // 被纳入监控包的危险第三方长跨度请求\n        System.out.println("向远程服务层调集特征模型，可能遭遇网络延迟现象...");\n        return recommendationClient.fetch(userId);\n    }\n\n    // 后备高可用兜底池：保证核心页框能在服务劣化的时候呈现默认内容\n    public String fallbackForRecommendations(String userId, Throwable t) {\n        System.err.println("熔断器开启态或下游失联：启用纯本地静态通用榜单配置防连带中断");\n        return "[应用端默认排行榜]：个性化服务临时故障，为您显示通用内容...";\n    }\n}\n`,
        comments: [
            { line: 16, text: '// 设置状态机拦截从而保护上级连接线程不被阻塞挂起' },
            { line: 20, text: '// 若该远程调用失败频繁，将被系统暂时阻断' },
            { line: 25, text: '// 服务降级（Service Degradation）最佳实践之一' },
        ],
    },
    {
        id: 'be-5-1', type: 'backend',
        title: '课程 5.1：Micrometer 与全链路遥测追踪',
        category: '模块5：高维可观测与链路审计', track: '后端工程',
        moduleNumber: 5, lessonNumber: 1, language: 'java',
        startingCode: '',
        instructions: `# 全链路分布式追踪 TraceId 遥测体系

## 业务上下文
在涉及微服务多链条转发的生产故障排查中，如果一个用户支付请求先后流转了【网关】->【计费发账】->【关联库存】等多台节点，并发生了 \`500 Error\`。若要在多台主机的异构日志中手动关联并排查该链路中断点，将是极端的工程挑战。
通过集成 **Micrometer Tracing 整合全链路遥测协议（OpenTelemetry）** ，我们可以配置后端在同一条请求的所有层面上打入共享关联上下文，使得穿贯整个生命周期的链路图谱能够在日志平台中集中显影闭环。

## 代码与配置解析
- **\`TraceId\` 与 \`SpanId\` 体系**：一次完整的访问流程对应一串全局唯一的辨识 TraceId (如 \`0b64d...\`)。沿途每一次 RPC 切口和微服务执行单元都会被加赠一条基于节点生命周期的 \`SpanId\`。这就形成了一个树状有向流程脉络解决跨机定位问题。
- **向 MDC 自动写入属性层 (Mapped Diagnostic Context)**：高度依赖于 Logback 与 Micrometer 内部集成的环境拦截注入支持。开发者无需显式在方法间传递 Id 或记录逻辑声明，常规的 \`log.info("生成订单")\` 操作会在底层结合拦截器和格式模板，被自动追加并打印为带有标识符的完整记录：\`[backend-app, 0b64d..., span-1...] 生成订单\`。

## 底层原理深度剖析
**跨机的 HTTP Headers 协议接力与单机的线程本地化传递：**
为保障遥测信息能在不同物理机器和内部运行空间中被准确维系接力传递：
1. **边界跨越网络**：在使用 \`RestTemplate\`, \`FeignClient\` 或 \`WebClient\` 对外发起网络交换时，系统切面机制会在报文的 \`HTTP Headers\` 层面自动注入并遵守 \`B3-Propagation\` 或 \`W3C Trace Context\` 的格式协定（例如写入参数 \`tx-trace-id: 0b64dc...\`）。
2. **域内运转与并发分离**：次级服务的网关获取到报文标识头信息并拆解保存。该环节充分利用了 Java 线程强隔离架构 **MDC 模式 (底层依托 ThreadLocal)** 实现存储。其负责将获取到的字串信息单独赋予到分配给当前用户请求的处理线程上进行隔离。在生命周期期间所有执行的下游 DAO 调用乃至捕获出的堆栈打印，都会通过 AOP 或字节代理等模式主动访问并提取挂靠的唯一识别符。这些结构化附带识别位的海量监控碎片最终通过 Agent 同步输送至集中式的大规模观测管理体系（如 Zipkin）。
`,
        targetCode: `package com.codeforge.observability;\n\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n// 依赖 pom 集成的 micrometer 无侵入地监控应用调用链\n@RestController\npublic class ObservabilityController {\n\n    // 借助原生日志记录器输出即可自动绑定链路核心参数\n    private static final Logger log = LoggerFactory.getLogger(ObservabilityController.class);\n\n    @GetMapping("/api/checkout/heavy-process")\n    public String complexCheckoutProcess() {\n        \n        // 在控制台查看日志输出形式将被自动包裹附加 Trace 上下文特征：\n        // [backend-app, 7d81cc23f..., d9a3b...] 1. 开始校验订单信息特征...\n        log.info("1. 开始校验订单信息特征...");\n        \n        // 模拟执行链路上的重度资源访问延迟\n        doHardWork();\n\n        log.info("2. 核对完毕通过。结账节点发送结果成功落盘。");\n        return "Checkout traced completely successful.";\n    }\n\n    private void doHardWork() {\n        try { \n            Thread.sleep(500); \n        } catch(InterruptedException ignored){}\n    }\n}\n`,
        comments: [
            { line: 15, text: '// 代码逻辑解耦，底层代理机制完成上下文字串投递' },
            { line: 24, text: '// 日志将按照模板设置定向吐出给集中式链路分析层' },
            { line: 36, text: '// 同一线程调用栈深处发生的任何输出将与此标识强行关联绑定' },
        ],
    },
    {
        id: 'devops-m6-1', type: 'backend',
        title: '课程 6.1：Docker 底层核心多阶段全构建',
        category: '模块6：极致容器编排与环境脱离', track: 'DevOps & Cloud Native',
        moduleNumber: 6, lessonNumber: 1, language: 'dockerfile',
        startingCode: '',
        instructions: `# 容器多阶段构建与云原生环境隔离

## 业务上下文
"在我本地运行正常" 是阻碍团队异构网络节点部署交付的公认顽疾。传统应用程序在推向线上主机由于底层操作内核模块、共享链接库以及环境变量配置不齐常常导致启动异常。
**Docker 容器引擎**将整套执行库和依赖生态打包整合进入标准化快照生态。业界生产环节更推崇：**多阶段分层构建 (Multi-Stage Builds)**。极度压缩去除测试套件和庞大的源头编译组件，向线上仅输送出几兆极尽轻量的高性能镜像。

## 代码与配置解析
- **基础构建环 \`AS builder\`**：在 Dockerfile 首个阶段引入全尺寸镜像源，包括所有编译所需的 CLI 工具及巨大的包管理器 \`node_modules\` 库。并进行高负荷的资源集成，打出待转移的生成产物（如 React 构建出的前端资源 \`dist/ \`）。
- **第二阶段薄核级运行层**：再次书写 \`FROM\` 时，调用一个如 \`alpine\` 型只余几十兆内核体积的高净低耗版本 OS 层。
- **\`COPY --from=builder\` 文件迁移**：跨边界提取。系统从首个阶段截获烧编译完成的 \`dist\` 构建制品，迁移拷贝进新建的无尘环境内进行集成。如此，下发的生产实例彻底抛离了高达数 G 的多余调试套件，使镜像传输及启动分配节点的耗时极速跌落缩减而且防范了源代码的安全泄漏危险。

## 底层原理深度剖析
**Namespace 进程资源隔离与 Cgroups 阈值切分**
相较于传统的主机级完全硬件虚拟化技术模型（如 VMWare），其系统启动时间极长并严重占用了上百兆宿主机无谓 RAM 开销以挂载客户机内核进程。
Docker 直接共享使用了基于主机现有的宿主 Linux Native 系统架构功能模块支撑起了高密度低时延轻量级平行云分布生态。两大内核调度支柱如下：
1. **Namespaces（空间挂锁隔离）**：利用命名隔离作用域功能，阻拦不同的容器组件跨容器共享内存树且不可互相操作。容器的进程内环境能持有虚拟路由分层端口、根权限进程和网络环境分配项结构，根除应用程序争抢或网络 IP 以及环境冲突的污染风险。
2. **Cgroups（控制组算力配额控制）**：提供硬件架构层的可配置阻断（QoS 保护器）。用以限制并划分该容器进程所能合法透支使用的系统 CPU 周期百分比以及 RAM 上界阀值。在微服务大量横向排布集群的环境下，当出现某一边缘进程恶性故障溢出越界试图吞噬算力时，内核基于配额会将其快速阻遏查杀乃至分配内存锁定阻截（OOM-Killed），从而对混合云机器的其他共生节点的执行构成极强的抗扰保护壁垒。
`,
        targetCode: `# 阶段 1：开发集成环境提供齐整复杂的依赖解析并拉取代码编排打包\nFROM node:20-alpine AS builder\nWORKDIR /app\n# 进行庞大规模构建环境所需的文件关联依赖整合下载\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# 阶段 2：生产运行环境建立最小化驱动基础核体，精简冗杂环境\nFROM node:20-alpine\nWORKDIR /app\n\n# 跨阶搬运：剥离系统级编译源代码栈体库，精确提取出构建产物与配置\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/package.json ./package.json\n\n# 仅安装维持应用运行所需的最核心轻型基础包体依赖资源\nRUN npm install --omit=dev\n\nEXPOSE 80\nCMD ["npx", "serve", "-s", "dist", "-l", "80"]\n`,
        comments: [
            { line: 2, text: '#  全功能编译阶段，提供完整构建工具链路支持' },
            { line: 11, text: '#  轻量级纯净执行基座阶段，摒除多余依赖' },
            { line: 16, text: '#  利用多阶段提取缓存编译件以彻底清洗并丢弃源数据代码栈' },
            { line: 20, text: '#  排除测试及编译工具链安装，交付极致精细尺寸' },
        ],
    },
];
