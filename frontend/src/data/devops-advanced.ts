import type { Lesson } from '../types';

export const devopsAdvanced: Lesson[] = [
  {
    id: 'devops-adv-testbe', type: 'backend',
    title: 'JUnit 与 Testcontainers 容器化测试',
    category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
    moduleNumber: 8, lessonNumber: 1, language: 'java',
    startingCode: '', targetCode: '',
    instructions: `# 引入 Testcontainers 构建可重现的容器级集成测试

## 业务上下文
在微服务数据持久层测试中，业界曾广泛采用内存数据库（如 H2）替换生产环境中的 MySQL 作伪集群映射。但是因为 SQL 方言的隐性歧视和事物锁底层的实现互异错位，测试通过的代码一旦发版即有极速崩溃引发 P0 集群事故的系统危险。\n为应对环境隔离问题并使得开发者获取在本机 100% 仿真再现能力，在 JUnit 的底层集成架构 **Testcontainers** 库极其必要。它能够直接操纵宿主机的 Docker 引擎守护进程（Daemon API）为测试用例物理编排并弹起一个纯净独立的临时原版介质的真实数据库组件镜像实例环境。

## 代码与配置解析

\`\`\`java
package com.codeforge.testing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.assertThat;

// 1. 激活 JUnit 针对容器生命周期的事件总线侦听接管绑定配置
@Testcontainers
@SpringBootTest
public class VideoRepositoryIntegrationTest {

    // 2. 利用镜像基座声明测试期内的伴库资源实例创建需求
    // 该环境将在所有测试启封前基于 Docker API (通过 unix:///var/run/docker.sock) 启动
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
            .withDatabaseName("test_db")
            .withUsername("test_user")
            .withPassword("test_pass");

    // 3. 拦截覆写底层数据源环境，通过反射和延迟加载接管将原 Spring 配置转移定点注入
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // 由于测试容器拉起的外部暴露宿主机端口为大位面高随机数防撞库，而非原宿主固定态 3306 
        // 故必须经此完成将真实的 jdbc: 数据拨接向映射端口网关对齐动作
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private VideoRepository videoRepository;

    @Test
    void shouldSuccessfullyWriteAndRead() {
        // 在不含任何 Mock 虚构包装、最为原始的生产对等存储层执行落库
        VideoEntity video = new VideoEntity("101", "How to use Testcontainers");
        videoRepository.save(video);
        
        assertThat(videoRepository.findById("101")).isPresent();
    }
}
\`\`\`

## 底层原理深度剖析
**Ryuk 守护进程机制的孤儿容器零泄露回收**：
在并发集群测试时如果不稳定导致 JVM 主线程非正常退出熔断崩盘，原本拉设起的孤岛数据库镜像集（Containers、Volumes 网段）极易变成悬空残留占据内存吞噬磁盘空间的幽灵（Orphaned Containers）。
Testcontainers 引擎架构设计的卓绝之处在于启动核心服务时它会伴随衍生拉起一个名为 **Ryuk (资源回收机)** 的独立高优守护容器镜像体节点驻底运行。应用主线程和 Ryuk 节点时刻通过开启的心跳端口检测维系着。应用端（如 JUnit 所在进程实例 JVM ）异常离线死亡导致长链接心跳中轴即刻截停时， Ryuk 会毫无怜悯地于一秒倒计时后接管屠戮程序扫除这批在生命期内由于该实例调用创建挂载着特定厂牌 Label 标记名目的周边全套数据库实体等附加 Docker 层资产，完成高纯粹测试空间零占用遗留环保级大清退。`
  },
  {
    id: 'devops-adv-testfe', type: 'frontend',
    title: '前端铁桶阵：React Testing Library',
    category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
    moduleNumber: 8, lessonNumber: 2, language: 'typescript',
        illustrationUrl: '/illustrations/w3_react_testing_1771635678554.png',
    startingCode: '', targetCode: '',
    instructions: `# React 语义架构下组件端对端行为测试断言

## 业务上下文
针对页面布局，如果利用传统的诸如 \`Enzyme\` 之类的浅渲染框架仅针对当前其 DOM 层所处节点的特定类名或 ID 值和 state 对象实体进行断言判断测试。一经由任何 CSS 模块化的轻度修改操作重构或业务变量名称翻新都会引爆断言失败阻红触发脆弱的“假报错”系统崩溃链。\n现代开发领域普遍认同和采纳了由 **React Testing Library (RTL)** 主导发起的行为架构级测试驱动学（BDD）。其坚决主张剥离针对内部组件框架实现的细节，要求将自动化侦探视角纯粹切转入“像一位存在辅助视觉需求的用户去操作读取并感知屏幕内容”为最高导向建立极具稳固容错度能力的防御保护机制测试体系阵型。

## 代码与配置解析

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
// 引入特设版 Matcher 断言扩宽池集增强对屏幕元素的直核断言覆盖
import '@testing-library/jest-dom'; 
import { InteractiveLikeButton } from '@/components/InteractiveLikeButton';

describe('InteractiveLikeButton 交互范式行为集测', () => {
  
  it('验证组件能够根据基础入参呈装出具备无障碍可达属性 (A11y) 的渲染块', () => {
    // 1. 于纯 Node 平面利用底层集成的 jsdom 解析虚拟建树还原构建组件并载挂
    render(<InteractiveLikeButton videoId="v99" initialLikes={100} />);
    
    // 2. 将 CSS 选择器连根抛弃：采纳获取屏幕角色标出符合 ARIA 操作属性指引的目标元素
    const btn = screen.getByRole('button', { name: /启动点赞追踪 100/i });
    
    // 验证物理界面呈现存在值域以及表象参数类
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-gray-100');
  });

  it('捕获乐观更新响应交互与节点属性变更断流呈现', () => {
    render(<InteractiveLikeButton videoId="v99" initialLikes={100} />);
    const btn = screen.getByRole('button');

    // 3. 构建模拟触发实体引擎层的人工指点截断触发操作
    fireEvent.click(btn);

    // 4. 断言判定组件在面临网络调用未决（在异步微任务处理事件线间隙时）对视图进行了抢先的无缝前序重排绘制覆盖
    expect(screen.getByText('体系已采录 101')).toBeInTheDocument();
    expect(btn).toHaveClass('bg-blue-500');
  });
});
\`\`\`

## 底层原理深度剖析
**JSDOM 与 DOM 节点的可用性查询抽象隔离 (Accessibility Queries)**：
测试代码并没有实质依赖于唤醒比如 Chromium 之类的沉重渲染外核进程，这全数依靠了内置的一套采用纯 JavaScript 编写的对浏览器级 DOM 与 HTML 标准的完美高仿实现器：**JSDOM** 引擎核。\n配合以底层无障碍支持性标准指南（WAI-ARIA），当调度使用 \`getByRole('button')\` 去获取节点元素而不是通过依赖 \`document.querySelector('.like-btn')\` 时。这一层抽象操作真正做到了针对交互可达性的最终测试标尺检测。若是下层研发将其在优化之中替换为一个挂接有按钮 class 属性伪类图层级表现样式实则却并不是能够正确引发回连交互表单提送事件的 HTML5 \`<div>\` 元素时，RTL 组件库这批 Role 选择器探测器将在最前防线内极速识别出此行为盲差直接给予暴露判错封堵，确保上线交互节点合乎最原教旨般的标签事件合规准则规范。`
  },
  {
    id: 'devops-adv-actions', type: 'backend',
    title: '持续集成 (GitHub Actions) 自动化流',
    category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
    moduleNumber: 8, lessonNumber: 3, language: 'yaml',
    startingCode: '', targetCode: '',
    instructions: `# 落地 GitHub Actions 持续集成准入自动化门限

## 业务上下文
一旦将代码直接在主干网手工覆盖或者部署而越过严格的人工排查或安全红线校验，必将使构建出现难以倒退的毁灭错误事件代码污染主城体系。\n**GitHub Actions (或 GitLab CI/CD)** 把流水线式地对于程序代码进入编译检验的工兵组排查审查环节编排为了 **持续集成 (Continuous Integration, CI)** 流程序列。由机器接手充当门神对于每一个被试图并入主线分支（\`main\`）合并交汇请求 (Pull Request)，实行严密的包含静态体检、全面集测、沙盒演练通过后才能将网闸代码放流的封锁放闸守卫操作机制。

## 代码与配置解析

\`\`\`yaml
name:  Backend CI Core Defense Pipeline

# 1. 拦截引线事件触发阵位器
on:
  pull_request:
    branches: [ "main" ]
    paths:
      # 在全栈项目中实行定点拦截切断判定：仅限于波及涵盖到后端文件区的变更才推起该线执行，极度缩减计费机器能耗时开支
      - 'backend/**' 

jobs:
  # 设置此组流水线的系统载体
  build-and-test:
    runs-on: ubuntu-latest

    steps: # 组装配置链
      # 1⃣ 第一层：载入并复制系统目标文件层进隔离器
      - name: Code Repository Checkout
        uses: actions/checkout@v4

      # 2⃣ 第二层：分配底层资源配置及编译器 SDK
      - name: JDK 21 Env Initialization
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
          # 设置重置级缓存：令数 GB 的包体可以跨越构建序列被下一次复取使用，避免极端的依赖下载重建空窗期
          cache: gradle 

      # 3⃣ 第三层：调用系统检验工具，包括覆盖运行所有的单元测及 Testcontainers 对撞实体测试
      - name: Comprehensive Unit & Integration Test
        working-directory: ./backend
        run: ./gradlew test

      # 4⃣ 第四层：实施最终交付物封存编排
      - name: Compile Fat-Jar Product Artifact
        working-directory: ./backend
        run: ./gradlew bootJar
\`\`\`

## 底层原理深度剖析
**容器级微隔离流水线容器 (Runner) 组置生态环境沙盒模型**：
GitHub 所派遣的一台名唤 \`ubuntu-latest\` Runner 流水处理环境器在生命周期完结后是执行彻底物理焚毁重置化 (Ephemeral/Stateless) 的设计思路理念模型。\n这即是对以往手工机房常常饱历苦难在物理机环境里产生的包含有诸如上代缓存系统环境遗臭或者未卸载旧部文件带来的依赖“伪阳通过”状态构建错误的彻底物理绝杀隔离清剿！这绝对确保了在每一次合并校验流中所有的组件、数据下载环境和系统指令编排链全数建立在一套从头无中生有干涩纯平起点的全新时空切片维度执行重构中诞生，验证该系统的编译结构具备能够在不含任何人为介入暗桩铺设的全自动裸机生态系统部署健壮容忍度架构生命力。`
  },
  {
    id: 'devops-adv-k8s', type: 'backend',
    title: 'K8s 流量分配：Ingress 路由机制',
    category: '进阶：DevOps 与工程化', track: 'DevOps & Cloud Native',
    moduleNumber: 8, lessonNumber: 4, language: 'yaml',
        illustrationUrl: '/illustrations/w3_k8s_ingress_1771635714974.png',
    startingCode: '', targetCode: '',
    instructions: `# Ingress 流量边界控制器与内部路由网

## 业务上下文
向集群下散部署数十个内部支撑微服务（如视频组、鉴权组、计费组等核心机群）若是均采用暴露公网的物理端口组向最终用户的网段暴露提供接口并散装组合极不安全且杂乱。
在 Kubernetes 网络体系最先沿外边界构筑设置 **Ingress** 层以承接来自外部公有环境大网的入口并充任超级 7 层逆反应用网关。配合由云服务商建立的全局 LoadBalancer 加持分配，它依靠单个端口对所有的外部路径访问（Path/Domain Routing）实现并执行统一定向拦截阻断、重发路由并完成 HTTP 包体的全向拆装、HTTPS 的解密以及集群内局域路由投发。

## 代码与配置解析

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: saas-core-ingress-router
  annotations:
    # 1. 宣示采用性能强悍的 NGINX 控制器挂载核层驱动支撑路由执行分发底层指令计算动作
    kubernetes.io/ingress.class: "nginx"
    
    # 采用速率防卫护阵（Rate Limiting）：将来自单点 IP 的请求流量过压在集群边界挡外强压拒签防拖垮
    nginx.ingress.kubernetes.io/limit-rps: "100"
    
    # 结合 cert-manager 实现并自动化完成对外部握手提供安全的加密协议通道的配置化下装对接
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  # 2. 指定加密通讯认证所对应的持有证书密钥池
  tls:
    - hosts:
      - api.codeforge-saas.com
      secretName: saas-tls-cert
  
  # 3. 大流量集群分配拆入切道管网：根据包体标头请求位置向丛集深处分撒至对应不同后端承制方集群组
  rules:
    - host: api.codeforge-saas.com
      http:
        paths:
          # 前置命中路径寻址指引向内部局域命名内网集寻域进行分载
          - path: /user-service
            pathType: Prefix
            backend:
              service:
                name: saas-user-cluster-service # 被严密保护在只能内网流转的子服务名址（无需开通集群外露入口）
                port:
                  number: 80
          
          - path: /video-service
            pathType: Prefix
            backend:
              service:
                name: saas-video-feed-service
                port:
                  number: 80
\`\`\`

## 底层原理深度剖析
**Ingress Controller 反向监听轮询重载注入模型 (Control Loop Architecture)**：
纯粹配置这一叠 \`ingress.yaml\` 在集群网络生态内只是生成一具虚置数据实体资源并未涉及底层配置驱动系统实现，需要下装实实在在正在运转中的控制器 (如: ingress-nginx) 守护组件模块集群来进行实体资源响应挂载。\n这枚基于 Go 语言编写的实体控制器层时刻依附并通过 API Server 同步机制轮询挂起（Long-polling）并拦截集群内存贮内的所产生新建出来的诸如同上文一般的路由规划记录与 Service 表项变动结构体系信息。\n一旦监探获取规则信息变幻产生，其底层动作便极为暴力的自行利用拉下的参数规则推演自动编译并生成全新的 \`nginx.conf\` 最终反向推送执行了内部核心 \`nginx -s reload\` 使这些复杂的公网解密端口防撞网和层级派分流量管线得以瞬间在所有驻守并处在节点中的实例外围被立即加载并在毫秒间对生产环境发生阻击起效产生作用层！从而以一套高内聚配置文实现了跨云底座大规模架构代理配置的极致统一化调控系统能力建设。`
  }
];
