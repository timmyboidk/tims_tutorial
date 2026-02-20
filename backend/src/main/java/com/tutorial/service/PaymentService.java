package com.tutorial.service;

import com.tutorial.model.Payment;
import com.tutorial.mapper.PaymentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Payment processing service.
 * - Persists payment records via MyBatis
 * - Caches status in Redis for fast lookups
 * - Publishes payment events to Kafka for async processing
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final String PAYMENT_TOPIC = "payment-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final PaymentMapper paymentMapper;

    public PaymentService(KafkaTemplate<String, String> kafkaTemplate,
            RedisTemplate<String, String> redisTemplate,
            PaymentMapper paymentMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.redisTemplate = redisTemplate;
        this.paymentMapper = paymentMapper;
    }

    /**
     * Initiate a payment: persist to DB, cache in Redis, send Kafka event.
     *
     * @return the generated payment ID
     */
    public String processPayment(Payment payment) {
        String paymentId = UUID.randomUUID().toString();
        payment.setPaymentId(paymentId);
        payment.setStatus("PENDING");

        // Persist to MySQL via MyBatis
        paymentMapper.insert(payment);

        // Cache the PENDING status in Redis with 30-minute TTL
        redisTemplate.opsForValue().set(
                "payment:" + paymentId,
                "PENDING",
                Duration.ofMinutes(30));

        // Publish event to Kafka for async processing
        kafkaTemplate.send(PAYMENT_TOPIC, paymentId, payment.toJson())
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Payment event sent: id={}, topic={}, offset={}",
                                paymentId,
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send payment event: id={}", paymentId, ex);
                        // Update Redis with FAILED status
                        redisTemplate.opsForValue().set(
                                "payment:" + paymentId,
                                "FAILED",
                                Duration.ofMinutes(30));
                    }
                });

        return paymentId;
    }

    /**
     * Get the current status of a payment.
     * Checks Redis cache first, falls back to database.
     */
    public String getPaymentStatus(String paymentId) {
        // Try Redis cache first for speed
        String cached = redisTemplate.opsForValue().get("payment:" + paymentId);
        if (cached != null) {
            return cached;
        }

        // Fallback to database
        Payment payment = paymentMapper.findByPaymentId(paymentId);
        return payment != null ? payment.getStatus() : "NOT_FOUND";
    }
}
