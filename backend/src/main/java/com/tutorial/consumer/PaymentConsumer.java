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
 * 基于 Kafka 的异步消息消费者（事件驱动模型核心组件）。
 * 用途：用于承接由其它微服务投递过来的高耗时【支付计算】事件。
 * 它模拟了第三方支付网关的延迟，经过异步等待和算力消耗后，将支付的最终状态
 * 录入回传至核心业务数据库 MySQL 以及热缓存 Redis 之中。
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
     * @KafkaListener 注解：使当前方法成为指定 Topic（"payment-events"）的监听通道。
     * 当生产者在该队列中挂载了哪怕一条支付指令，本消费者就会被立即唤醒并吸取该消息进行计算。
     */
    @KafkaListener(topics = "payment-events", groupId = "codeforge-group")
    public void consumePaymentEvent(String message) {
        try {
            Payment payment = Payment.fromJson(message);
            String paymentId = payment.getPaymentId();

            log.info("Processing payment event: id={}, amount={} {}",
                    paymentId, payment.getAmount(), payment.getCurrency());

            // 这里手动阻塞线程，模拟真实世界中调用支付宝或微信支付接口所必须等待的公网通讯延迟 (1~3 秒)
            Thread.sleep(1000 + (long) (Math.random() * 2000));

            // 高级工程化模拟：引入 10% 的失败几率以体现真实网络环境下的支付掉单、余额不足或网络波动异常
            String newStatus;
            if (Math.random() < 0.9) {
                newStatus = "COMPLETED";
                log.info("Payment completed successfully: id={}", paymentId);
            } else {
                newStatus = "FAILED";
                log.warn("Payment failed (simulated): id={}", paymentId);
            }

            // [持久化落盘] 将敲定的最终支付状态 UPDATE 回 MySQL 物理表
            paymentMapper.updateStatus(paymentId, newStatus);

            // [缓存回写] 将这个凭证放入 Redis 并设置半小时过期，方便前端频繁发起轮询接口查单时瞬间返回（抗压高并发）
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
