import type { Lesson } from '../types';

export const backendM1M3: Lesson[] = [
    {
        id: 'be-1-1', type: 'backend',
        title: '课程 1.1：Spring Boot 3.5.9 SaaS 基础设施',
        category: '模块1：核心架构与容器启动', track: '后端工程',
        moduleNumber: 1, lessonNumber: 1, language: 'java',
        illustrationUrl: '/illustrations/w3_springboot_arch_1771635622918.png',
        startingCode: '',
        instructions: `# Spring Boot 3.5.9 与 IoC 容器底层机制

## 业务上下文
在构建大型企业级后台应用（如视频流媒体系统的用户、支付、分析服务）时，组件之间的强耦合会导致维护成本呈指数级上升。Spring Boot 3.5.9 配合 AOT 编译优化，提供了一套基于控制反转（IoC）的高效解耦方案。作为现代 Java 领域的核心基础设施，它通过在启动时预装配各项自动化配置（Auto-configuration），极大地简化了应用环境的搭建。

## 代码与配置解析
- **\`@SpringBootApplication\`**：这是一个高度组合化的注解，内部聚合了 \`@Configuration\`, \`@EnableAutoConfiguration\`, 和 \`@ComponentScan\`。它指示 Spring Boot 扫描当前包及子包下的所有组件，并尝试根据 \`pom.xml\` 中的依赖进行默认的自动化配置（如内嵌 Tomcat 和数据源等）。
- **\`@RestController\`**：这是 \`@Controller\` 和 \`@ResponseBody\` 的组合注解，标识该类用于开发 RESTful web 服务。返回的 Java 对象将被底层 \`HttpMessageConverter\`（如 Jackson）直接序列化为 JSON 格式响应给客户端，而非进行传统的视图模板解析。
- **\`SpringApplication.run\`**：Java 程序的 \`main\` 执行入口。调用此方法会触发整个 Spring 容器的上下文初始化，加载并实例化所有的 Bean 组件。

## 底层原理深度剖析
**IoC（控制反转）与 Bean 生命周期机制：**
在传统的面向对象编程中，若组件 A 依赖于组件 B，A 需要在内部自行 \`new\` 创建 B 的实例，这构成了强耦合。IoC 容器推翻了这种模式，将对象创建与依赖管理的控制权从开发者手中交还给框架。
Spring 容器在启动时，主要经历两个阶段：
1. **Bean 定义加载阶段**：通过扫描特定注解（如 \`@Service\`, \`@Component\`），将这些类的元数据解析为 \`BeanDefinition\` 注册到容器。
2. **实例化与依赖注入（DI）**：通过反射机制调用构造器或工厂方法，统一生存在 \`BeanFactory\` 级别的对象池内（默认为单例模式 Singleton）。当其他组件需要使用时，通过构造器注入，将内存中已存在的 Bean 引用无缝关联到该组件，从而构建出松散分离但在运行时又高度聚合的企业级应用大网。
`,
        targetCode: `package com.codeforge.video;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n// 启用 Spring Boot 3.5.9 的自动配置机制与组件扫描\n@SpringBootApplication\n// 声明 RESTful 接口控制器，默认返回 JSON 数据\n@RestController\npublic class VideoSaaSApplication {\n\n    // 应用程序入口\n    public static void main(String[] args) {\n        SpringApplication.run(VideoSaaSApplication.class, args);\n    }\n\n    // 提供基础的健康检查探针点，方便 Kubernetes 等编排工具探活\n    @GetMapping("/api/health")\n    public String healthCheck() {\n        return "Video SaaS Backend is Running and Green!";\n    }\n}\n`,
        comments: [
            { line: 9, text: '// 初始化 Spring 引擎与上下文环境' },
            { line: 11, text: '// 为前后端分离架构提供 API 响应支持' },
            { line: 19, text: '// 声明简单的存活与就绪状态探针' },
        ],
    },
    {
        id: 'be-1-2', type: 'backend',
        title: '课程 1.2：三层架构与 MyBatis 动态持久化',
        category: '模块1：核心架构与容器启动', track: '后端工程',
        moduleNumber: 1, lessonNumber: 2, language: 'java',
        illustrationUrl: '/illustrations/backend_microservices.png',
        startingCode: '',
        instructions: `# 经典三层架构与 MyBatis 持久化机制

## 业务上下文
在复杂的企业工程中，如果将参数校验、业务逻辑处理、数据库调用全部耦合在 Controller 层，会形成极差的架构反模式。为了实现职责分离与高度可维护性，应用通常遵循标准的三层架构：**Controller 层（接口分发与校验） -> Service 层（核心业务逻辑处理） -> Mapper/DAO 层（数据持久化）**。本应用采用轻量级框架 MyBatis 处理与关系型数据库的通信。

## 代码与配置解析
- **\`@Mapper\` 或 Mapper 接口**：声明用于数据库操作的接口。不需要手工编写实现类，只需添加诸如 \`@Select\` 这样的注解或配合 XML 映射文件来定义 SQL 执行语句。
- **\`@Service\` 与构造器注入**：标识业务逻辑层类。采用现代 Spring 推崇的构造器注入模式，取代字段级别的依赖注入，这不仅有利于编写单元测试，也彻底杜绝了注入循环依赖的问题。
- **防注入预编译机制**：在 MyBatis 的注解里使用 \`#{username}\`，底层会将其转换为 JDBC 标准的 \`PreparedStatement\` 中的占位符 \`?\`，从而在驱动级别防范常见的 SQL 注入攻击。

## 底层原理深度剖析
**MyBatis 的 JDK 动态代理机制如何简化持久层开发？**
在传统的 JDBC 中，开发者需要手工获取连接、编写 SQL、设置参数并执行、然后遍历 \`ResultSet\` 手动做对象映射，同时必须管理连接关闭。
MyBatis 将这些样板代码高度封装。当 Spring Boot 与 MyBatis 整合并在启动阶段时，MyBatis 利用 Java 的动态代理机制（如 \`Proxy.newProxyInstance\`），在内存中动态生成了一个实现了 \`UserMapper\` 接口的代理对象，并注册到 Spring IoC 容器中。
当请求在运行时调取 \`findByUsername\` 时，执行流会被切入代理类的 \`InvocationHandler.invoke()\` 方法中，该方法解析对应方法上的元信息与绑定的 SQL，将 \`#{}\` 参数化处理，并向底层的 HikariCP 连接池申请连接执行查询，最终通过反射机制自动完成从数据行到实体对象字段的值映射，这就是现代化半自动 ORM 的核心原理。
`,
        targetCode: `package com.codeforge.video.user;\n\nimport org.apache.ibatis.annotations.Mapper;\nimport org.apache.ibatis.annotations.Select;\nimport org.springframework.stereotype.Service;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.PathVariable;\nimport org.springframework.web.bind.annotation.RestController;\n\n// [Mapper层]：映射数据库操作接口\n@Mapper\npublic interface UserMapper {\n    // 采用预编译 PreparedStatement 防范 SQL 注入\n    @Select("SELECT * FROM users WHERE username = #{username}")\n    UserEntity findByUsername(String username);\n}\n\n// [Service层]：业务逻辑统一处理层\n@Service\npublic class UserService {\n    private final UserMapper userMapper;\n\n    // 推荐使用构造器注入依赖，以确保对象创建时即处于稳固的安全状态\n    public UserService(UserMapper userMapper) {\n        this.userMapper = userMapper;\n    }\n\n    public UserEntity getUserData(String username) {\n        return userMapper.findByUsername(username);\n    }\n}\n\n// [Controller层]：HTTP 接口层，负责请求接受与响应\n@RestController\npublic class UserController {\n    private final UserService userService;\n\n    public UserController(UserService userService) {\n        this.userService = userService;\n    }\n\n    // 路径变量映射提取参数\n    @GetMapping("/api/users/{username}")\n    public UserEntity getUserByUsername(@PathVariable String username) {\n        // 将请求转发至业务层，实现层级分离\n        return userService.getUserData(username);\n    }\n}\n`,
        comments: [
            { line: 12, text: '// MyBatis 生成动态代理简化持久层代码' },
            { line: 20, text: '// 业务层统筹跨模块的复合逻辑业务' },
            { line: 34, text: '// 暴露 REST 接口供前端调用' },
            { line: 43, text: '// 控制层不涉及处理实际的底层逻辑' },
        ],
    },
    {
        id: 'be-2-1', type: 'backend',
        title: '课程 2.1：AOP 拦截器与 JWT 无状态认证',
        category: '模块2：安全屏障与无状态扩展', track: '后端工程',
        moduleNumber: 2, lessonNumber: 1, language: 'java',
        illustrationUrl: '/illustrations/w3_jwt_auth_1771635695409.png',
        startingCode: '',
        instructions: `# AOP 拦截器机制与 JWT 无状态认证架构

## 业务上下文
在基于 RESTful 与前后端分离的 SaaS 后端集群中，为了保持微服务的高扩展性，系统摒弃传统的基于 Session 的状态管控体系，改用无状态的 JWT (JSON Web Token) 进行认证。
面对成千上万受保护的内网 API 接口，若在每个业务方法中硬编码校验 Token 的逻辑，不仅造成重复冗余，更极易因遗漏导致越权漏洞。利用 Spring 的 \`HandlerInterceptor\`，可以在请求触达 Controller 之前实现一站式的集中身份鉴权。

## 代码与配置解析
- **\`HandlerInterceptor\` 接口**：用于实现横切关注点的轻量级手段。重写 \`preHandle\` 方法，这是由于请求在路由完毕后但尚未调用 Handler 之前触发。返回 \`true\` 则放行，返回 \`false\` 则拦截响应。
- **\`Jwts.parser()\` 验签拦截**：系统提取请求头中的 \`Authorization\` 字段内容，然后通过配置的机密密钥 (\`SECRET_KEY\`) 对令牌的内容进行合法性算力校验。一旦签名验证不通过即触发 \`JwtException\`。
- **请求属性 \`setAttribute\` 传递**：基于 HTTP 解析完成的数据会在同一次请求生命周期的线程中流通。将签发者解析出存入 request，方便后续的业务流程直接从环境中获取该身份。

## 底层原理深度剖析
**AOP (面向切面编程) 范式的工程化应用：**
Interceptor 属于 AOP 设计思想的体现。AOP 的核心在于横切关注点隔离（Cross-cutting concerns）。不论是认证验签、全局日志记录还是链路追踪，这些逻辑都与具体的业务逻辑无关。通过将其抽离封装并在执行流截面切入，可在保持主干业务对象的专一内聚性的同时叠加防护层。

**JWT 的无状态特性与 HMAC-SHA256 签名机制：**
无状态 JWT 抛弃了服务端的映射存储需求。它的核心依赖哈希摘要运算。服务器端会在客户端登录时将基础用户标识封装为 JSON 字符串并结合内网密钥计算出密文签名（Signature）发送回去。
随后的每次请求里，服务端收到 Token 后只需要对其明文负载部分用相同的 \`SECRET_KEY\` 进行单向摘要重新计算一遍，若得出的签名结果与发来的尾部串字符完全匹配，即可在数学上证明：此 Token 未曾遭到伪造或中间人篡改。这就是 JWT 保障横向扩张的计算学基石。
`,
        targetCode: `package com.codeforge.security;\n\nimport io.jsonwebtoken.Claims;\nimport io.jsonwebtoken.Jwts;\nimport io.jsonwebtoken.SignatureException;\nimport io.jsonwebtoken.JwtException;\nimport org.springframework.stereotype.Component;\nimport org.springframework.web.servlet.HandlerInterceptor;\nimport jakarta.servlet.http.HttpServletRequest;\nimport jakarta.servlet.http.HttpServletResponse;\n\n// 建立全局请求拦截层，用于集中身份鉴权\n@Component\npublic class JwtAuthInterceptor implements HandlerInterceptor {\n    \n    // 服务端持有的机密私钥，用于 HMAC-SHA256 哈希计算\n    private static final String SECRET_KEY = "YourSuperSecretEnterpriseGradeKeyForSaaSApplication";\n\n    @Override\n    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {\n        String header = request.getHeader("Authorization");\n\n        // 初步验证携带的基础头信息格式\n        if (header == null || !header.startsWith("Bearer ")) {\n            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);\n            return false;\n        }\n\n        String token = header.substring(7);\n        try {\n            // 基于安全密钥的强制验签与声明解析\n            Claims claims = Jwts.parser()\n                .setSigningKey(SECRET_KEY.getBytes())\n                .parseClaimsJws(token)\n                .getBody();\n\n            // 萃取身份实体并置入当前请求上下文中透传\n            request.setAttribute("userId", claims.getSubject());\n            return true; \n        } catch (JwtException e) {\n            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);\n            return false;\n        }\n    }\n}\n`,
        comments: [
            { line: 12, text: '// Web 层的集中切面拦截处理' },
            { line: 15, text: '// 加密与验证的核心共享盐值' },
            { line: 30, text: '// 校验签名合法性，失败则直接中断链式处理' },
            { line: 36, text: '// 透传安全上下文数据给底层业务控制层' },
        ],
    },
    {
        id: 'be-2-2', type: 'backend',
        title: '课程 2.2：Redis 高频热点缓存层',
        category: '模块2：安全屏障与无状态扩展', track: '后端工程',
        moduleNumber: 2, lessonNumber: 2, language: 'java',
        illustrationUrl: '/illustrations/w3_redis_cache_1771635654039.png',
        startingCode: '',
        instructions: `# Redis 缓存体系与 LRU 淘汰机制

## 业务上下文
在高并发的短视频和电商系统中，读多写少是典型的系统特性。如果超高 QPS 流量全部透穿命中到底层基于磁盘存储的关系型数据库 (\`MySQL\`)，会引发现象级的系统资源耗尽。
引入 **Redis** 构建缓冲体系，能够大幅度接管前序查询，其基于物理内存级的 IO 将使接口响应呈几个数量级跃升。

## 代码与配置解析
- **\`@Cacheable\`（读命中）**：Spring Data Cache 的声明式注解。在执行具体的方法体入库查询前，系统会在 Redis 缓冲层根据设定好的命名空间与 \`key\`（缓存主键）探寻是否已存有数据。若存在则直接返回阻断下层查询，反之则将方法实际计算结果回填入缓存池供下次读取。
- **防碰撞命名**：如定义 \`value = "video"\`，系统实际将存储在类似 \`video::123\` 这样的唯一前缀空间内，避免在大容量库中的 ID 杂乱。
- **\`@CachePut\`（双写刷新）**：应用于内容更新与保存方法上。不仅持久化到硬盘数据库中，还通过对应 Key 刷新 Redis 中的旧缓存条目。这是解决后端数据一致性架构的基础方案之一。

## 底层原理深度剖析
**Redis 为何能以单线程模型实现 10 万 QPS 并发？**
由于 Redis 的操作主要涉及内存变量读写，单个 CPU 的寻址指令已经达到了纳秒级极速范畴。为了避免高昂的多线程调度上下文频繁切换损耗以及锁块开销，Redis 内核坚持采用 **单核线程 + 多路 I/O 复用机制**（即底层操作系统支持的 \`epoll\` 事件分发）来统辖大批量的 TCP 套接字状态变更。在这种模型下，每个核心指令操作都是原子的单线序，榨干了单点架构的吞吐量并避免了资源竞争报错。

**缓存容量限制与 LRU 回收机制设计：**
内存是极为昂贵的稀缺计算资源，无法留存全部宽泛数据。Redis 配置有数据驱逐机制来释放溢出空间，常见的做法是 **LRU (Least Recently Used，最近最少使用算法)**。
当启动内存回收策略时，系统内部会为维护每个缓存条目的最近触发访问时间戳标记。当占用容量趋于设定峰值导致预警，Redis 引擎根据这些时间信息将长时间未被重用的冷端尾部数据进行精准销毁回收，保障缓存队列中主要吸纳和存储最具业务价值的高频热点数据。
`,
        targetCode: `package com.codeforge.video.service;\n\nimport org.springframework.cache.annotation.Cacheable;\nimport org.springframework.cache.annotation.CachePut;\nimport org.springframework.stereotype.Service;\n\n// 采用缓存服务阻隔底层 DB 压力\n@Service\npublic class VideoCacheService {\n\n    private final VideoRepository videoRepository;\n\n    public VideoCacheService(VideoRepository videoRepository) {\n        this.videoRepository = videoRepository;\n    }\n\n    // 查询优化：在进入 IO 瓶颈点前由 AOP 层基于键值检索内存\n    @Cacheable(value = "video", key = "#id")\n    public VideoEntity getVideoInfo(String id) {\n        \n        System.out.println("发生缓存穿透现象，触发源磁盘库读取操作: " + id);\n        return videoRepository.findById(id).orElse(null);\n    }\n\n    // 缓存一致性：执行源数据强制更新并双写至内存库体系\n    @CachePut(value = "video", key = "#video.id")\n    public VideoEntity updateVideoInfo(VideoEntity video) {\n        System.out.println("落库写盘同时推送刷新缓存域以同步实时内容: " + video.getId());\n        return videoRepository.save(video);\n    }\n}\n`,
        comments: [
            { line: 19, text: '// 以极低的延迟代价拦截超过 90% 的穿透调用逻辑' },
            { line: 23, text: '// 后台日志如果没有打印，则代表实现了高速纯缓存命中读取' },
            { line: 28, text: '// 置换写入更新，消除数据存在的新旧背离风险' },
        ],
    },
    {
        id: 'be-3-1', type: 'backend',
        title: '课程 3.1：Kafka 事件驱动与解耦',
        category: '模块3：事件驱动与异步通信', track: '后端工程',
        moduleNumber: 3, lessonNumber: 3, language: 'java',
        illustrationUrl: '/illustrations/w3_kafka_events_1771635638993.png',
        startingCode: '',
        instructions: `# Kafka 事件驱动架构的高并发解耦

## 业务上下文
在现代微服务演进中，若某核心干流（如用户注册）需要同步调用众多衍生流程（例如发送通讯邮件、发放奖励、安全审计等），将导致整个请求处理链路极度拉长。任何外围服务的宕机都会引发业务的全盘异常失败。
引入 **事件驱动架构 (Event-Driven Architecture)**，使用高吞吐量消息中间件 **Apache Kafka** 担任系统中央事件总线枢纽。系统从直接的 RPC 级联调度转变为发布-订阅模型，使得微服务环境拥有极高的弹性解耦与容灾缓冲。

## 代码与配置解析
- **\`KafkaTemplate.send()\`**：发起端的事件声明。将系统结构化的信息派发至既定的逻辑频道（Topic）。该动作非阻塞并且执行迅捷，它不再关注或等待后续子流程完成状况，去除了直接同步调用造成的线程积压。
- **\`@KafkaListener\`**：各独立的下游消费服务通过持久化长连 Kafka 通道监听，即使遇到某个网络接收节点宕机重启，它们仍会在重启后按照 Kafka 保留的 Offset 游标位置重新拉取累积消息执行补偿，不间断恢复任务。

## 底层原理深度剖析
**传统 MQ 的吞吐瓶颈与 Kafka 的 Append-Only 顺序写及预读机制**
许多早期的队列引擎直接将重度负载保存在非连续的磁盘指针甚至内存易丢失介质中。而 Kafka 是以高持久度磁盘为核心载体的海量级别日志系统。由于机械硬盘对顺序写入操作非常友好（大大缩短了不必要的物理寻道及跳转时间），Kafka 强制规定每个 Partition 日志采用 **Append-Only（仅后向连续追加）** 存储结构，结合内核高级别 PageCache 处理读写缓冲，令它的极大数据写入性能甚至直接比肩其它引擎单在普通内存中的运转效率指标。

**Zero-Copy 零拷贝实现网卡流投递的性能飞跃**
在下放投递环节，Kafka 没有传统应用那种【磁盘 -> 内核层 -> 进程内存层 -> 内核层Socket -> 网卡】的高衰缩开支拷贝。它依赖底层调用 \`sendfile()\` 等原语手段进行物理直接挂接通信，让读取的事件文件集流直接穿透到内核的传输缓冲，大大节约了 CPU 的多层态搬迁工作负载。

**消费者群组（Consumer Group）实现分流并行**
面对同一个业务 Topic，不同的下游消费群需要通过设定互异的 Group ID 获取数据拷贝（如：计费集群和风控集群互相平行获取整全信息）。若是同功能且同属于一个消费组，事件流负载会根据组内的在线机器实例进行拆散互斥分发，使得集群不仅实现模块级别功能隔离，同样支撑多态纵深水平拉伸部署架构。
`,
        targetCode: `package com.codeforge.events;\n\nimport org.springframework.kafka.core.KafkaTemplate;\nimport org.springframework.kafka.annotation.KafkaListener;\nimport org.springframework.stereotype.Service;\n\n// 事件发布端：削减主干系统的调用树依赖\n@Service\npublic class UserRegistrationService {\n\n    private final KafkaTemplate<String, String> kafkaTemplate;\n\n    public UserRegistrationService(KafkaTemplate<String, String> kafkaTemplate) {\n        this.kafkaTemplate = kafkaTemplate;\n    }\n\n    public void completeUserRegistration(String userId) {\n        // 1. 完成系统内主域数据持久入库等高优必须动作\n        System.out.println("源发地领域实体保存完成归档: " + userId);\n\n        // 2. 将事件广播至全局领域边界总线频道中：将衍生计算投递至异构池\n        kafkaTemplate.send("user-registration-events", userId);\n    }\n}\n\n// 事件订阅端：高度自治并行的消费端下游实例处理\n@Service\npublic class AsyncNotificationListeners {\n    \n    // 基于特定消费分组配置监听群：独立派发相关通知资源\n    @KafkaListener(topics = "user-registration-events", groupId = "email-marketing-group")\n    public void sendWelcomeEmailStrategy(String userId) {\n        System.out.println("进入独立系统队列处理分片: 发发邮件推送处理指向 - " + userId);\n    }\n\n    // 依托旁路逻辑消费分组，获取独立偏移量进度：进行审计日志计算\n    @KafkaListener(topics = "user-registration-events", groupId = "anti-fraud-security-group")\n    public void checkBlackListActivity(String userId) {\n        System.out.println("启动独立风险计算侦测线程: 实施数据采集评估信誉 - " + userId);\n    }\n}\n`,
        comments: [
            { line: 20, text: '// 解耦：异步非阻塞派发总线广播消息，快速从方法栈回退' },
            { line: 31, text: '// 定义群组名称使得订阅方可以在横向集群层面平均分配执行负载' },
            { line: 38, text: '// 不同的 group ID 相互完全平行的截取所有事件广播序列不受他者打断' },
        ],
    },
];
