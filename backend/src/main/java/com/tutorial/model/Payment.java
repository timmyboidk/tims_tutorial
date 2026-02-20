package com.tutorial.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment entity mapped to the `payments` table.
 * Supports JSON serialization for Kafka message payloads.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private String paymentId;
    private Long userId;
    private BigDecimal amount;

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private String status = "PENDING";

    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Serialize this Payment to a JSON string for Kafka publishing.
     */
    public String toJson() {
        try {
            return MAPPER.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize Payment to JSON", e);
        }
    }

    /**
     * Deserialize a JSON string into a Payment object.
     */
    public static Payment fromJson(String json) {
        try {
            return MAPPER.readValue(json, Payment.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize Payment from JSON", e);
        }
    }
}
