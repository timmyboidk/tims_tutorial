package com.tutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Spring Boot entry point for the CodeForge backend.
 * Enables async processing for Kafka event handling.
 */
@SpringBootApplication
@EnableAsync
public class CodeForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeForgeApplication.class, args);
    }
}
