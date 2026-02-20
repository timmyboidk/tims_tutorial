import type { Lesson } from '../types';
import { frontendM1M2 } from './frontend-m1-m2';
import { frontendM3M5 } from './frontend-m3-m5';
import { backendM1M3 } from './backend-m1-m3';
import { backendM4M6 } from './backend-m4-m6';

/**
 * 完整课程目录：合并所有模块的课程数据
 *
 * 方向1：超大规模前端架构（React、Next.js、TypeScript）
 *   模块1：现代基础架构与严格类型
 *   模块2：组件架构与主线程性能
 *   模块3：Next.js 渲染范式（SSR、RSC、Islands）
 *   模块4：企业组织与微前端
 *   模块5：React Native Bridge
 *
 * 方向2：弹性企业后端与 DevOps（Spring Boot 3.x）
 *   模块1：Spring Boot 核心、持久化与性能
 *   模块2：Redis 缓存与安全
 *   模块3：事件驱动架构与容错
 *   模块4：复杂业务逻辑与弹性
 *   模块5：可观测性与分布式追踪
 *   模块6：容器化与编排（Docker、Kubernetes）
 */
export const lessons: Lesson[] = [
    ...frontendM1M2,
    ...frontendM3M5,
    ...backendM1M3,
    ...backendM4M6,
];
