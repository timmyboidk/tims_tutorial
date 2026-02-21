import type { Lesson } from '../types';

export const advancedBackend: Lesson[] = [
    {
        id: 'be-adv-oauth2', type: 'backend',
        title: 'Spring Security OAuth2.0 与社交登录',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 1, language: 'java',
        startingCode: '', targetCode: '',
        instructions: `# 引入 OAuth2.0 与 OIDC 分布式授权

## 业务上下文
在现代商业 SaaS 应用架构中，为消减新用户构建专属通行密钥（账号密码）时的转化率阻力，往往采用集成第三方可信 Identity Provider (IdP，身份提供商，如 Google, GitHub) 进行单点越权颁发登录体系。
Spring Security 生态内建的 **OAuth2 Client** 及 **OIDC (OpenID Connect)** 协议引擎能将繁重且存在安全漏洞风险的手工 Token 交换重定向流层层接管，并在底层建立起极其可靠的鉴权流链路。

## 代码与配置解析

\`\`\`java
package com.codeforge.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // 1. 挂载过滤器矩阵网段配置
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 声明 HTTP 请求级别的端点准入资源边界
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // 2. 启用内部状态机无缝托管底层 OAuth2 Code 转换换源验证链路
            // 开发只需在 application.yml 里给足 Registration ClientID 和 Secret 凭证即可
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/dashboard", true)
            )
            // 3. 架构降权：对于纯 API 驱动的前后端解耦系统，剔除由后端吐出渲染界面的 Form 表单机制
            .formLogin(form -> form.disable())
            // 彻底关停跨站请求伪造 (CSRF) 屏障防御网（因为 JWT Token 将取代 Cookie-Session 机制主宰防护）
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
\`\`\`

## 底层原理深度剖析
**OAuth2 协议的 Authorization Code (授权码) 模式流程**：
此套方案是 OAuth2 中最为稳妥严谨的授权范型，专门针对暴露在极容易被反编译的终端（如浏览器或手机 App）。
当未具备本端权限系统的用户访问时：
1. **第一次换域重定向**：前端或者 Spring 后端网关发还 \`HTTP 302\`，强制将其导引至 Google 认证防线域，这一跳带有 \`client_id\` 及验证发起方特征的密态随机 \`state\` 字串以防止 CSRF 干涉。
2. **授权中心派授 Code 票据**：用户在 Google 侧填报无误并签署授权许可后，Google 再次发生回环重定向（Callback），向 Spring 的 \`/login/oauth2/code/google\` 抛出一条极短暂寿命（通常仅几十秒）的 \`Code\` 和刚送出去做核对核验对撞比对用的 \`state\` 返回核销。\n3. **后端黑盒下的 Token 置换（Back-channel Security）**：最致命、最关键的一环。Spring 接收到这枚瞬息失效的 \`Code\` 后。绝不是交给前端，而是 **在其后台物理机之间的服务端网络深处** 发起高等级的内网网络通信并向 Google 的 \`/token\` 接口质押这枚 \`Code\` 外加保存在机器内存绝对不会外泄给使用者的 \`client_secret\` 换防提取出代表了全局操作权的 \`Access Token\` 和个人信息的 \`ID Token\`。此黑盒结构杜绝了 Token 在网线公域飞行的暴露窃取可能。`,
        diagramMarkup: `sequenceDiagram
    participant User as 用户终端
    participant API as Spring Boot (Oauth2 Client)
    participant Google as 外部身份域 (Authorization Server)
    
    User->>API: 1. 请求接入安全防卫线
    API-->>User: 2. [302 跳转] 发送往 Google 下发 state
    User->>Google: 3. 用户出示密钥执行许可授权
    Google-->>API: 4. [前端可见] 回抛带有短暂效力票据 Code
    API->>Google: 5. [暗网黑盒端] 携带 Secret 和 Code 潜行通信取回令牌
    Google-->>API: 6. 下发承载 Access Token 加密串
    API-->>User: 7. 框架接手数据并执行本地落盘建档`
    },
    {
        id: 'be-adv-rate', type: 'backend',
        title: 'Redis 高并发限流 (Rate Limiting)',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 2, language: 'java',
        illustrationUrl: '/illustrations/w3_redis_cache_1771635654039.png',
        startingCode: '', targetCode: '',
        instructions: `# 利用 Lua 脚本与 Redis 构建分布式限流引擎

## 业务上下文
在遭受短线洪压、竞品恶意重压扫描或因代码死循环造成对于像“核心注册、下抛验证短信息验证码”这种产生高昂第三方财务结算费用的计费级 API 并发踩踏时，毫无掩体的微服务将受到毁灭级财务及负载摧毁。
通过部署基于**原子态算法层级下的限流护卫 (Rate Limiting) 防御系统**极为必要。我们将引入内存介质 **Redis** 搭载并执行 **Lua 脚本** 的联合技术实现无锁化、具备极低损耗且绝对并发一致性严谨防护墙。

## 代码与配置解析

\`\`\`java
package com.codeforge.security.ratelimit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Collections;

@Aspect
@Component
public class RateLimitAspect {

    private final StringRedisTemplate redisTemplate;
    private final HttpServletRequest request;
    
    // 1. 硬编嵌装 Lua 原子态限流计数探查脚本器
    //  极简精悍指令规避分布式中读取与核写发生的竞态隔离崩塌问题
    private static final String LUA_SCRIPT = 
        "local current = redis.call('get', KEYS[1]) " +
        "if current and tonumber(current) >= tonumber(ARGV[1]) then return 0 end " +
        "if current then redis.call('incr', KEYS[1]) else redis.call('set', KEYS[1], 1, 'EX', tonumber(ARGV[2])) end " +
        "return 1";

    public RateLimitAspect(StringRedisTemplate redisTemplate, HttpServletRequest request) {
        this.redisTemplate = redisTemplate;
        this.request = request;
    }

    // 2. 借助 AOP 切面面向拦截环绕模型 (Around Advice)
    @Around("@annotation(rateLimit)")
    public Object enforceLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String clientIp = request.getRemoteAddr();
        // 编织生成极具离散性质的防撞库健名拼接
        String key = "ratelimit:" + joinPoint.getSignature().getName() + ":" + clientIp;

        // 3. 一次下发传输至极速缓存引擎内评估比对放流
        Long isAllowed = redisTemplate.execute(
            new DefaultRedisScript<>(LUA_SCRIPT, Long.class),
            Collections.singletonList(key),
            String.valueOf(rateLimit.maxCalls()),
            String.valueOf(rateLimit.timeWindowSeconds())
        );

        if (isAllowed == null || isAllowed == 0L) {
            throw new RuntimeException("Http 429 Too Many Requests: QPS 超出阀值并执行限控流操作。");
        }

        // 透穿防御阵允许直行接入系统耗时底层库服务算力开销核心中
        return joinPoint.proceed();
    }
}
\`\`\`

## 底层原理深度剖析
**纯函数稳定性引用与 Lua 原文嵌入下的多路竞态规避**：
如果采用普通代码逻辑“先执行 GET 查下数量，再做比对，最后执行 INCR 叠加”，在多节点并行大吞吐狂飙时，这三段离散命令之间的网络时延差必定会导致多个独立线程挤占进入判断前沿造成 “超发或遗漏” 这类典型的并发数据竞态冲突危机。
而由于 **Redis 实例自身为单操作线核心架构**，当其收到含有 \`EVAL\` 标识封装成块的 **Lua 脚本** 进行触发推演计算时，Redis 的指令序列阵列将会视这整片代码为不可分割的一个总体原子指令段并予以绝对占用的锁拥权限，在其推行这段逻辑的一两毫秒切片内，外部系统的一切挤压调用全数挂起后置。这彻底杜绝了多服务器查核时间间隙差。`
    },
    {
        id: 'be-adv-gateway', type: 'backend',
        title: 'Spring Cloud Gateway 微服务网关',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 3, language: 'java',
        startingCode: '', targetCode: '',
        instructions: `# 构建微服务边界基石：Spring Cloud Gateway

## 业务上下文
随着产品功能膨胀，单体被被撕裂成“用户中心”(微服端口 8081)、“计费系统”(8084)、“基础资料库”(8083) 等十几个割裂的局域内网进程服务域。客户端如果分别记忆与各自交互，会导致极度混乱的路由以及不可回避的浏览 CORS 交火风暴。
作为系统边界的最前沿护城墙阵线，我们将架构部署 **Spring Cloud Gateway**，其在底层运用 \`Project Reactor\` 和 \`Netty\` 建立的无阻塞非延时异步流向事件管理架构处理所有的前突路由分拨分发，并完成统一授权洗牌梳理。

## 代码与配置解析

\`\`\`java
package com.codeforge.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRouter {

    // 1. 通过流式构建型 DSL 书写明确系统层总线分发协议
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            
            // 2. 划拨定义模块网格切入口。所有向网关打来且形近于 /api/users/** 的包裹全数吸取统合
            .route("user_microservice_route", r -> r
                .path("/api/users/**")
                
                // 对打向后方的结构进行重写梳理过滤加工。如截肢卸掉外端用于分发的公共前缀：/api
                .filters(f -> f.stripPrefix(1)) 
                
                // 无缝对接隐藏并处于深潜状态的独立机群
                .uri("http://localhost:8081")
            )
            
            // 3. 为打向流量池重区的管线预埋标记性安全信息防伪头信息
            .route("video_microservice_route", r -> r
                .path("/api/videos/**")
                .filters(f -> f
                    .stripPrefix(1)
                    // 在请求跨界时段，为其嵌入网关独占识别防伪签名头，借此令内网服务只接受来自它放行的合法通过流量请求
                    .addRequestHeader("X-Gateway-Audited", "Verified-Internal-Safe-Level")
                )
                .uri("http://localhost:8083")
            )
            .build();
    }
}
\`\`\`

## 底层原理深度剖析
**网关体系架构下的 Netty 事件分派无阻塞底座引擎 (NIO 模型) 与反应式编程 (Reactive Programming)**：
传统的 Tomcat 引擎由于使用的是同步阻塞 IO 容器体系 (BIO) 处理。任何一个打上来的连接都被要求由服务器从珍贵的硬件系统资源池硬割分配开辟一条绝对私有专属 Thread 执行线程从头追尾贯通整个处理链。由于网关层并不从事计算仅充当转发数据层，如果是传统 Tomcat 层压着这成万条处于等待被转发节点回应回复态的死停数据请求流线程池，瞬间内存池就被耗干击穿阻死。
Spring Cloud Gateway 直接抛置更换基底引擎底盘换上基底搭载具备纯高响应强度的 **Netty** 与 Spring WebFlux。通过使用 NIO 层通过复用事件监测核心 \`epoll\` 获取全事件切面消息轮番唤醒执行态，彻底将海量 IO 受困的连接解放悬挂释放出去，仅采用寥寥几根的处理器物理核心数极高压迫高周转的高效分配计算算例模型实现了能跨量级硬吃千万级别 C10K 高压负载量数据泵透传转发的终极极限系统极差设计。`,
        diagramMarkup: `flowchart TD
    Frontend[Web / Mobile 客户端层]
    Gateway{总边界 Spring Cloud Gateway 唯一集入集市层} 
    UserSV[鉴权计费域微服集 (User)]
    VideoSV[核心物料存储域微服集 (Content)]
    
    Frontend -->|GET /api/videos/catalog| Gateway
    Gateway -->|基于 Predicate 解析与 HTTP 头信息重新解组编排封包再重写剥离| VideoSV
    Frontend -->|POST /api/users/auth| Gateway
    Gateway -->|路由转输底层| UserSV`
    },
    {
        id: 'be-adv-graphql', type: 'backend',
        title: 'Spring GraphQL 构建超级图谱',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 4, language: 'java',
        illustrationUrl: '/illustrations/w3_graphql_1771635760642.png',
        startingCode: '', targetCode: '',
        instructions: `# 构建强关联业务下的 GraphQL 组合查询态引擎

## 业务上下文
遭遇繁芜且关联性极强的内容组群渲染请求时，传统的 REST API 将彻底暴露其固执死板架构设计盲区 —— **过载捞取 (Over-fetching)** 及 **缺失索取 (Under-fetching)** 灾害链。\n前者致使带宽通道被迫超载下传了上百 KB 用户极根本不调用的无意义如作者传记等长内容串。而后者迫使用户针对深层评论内容要另外向多达数个不同切点重放进行重复网络协议建立请求消耗。\n接入 **GraphQL** 定义协议，它的强类型层不仅具备提供极精细化定级自取索求的“定制大餐”系统结构，更允许用仅有单单一次 HTTP 指令网络互锁循环传输获得结构繁复杂叠且由不同模块供应汇接的数据信息大图网集。

## 代码与配置解析

\`\`\`java
package com.codeforge.video.graphql;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import java.util.Optional;

// 1. 这里是传统 MVC 极度收敛后的表现态
// 转而全面依托在总集 /graphql 服务下利用特制控制反转路由框架体系解析流进行导向
@Controller
public class VideoGraphController {

    private final VideoRepository repo;
    private final AuthorService authorService;

    public VideoGraphController(VideoRepository repo, AuthorService authorService) {
        this.repo = repo;
        this.authorService = authorService;
    }

    // 2. 将类比 Rest 的映射转写接入底层构建定义在 resources 下 GraphQL Schema Query
    @QueryMapping
    public Optional<VideoEntity> videoById(@Argument String id) {
        // 进行顶级域数据的根系寻迹搜源获取并直接上抛挂架给 Spring 转化分拣系接手
        return repo.findById(id);
    }

    // 3. N+1 解压隔离网路：图谱化深浅连挂的精髓延迟按需激活操作逻辑
    @SchemaMapping(typeName = "Video", field = "authorDetails")
    public Author authorDetails(VideoEntity video) {
        // 这一刀代码段的隔离屏蔽逻辑保证了：
        // 唯独并在仅当：客户端利用请求 JSON 参数里面用字面量强硬标指指明向要获取这个节点内部的子集时。此部分代码执行的寻库读取算力方可获得挂架释放命令驱动，这根除一切多余无妄 DB 查询请求开支。
        return authorService.getAuthorSnapshot(video.getAuthorId());
    }
}
\`\`\`

## 底层原理深度剖析
**无状态端点与 DataFetcher 数据分拨解析器的装配原理与按需装填 (Lazy Evaluation)**：
传统的 REST 引擎下 \`/api/videos\` 强制绑定运行一个包含对子节点 SQL 解析等硬连接死锁定全套封装的方法流程。
GraphQL 对于客户端发下的一串如同嵌套对象结构一样的请求层例如：\`{ videoById(id: 1) { title, authorDetails { name } } }\` 的本质。是在服务端运行时建立生成一棵具备极高泛用解析性抽象解析语法树 AST。
系统底架构通过内置执行图引擎剥丝抽茧层进。
1. 首先识别最顶端根节点要求命中寻获被 \`@QueryMapping\` 引射标注了的 \`videoById\` 获取基础基干属性元对象数据。
2. 内部引擎再往树下潜，发现了具备深层索取要求的 \`authorDetails\` 请求配置节点。此时，内部数据处理器模块 （DataFetcher 组）会被精准激活并定向击发由 \`@SchemaMapping\` 所标记着专事对接分枝这块代码片段落逻辑补挂装接完成。
在这极为精密的组接过程中所有未被调用和波及的实体类关联和属性都陷入休眠待分配冷态静默不再启动。这不仅重铸重构了服务数据资源极巨减压降耗消耗的调取方式也赋予客户端绝对零冗余的极度结构完美纯粹收纳集合体会。`
    }
];
