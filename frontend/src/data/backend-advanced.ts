import type { Lesson } from '../types';

export const advancedBackend: Lesson[] = [
    {
        id: 'be-adv-oauth2', type: 'backend',
        title: 'Spring Security OAuth2.0 与社交登录',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 1, language: 'java',
        startingCode: '',
        instructions: `# 引入 OAuth2.0 社交登录\n\n## 业务上下文\n在现代商业应用中，让用户单独注册账号阻力极大，他们更愿意用微信、Google 或 GitHub 直接一键登录。我们要通过 Spring Security 的 OAuth2 Client 插件解决这复杂的重定向和令牌窃取流程。\n\n## 学习目标\n- OAuth2 的基本理念。\n- \`SecurityFilterChain\` 的无缝配置。\n\n##  完整参考代码\n\`\`\`typescript\npackage com.codeforge.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            //  保护那些需要敏感登录信息的接口
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            //  这一行代码开启了统一接管 Google、GitHub、微信的跳转
            // 只要你在 application.yml 里给足 ClientID 和 Secret
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/dashboard", true)
            )
            //  我们不需要原生的 form 提交
            .formLogin(form -> form.disable())
            //  作为纯 API 后端，关掉 CSRF 并转为纯无状态
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
\n\`\`\``,
        targetCode: `package com.codeforge.security;\n\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\nimport org.springframework.security.config.annotation.web.builders.HttpSecurity;\nimport org.springframework.security.web.SecurityFilterChain;\n\n@Configuration\npublic class SecurityConfig {\n\n    @Bean\n    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n        http\n            //  保护那些需要敏感登录信息的接口\n            .authorizeHttpRequests(auth -> auth\n                .requestMatchers("/api/public/**").permitAll()\n                .requestMatchers("/api/admin/**").hasRole("ADMIN")\n                .anyRequest().authenticated()\n            )\n            //  这一行代码开启了统一接管 Google、GitHub、微信的跳转\n            // 只要你在 application.yml 里给足 ClientID 和 Secret\n            .oauth2Login(oauth2 -> oauth2\n                .defaultSuccessUrl("/dashboard", true)\n            )\n            //  我们不需要原生的 form 提交\n            .formLogin(form -> form.disable())\n            //  作为纯 API 后端，关掉 CSRF 并转为纯无状态\n            .csrf(csrf -> csrf.disable());\n\n        return http.build();\n    }\n}\n`,
        comments: [
            { line: 15, text: '//  精确控制哪个接口属于公有地带' },
            { line: 21, text: '//  Spring Security 提供极其优雅的一键式 OAuth 接管' },
            { line: 27, text: '//  API 应用关闭传统的跨站防御策略，由 JWT 主宰' },
        ],
        diagramMarkup: `sequenceDiagram\n    participant User as 用户\n    participant API as Spring Boot\n    participant Google as OAuth 提供商 (如 GitHub)\n    \n    User->>API: 请求访问 /dashboard\n    API-->>User: 302 重定向到 Github 授权页面\n    User->>Google: 输入账号密码，同意授权\n    Google-->>API: 回调 /login/oauth2/code/github，携带授权码 Code\n    API->>Google: 携带 Code 在后端网络中静默换取 Access Token 与资料\n    Google-->>API: 返回 { "email": "test@xxx.com" }\n    API-->>User: 签署本站 JWT 并发放。安全！`,
    },
    {
        id: 'be-adv-rate', type: 'backend',
        title: 'Redis 高并发限流 (Rate Limiting)',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 2, language: 'java',
        startingCode: '',
        instructions: `# 利用 Lua 脚本和 Redis 防御接口大并发过载\n\n## 业务上下文\n如果有一个黑客对你的“发短信验证码”接口 1 秒跑 1 万次请求，你的云短信账户会在这 1秒内被扣光余额。你需要为敏感 API 上锁，限流是构建稳固架构的核心机制（Rate Limiting）。我们将利用 Redis 和它执行 Lua 脚本时的绝对原子性，打造精准防护。\n\n## 学习目标\n- Redis Lua Script \`EVAL\` 原理。\n- 构建自定义 \`@RateLimit\` 注解和 AOP 拦截器。\n\n##  完整参考代码\n\`\`\`typescript\npackage com.codeforge.security.ratelimit;

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
    
    //  Lua 脚本，本身具备原子操作，绝不去读了再写导致超卖或者跨步
    private static final String LUA_SCRIPT = 
        "local current = redis.call('get', KEYS[1]) " +
        "if current and tonumber(current) >= tonumber(ARGV[1]) then return 0 end " +
        "if current then redis.call('incr', KEYS[1]) else redis.call('set', KEYS[1], 1, 'EX', tonumber(ARGV[2])) end " +
        "return 1";

    public RateLimitAspect(StringRedisTemplate redisTemplate, HttpServletRequest request) {
        this.redisTemplate = redisTemplate;
        this.request = request;
    }

    //  AOP 环绕：任何含有 @RateLimit 的接口被撞击前，都必须过这一关
    @Around("@annotation(rateLimit)")
    public Object enforceLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String clientIp = request.getRemoteAddr();
        String key = "ratelimit:" + joinPoint.getSignature().getName() + ":" + clientIp;

        Long isAllowed = redisTemplate.execute(
            new DefaultRedisScript<>(LUA_SCRIPT, Long.class),
            Collections.singletonList(key),
            String.valueOf(rateLimit.maxCalls()),
            String.valueOf(rateLimit.timeWindowSeconds())
        );

        if (isAllowed == null || isAllowed == 0L) {
            throw new RuntimeException("操作过于频繁，已经被系统限流！");
        }

        //  限流通过，放行继续执行真实长耗时业务逻辑
        return joinPoint.proceed();
    }
}
\n\`\`\``,
        targetCode: `package com.codeforge.security.ratelimit;\n\nimport org.aspectj.lang.ProceedingJoinPoint;\nimport org.aspectj.lang.annotation.Around;\nimport org.aspectj.lang.annotation.Aspect;\nimport org.springframework.data.redis.core.StringRedisTemplate;\nimport org.springframework.data.redis.core.script.DefaultRedisScript;\nimport org.springframework.stereotype.Component;\nimport jakarta.servlet.http.HttpServletRequest;\n\nimport java.util.Collections;\n\n@Aspect\n@Component\npublic class RateLimitAspect {\n\n    private final StringRedisTemplate redisTemplate;\n    private final HttpServletRequest request;\n    \n    //  Lua 脚本，本身具备原子操作，绝不去读了再写导致超卖或者跨步\n    private static final String LUA_SCRIPT = \n        "local current = redis.call('get', KEYS[1]) " +\n        "if current and tonumber(current) >= tonumber(ARGV[1]) then return 0 end " +\n        "if current then redis.call('incr', KEYS[1]) else redis.call('set', KEYS[1], 1, 'EX', tonumber(ARGV[2])) end " +\n        "return 1";\n\n    public RateLimitAspect(StringRedisTemplate redisTemplate, HttpServletRequest request) {\n        this.redisTemplate = redisTemplate;\n        this.request = request;\n    }\n\n    //  AOP 环绕：任何含有 @RateLimit 的接口被撞击前，都必须过这一关\n    @Around("@annotation(rateLimit)")\n    public Object enforceLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {\n        String clientIp = request.getRemoteAddr();\n        String key = "ratelimit:" + joinPoint.getSignature().getName() + ":" + clientIp;\n\n        Long isAllowed = redisTemplate.execute(\n            new DefaultRedisScript<>(LUA_SCRIPT, Long.class),\n            Collections.singletonList(key),\n            String.valueOf(rateLimit.maxCalls()),\n            String.valueOf(rateLimit.timeWindowSeconds())\n        );\n\n        if (isAllowed == null || isAllowed == 0L) {\n            throw new RuntimeException("操作过于频繁，已经被系统限流！");\n        }\n\n        //  限流通过，放行继续执行真实长耗时业务逻辑\n        return joinPoint.proceed();\n    }\n}\n`,
        comments: [
            { line: 20, text: '//  Redis Server 执行这段 Lua 脚本时，其它任何请求必须等待它执行完' },
            { line: 33, text: '//  AOP：面向切面编程。动态代理接管逻辑' },
            { line: 38, text: '//  一次网络 IO 获取是阻断还是放行的最终裁决' },
        ],
    },
    {
        id: 'be-adv-gateway', type: 'backend',
        title: 'Spring Cloud Gateway 微服务网关',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 3, language: 'java',
        startingCode: '',
        instructions: `# 统一大门：微服务 API 网关\n\n## 业务上下文\n当我们把应用拆成“用户中心”（端口 8081）、“订单系统”（端口 8082）、“视频馈送”（端口 8083）时，前端根本不用记住这些杂乱的端口。网关（Gateway）作为前端流量唯一的进口，将依据路径分发流量到集群，同时网关还能做统一鉴权。\n\n## 学习目标\n- Spring Cloud Gateway 核心概念。\n- \`RouteLocator\` 配置。\n\n##  完整参考代码\n\`\`\`typescript\npackage com.codeforge.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRouter {

    //  非常直观的基于 Java 的编程路由定义
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            //  流量分发：所有形如 /api/users/** 的访问，砍掉 /api 塞进 8081
            .route("user_microservice", r -> r
                .path("/api/users/**")
                .filters(f -> f.stripPrefix(1)) 
                .uri("http://localhost:8081")
            )
            //  流量分发：形如 /api/videos/** 进入主力集群
            .route("video_microservice", r -> r
                .path("/api/videos/**")
                .filters(f -> f
                    .stripPrefix(1)
                    //  网关的霸道：给打往内部的请求暗中夹带 Header
                    .addRequestHeader("X-Gateway-Audited", "true")
                )
                .uri("http://localhost:8083")
            )
            .build();
    }
}
\n\`\`\``,
        targetCode: `package com.codeforge.gateway;\n\nimport org.springframework.cloud.gateway.route.RouteLocator;\nimport org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\n\n@Configuration\npublic class GatewayRouter {\n\n    //  非常直观的基于 Java 的编程路由定义\n    @Bean\n    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {\n        return builder.routes()\n            //  流量分发：所有形如 /api/users/** 的访问，砍掉 /api 塞进 8081\n            .route("user_microservice", r -> r\n                .path("/api/users/**")\n                .filters(f -> f.stripPrefix(1)) \n                .uri("http://localhost:8081")\n            )\n            //  流量分发：形如 /api/videos/** 进入主力集群\n            .route("video_microservice", r -> r\n                .path("/api/videos/**")\n                .filters(f -> f\n                    .stripPrefix(1)\n                    //  网关的霸道：给打往内部的请求暗中夹带 Header\n                    .addRequestHeader("X-Gateway-Audited", "true")\n                )\n                .uri("http://localhost:8083")\n            )\n            .build();\n    }\n}\n`,
        comments: [
            { line: 15, text: '//  斩断对外暴露的第一层命名空间，让内部微服务路径保持清洁' },
            { line: 26, text: '//  我们还能在网关层插入 Filter：比如统一注入 TraceId，全链路追踪用' },
        ],
        diagramMarkup: `flowchart TD\n    Frontend[ React App]\n    Gateway{网关 Gateway (端口8080)} \n    UserSV[用户中心集群]\n    VideoSV[弹幕视频集群]\n    OrderSV[收费打赏集群]\n    \n    Frontend -->|GET /api/videos/123| Gateway\n    Gateway -->|路由规则匹配并重写| VideoSV\n    Frontend -->|POST /api/users/login| Gateway\n    Gateway -->|路由匹配| UserSV`,
    },
    {
        id: 'be-adv-graphql', type: 'backend',
        title: 'Spring GraphQL 构建超级图谱',
        category: '进阶：系统架构与网关安全', track: '后端工程',
        moduleNumber: 7, lessonNumber: 4, language: 'java',
        startingCode: '',
        instructions: `# 逃离大量 API 的泥潭：GraphQL\n\n## 业务上下文\n传统 REST 有个顽疾叫 “Over-fetching（过多索取）”：前端仅仅想要视频的标题和封面，往往会被迫接收后端返回过来的包含作者详情、分类、打分等多余字段。用 GraphQL，前端只需说：“给我 title，剩下的都不要。” \n\n## 学习目标\n- 定义 \`schema.graphqls\` 描述超图。\n- 映射 \`@QueryMapping\`。\n\n##  完整参考代码\n\`\`\`typescript\npackage com.codeforge.video.graphql;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import java.util.Optional;

//  注意，这不再是 @RestController，而是普通的 Controller，所有请求命中单独的 /graphql 端点
@Controller
public class VideoGraphController {

    private final VideoRepository repo;
    private final AuthorService authorService;

    public VideoGraphController(VideoRepository repo, AuthorService authorService) {
        this.repo = repo;
        this.authorService = authorService;
    }

    //  对应 GraphQL Schema 里的 Query -> videoById
    @QueryMapping
    public Optional<VideoEntity> videoById(@Argument String id) {
        // 这是数据抓取的主入口，Spring for GraphQL 会帮你把不需要的列屏蔽在终点
        return repo.findById(id);
    }

    //  解决 N+1 困扰或跨表查询：只有当前端在请求体里点名提出要 author 时，这端代码才执行
    @SchemaMapping(typeName = "Video", field = "authorDetails")
    public Author authorDetails(VideoEntity video) {
        return authorService.getAuthorSnapshot(video.getAuthorId());
    }
}
\n\`\`\``,
        targetCode: `package com.codeforge.video.graphql;\n\nimport org.springframework.graphql.data.method.annotation.Argument;\nimport org.springframework.graphql.data.method.annotation.QueryMapping;\nimport org.springframework.graphql.data.method.annotation.SchemaMapping;\nimport org.springframework.stereotype.Controller;\nimport java.util.Optional;\n\n//  注意，这不再是 @RestController，而是普通的 Controller，所有请求命中单独的 /graphql 端点\n@Controller\npublic class VideoGraphController {\n\n    private final VideoRepository repo;\n    private final AuthorService authorService;\n\n    public VideoGraphController(VideoRepository repo, AuthorService authorService) {\n        this.repo = repo;\n        this.authorService = authorService;\n    }\n\n    //  对应 GraphQL Schema 里的 Query -> videoById\n    @QueryMapping\n    public Optional<VideoEntity> videoById(@Argument String id) {\n        // 这是数据抓取的主入口，Spring for GraphQL 会帮你把不需要的列屏蔽在终点\n        return repo.findById(id);\n    }\n\n    //  解决 N+1 困扰或跨表查询：只有当前端在请求体里点名提出要 author 时，这端代码才执行\n    @SchemaMapping(typeName = "Video", field = "authorDetails")\n    public Author authorDetails(VideoEntity video) {\n        return authorService.getAuthorSnapshot(video.getAuthorId());\n    }\n}\n`,
        comments: [
            { line: 9, text: '//  GraphQL 只有一个 POST 入口，不依赖 GET/PUT' },
            { line: 21, text: '//  当查询索要数据时执行抓取' },
            { line: 28, text: '//  这是 GraphQL 最精巧处，动态且延迟绑定的关联字段' },
        ],
    }
];
