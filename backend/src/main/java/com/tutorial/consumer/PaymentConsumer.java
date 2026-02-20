package com.tutorial.consumer;

import com.tutorial.mapper.PaymentMapper;
import com.tutorial.model.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Kafka consumer that processes payment events asynchronously.
 * Simulates a payment gateway processing delay, then updates
 * the payment status in both MySQL and Redis.
 */
@Component
public class PaymentConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentConsumer.class);

    private final PaymentMapper paymentMapper;
    private final RedisTemplate<String, String> redisTemplate;

    public PaymentConsumer(PaymentMapper paymentMapper, RedisTemplate<String, String> redisTemplate) {
        this.paymentMapper = paymentMapper;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Listens for payment events on the "payment-events" Kafka topic.
     * Simulates async processing and updates the payment status.
     */
    @KafkaListener(topics = "payment-events", groupId = "codeforge-group")
    public void consumePaymentEvent(String message) {
        try {
            Payment payment = Payment.fromJson(message);
            String paymentId = payment.getPaymentId();

            log.info("Processing payment event: id={}, amount={} {}",
                    paymentId, payment.getAmount(), payment.getCurrency());

            // Simulate payment gateway processing delay (1-3 seconds)
            Thread.sleep(1000 + (long) (Math.random() * 2000));

            // Simulate success (90% chance) vs failure (10% chance)
            String newStatus;
            if (Math.random() < 0.9) {
                newStatus = "COMPLETED";
                log.info("Payment completed successfully: id={}", paymentId);
            } else {
                newStatus = "FAILED";
                log.warn("Payment failed (simulated): id={}", paymentId);
            }

            // Update status in database
            paymentMapper.updateStatus(paymentId, newStatus);

            // Update status in Redis cache
            redisTemplate.opsForValue().set(
                    "payment:" + paymentId,
                    newStatus,
                    Duration.ofMinutes(30));

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing interrupted", e);
        } catch (Exception e) {
            log.error("Error processing payment event: {}", e.getMessage(), e);
        }
    }
}
