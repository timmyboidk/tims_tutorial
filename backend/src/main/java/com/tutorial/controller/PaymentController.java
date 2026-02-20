package com.tutorial.controller;

import com.tutorial.model.Payment;
import com.tutorial.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Payment REST controller.
 * Provides endpoints for processing payments and querying status.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payments/process — Submit a payment for processing.
     * The payment is persisted, cached in Redis, and sent to Kafka
     * for asynchronous processing by the PaymentConsumer.
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Payment payment) {
        String paymentId = paymentService.processPayment(payment);
        return ResponseEntity.accepted()
                .body(Map.of(
                        "paymentId", paymentId,
                        "status", "PENDING",
                        "message", "Payment is being processed asynchronously"));
    }

    /**
     * GET /api/payments/status/{id} — Query the current status of a payment.
     * Checks Redis cache first for fast lookups, falls back to MySQL.
     */
    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, String>> getPaymentStatus(@PathVariable("id") String paymentId) {
        String status = paymentService.getPaymentStatus(paymentId);
        if ("NOT_FOUND".equals(status)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
                "paymentId", paymentId,
                "status", status));
    }
}
