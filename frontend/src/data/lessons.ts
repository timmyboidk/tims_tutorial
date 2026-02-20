import type { Lesson } from '../types';
import { frontendM1M2 } from './frontend-m1-m2';
import { frontendM3M5 } from './frontend-m3-m5';
import { backendM1M3 } from './backend-m1-m3';
import { backendM4M6 } from './backend-m4-m6';

import { advancedFrontend } from './advanced-frontend';
import { advancedBackend } from './backend-advanced';
import { devopsAdvanced } from './devops-advanced';

/**
 * 完整课程目录：合并所有模块的课程数据
 *
 * 方向1：超大规模前端架构（React、Next.js、TypeScript）
 *   模块1-5：原基础与架构相关
 *
 * 方向2：弹性企业后端与 DevOps（Spring Boot 3.x）
 *   模块1-6：原 Spring Boot 与容器基础
 * 
 * 方向3：全栈进阶与工程化
 *   模块6(横向)：前端深水区高级架构
 *   模块7：微服务进阶、网关与 GraphQL
 *   模块8：自动化测试基建、CI/CD流水线与高级 K8s
 */
export const lessons: Lesson[] = [
    ...frontendM1M2,
    ...frontendM3M5,
    ...backendM1M3,
    ...backendM4M6,
    ...advancedFrontend,
    ...advancedBackend,
    ...devopsAdvanced,
];
