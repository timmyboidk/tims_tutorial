import type { Lesson } from '../types';

export const devopsAdvanced: Lesson[] = [
    {
        id: 'devops-adv-testbe', type: 'backend',
        title: 'JUnit 与 Testcontainers 容器化测试',
        category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
        moduleNumber: 8, lessonNumber: 1, language: 'java',
        startingCode: '',
        instructions: `# 后端防御：用真实的数据库做测试\n\n## 业务上下文\n后端最痛苦的就是用一台 H2 内存数据库糊弄自己的单元测试，因为它的方言和 MySQL、PostgreSQL 根本不一样，导致上线就炸。我们使用 Testcontainers 在跑 JUnit 单元测试时，用代码驱动 Docker 秒弹一个真实的 MySQL 集群容器！\n\n## 学习目标\n- \`@Testcontainers\` 架构整合。\n- 构建极硬核绝对不会受环境污染的独立单元测试。`,
        targetCode: `package com.codeforge.testing;\n\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.context.DynamicPropertyRegistry;\nimport org.springframework.test.context.DynamicPropertySource;\nimport org.testcontainers.containers.MySQLContainer;\nimport org.testcontainers.junit.jupiter.Container;\nimport org.testcontainers.junit.jupiter.Testcontainers;\nimport static org.assertj.core.api.Assertions.assertThat;\n\n// 💡 激活容器调度外挂\n@Testcontainers\n@SpringBootTest\npublic class VideoRepositoryIntegrationTest {\n\n    // 💡 测试开始的瞬间，这段代码将让本机的 Docker 下载并后台拽起一个干净的 MySQL 8 环境！\n    @Container\n    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")\n            .withDatabaseName("test_db")\n            .withUsername("test_user")\n            .withPassword("test_pass");\n\n    // 💡 覆盖 Spring 读取默认远端 DB 的配置文件，将流量诱导进测试容器的动态高随机端口里\n    @DynamicPropertySource\n    static void configureProperties(DynamicPropertyRegistry registry) {\n        registry.add("spring.datasource.url", mysql::getJdbcUrl);\n        registry.add("spring.datasource.username", mysql::getUsername);\n        registry.add("spring.datasource.password", mysql::getPassword);\n    }\n\n    @Autowired\n    private VideoRepository videoRepository;\n\n    @Test\n    void shouldSuccessfullyWriteAndRead() {\n        // 在纯正的原味 MySQL 里执行验证\n        VideoEntity video = new VideoEntity("101", "How to use Testcontainers");\n        videoRepository.save(video);\n        \n        assertThat(videoRepository.findById("101")).isPresent();\n    }\n}\n`,
        comments: [
            { line: 13, text: '// 💡 宣告这个类需要操作真实的 Docker 引擎' },
            { line: 18, text: '// 💡 用完即抛掷的纯净隔离环境' },
            { line: 26, text: '// 💡 移花接木：由于容器起的端口是动态生成的，强行篡改 Spring 的配置池' },
        ],
    },
    {
        id: 'devops-adv-testfe', type: 'frontend',
        title: '前端铁桶阵：React Testing Library',
        category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
        moduleNumber: 8, lessonNumber: 2, language: 'typescript',
        startingCode: '',
        instructions: `# 保护交互逻辑的护体金刚\n\n## 业务上下文\n前端的 Bug 最能引起用户的反感（比如点赞点不中，弹窗关不掉）。有了 Jest 体系，我们可以直接拿代码“模拟一个瞎眼的用户”去疯狂敲打网页，这就是 React Testing Library 这款框架大放异彩的地方。它倡导“按照用户访问应用的方式去测试它”的哲学。\n\n## 学习目标\n- 按照语义和行为捕捉 DOM。\n- \`fireEvent\` 的集成与测试断言。`,
        targetCode: `import { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom'; // 提供 .toBeInTheDocument 之类的断言增强\nimport { InteractiveLikeButton } from '@/components/InteractiveLikeButton';\n\ndescribe('InteractiveLikeButton 组件行为测试', () => {\n  \n  it('初始状态应该正确渲染点赞数量并呈未点赞形态', () => {\n    // 💡 在 Jest 的虚拟 Node 引擎 (JSDOM) 中渲染该组件\n    render(<InteractiveLikeButton videoId="v99" initialLikes={100} />);\n    \n    // 💡 永远使用能描述视力障碍者也能理解的标签（Text 或 Role）去寻找内容，而不是脆弱的 CSS class\n    const btn = screen.getByRole('button', { name: /🤍 点赞 100/i });\n    \n    expect(btn).toBeInTheDocument();\n    expect(btn).toHaveClass('text-gray-700');\n  });\n\n  it('点击后由于乐观 UI 更新，立刻变为红色并数字 +1', () => {\n    render(<InteractiveLikeButton videoId="v99" initialLikes={100} />);\n    const btn = screen.getByRole('button');\n\n    // 💡 模拟人手点击\n    fireEvent.click(btn);\n\n    // 💡 这个就是测试代码价值万金的核心价值\n    expect(screen.getByText('❤️ 已赞 101')).toBeInTheDocument();\n    expect(btn).toHaveClass('bg-red-500 text-white');\n  });\n});\n`,
        comments: [
            { line: 8, text: '// 💡 赋予浏览器引擎的上下文，将 React 装载成内部虚拟 DOM 对象' },
            { line: 11, text: '// 💡 这是测试金科玉律的最佳实践' },
            { line: 22, text: '// 💡 模拟动作，引发 React 中的 setIsLiked 连环变动' },
            { line: 25, text: '// 💡 UI 的终极断言' },
        ],
    },
    {
        id: 'devops-adv-actions', type: 'backend',
        title: '自动化持续集成 (GitHub Actions)',
        category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
        moduleNumber: 8, lessonNumber: 3, language: 'yaml',
        startingCode: '',
        instructions: `# CI/CD：无人干预的发布流\n\n## 业务上下文\n任何成熟的老板都会规定：不要让人去发版和跑测试。一旦代码回合或 PR（Pull Request）并入 \`main\` 分支，代码托管平台（如 GitHub 或 GitLab）自动触发远程机器挂载构建任务。这就是 CI（持续集成）。\n\n## 学习目标\n- 拥抱 YAML 声明式的构建工作流。\n- 掌握步骤（Steps）对应用状态的组装控制。`,
        targetCode: `name: 🚀 Backend CI Pipeline\n\n# 💡 触发条件：当你或者你的同事发起 PR 到 main 分支时，此机器启动\non:\n  pull_request:\n    branches: [ "main" ]\n    paths:\n      - 'backend/**' # 💡 节省费用的微操作：只针对后端的更改跑后端的构建\n\njobs:\n  build-and-test:\n    runs-on: ubuntu-latest # 在最新的云端开源 Linux 环境下跑\n\n    steps:\n      # 💡 1️⃣ 抓取代码到机器里\n      - name: Checkout Code\n        uses: actions/checkout@v4\n\n      # 💡 2️⃣ 配置 Java 运行水土\n      - name: Set up JDK 21\n        uses: actions/setup-java@v3\n        with:\n          java-version: '21'\n          distribution: 'temurin'\n          cache: gradle # 开启依赖包缓存加速任务流！\n\n      # 💡 3️⃣ 使用构建工具的纯洁模式：运行所有的 JUnit 和 Testcontainers\n      - name: Run Unit & Integration Tests\n        working-directory: ./backend\n        run: ./gradlew test\n\n      # 💡 4️⃣ 保障底线：确保通过所有阻拦后能打出生产用的 jar 包\n      - name: Build with Gradle\n        working-directory: ./backend\n        run: ./gradlew bootJar\n`,
        comments: [
            { line: 4, text: '# 💡 挂载钩子' },
            { line: 11, text: '# 💡 声明免费服务器集群环境（对于企业就是自建的 Runner）' },
            { line: 23, text: '# 💡 速度！下一次你跑的时候不会傻傻重新下载 2G 的核心包' },
            { line: 29, text: '# 💡 CI 流的核心目的：不许破损代码进入主城（合并拦截）' },
        ],
    },
    {
        id: 'devops-adv-k8s', type: 'backend',
        title: 'K8s 高级调度：Ingress 与 Helm 制图',
        category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
        moduleNumber: 8, lessonNumber: 4, language: 'yaml',
        startingCode: '',
        instructions: `# Ingress 流量守门员\n\n## 业务上下文\n通过 M6 我们掌握了 Deployment。但在企业集群里，你有几十上百个后端，如果挨个向全世界报出自己 NodePort 的公网端口会异常危险。 我们使用 Ingress 绑定一个顶级域名，它扮演最前方的高级 Nginx 负载网关。\n\n## 学习目标\n- \`Ingress\` 资源的配置。\n- 根据域名路径调度至下方不同微服务。`,
        targetCode: `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: saas-ingress-router\n  annotations:\n    # 💡 我们将使用非常主流的 nginx ingress controller 为后座力\n    kubernetes.io/ingress.class: "nginx"\n    # 💡 如果用户发起了极高并发点赞，在这截流重写，减轻下游压力\n    nginx.ingress.kubernetes.io/limit-rps: "100"\n    # 💡 最前端强行部署 HTTPS 证书安全套接\n    cert-manager.io/cluster-issuer: "letsencrypt-prod"\nspec:\n  tls:\n    - hosts:\n      - api.codeforge-saas.com\n      secretName: saas-tls-cert\n  rules:\n    # 💡 只要是打在这个公网域名上的包，都给我吃进来做分发计算\n    - host: api.codeforge-saas.com\n      http:\n        paths:\n          # 💡 前缀匹配\n          - path: /user-service\n            pathType: Prefix\n            backend:\n              service:\n                name: saas-user-cluster-service # 我们写的 K8s Service ID\n                port:\n                  number: 80\n          - path: /video-service\n            pathType: Prefix\n            backend:\n              service:\n                name: saas-video-feed-service\n                port:\n                  number: 80\n`,
        comments: [
            { line: 8, text: '# 💡 API 网关流量控制：Nginx 配置直接用原生标示化实现' },
            { line: 12, text: '# 💡 Tls 加密配置阵列' },
            { line: 17, text: '# 💡 这里将外部 HTTP 世界的野路子与云原生的规范管道对接' },
            { line: 26, text: '# 💡 指向下沉至 K8s 内部署的普通 Service (不用暴露给公网独立 IP)' },
        ],
    }
];
