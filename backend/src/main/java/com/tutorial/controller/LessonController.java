package com.tutorial.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Lesson API controller.
 * Serves lesson catalog data to the frontend learning platform.
 * This endpoint is public (no auth required).
 */
@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    /**
     * GET /api/lessons — Returns the lesson catalog.
     * In production, this would fetch from a database.
     * Currently returns a static catalog for the learning platform.
     */
    @GetMapping
    public List<Map<String, Object>> getAllLessons() {
        return List.of(
                Map.of(
                        "id", "react-counter",
                        "type", "frontend",
                        "title", "Build a React Counter",
                        "category", "React Fundamentals",
                        "language", "typescript"),
                Map.of(
                        "id", "tailwind-card",
                        "type", "frontend",
                        "title", "Style a Dashboard Card",
                        "category", "Tailwind CSS",
                        "language", "typescript"),
                Map.of(
                        "id", "spring-controller",
                        "type", "backend",
                        "title", "Spring Boot REST Controller",
                        "category", "Spring Boot",
                        "language", "java"),
                Map.of(
                        "id", "kafka-producer",
                        "type", "backend",
                        "title", "Kafka Event Producer",
                        "category", "Apache Kafka",
                        "language", "java"));
    }
}
