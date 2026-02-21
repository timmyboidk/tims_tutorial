package com.tutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * CodeForge 后端项目的 Spring Boot 启动入口类。
 * 启用了 @EnableAsync 异步支持，常用于 Kafka 事件和高并发任务的背线消费。
 */
@SpringBootApplication
@EnableAsync
public class CodeForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeForgeApplication.class, args);
    }
}
