package com.tutorial.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka configuration: creates required topics on startup.
 * Producer and consumer factories are auto-configured by Spring Boot
 * via application.yml properties.
 */
@Configuration
public class KafkaConfig {

    public static final String PAYMENT_TOPIC = "payment-events";
    public static final String STOCK_TOPIC = "stock-events";

    @Bean
    public NewTopic paymentTopic() {
        return TopicBuilder.name(PAYMENT_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic stockTopic() {
        return TopicBuilder.name(STOCK_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
