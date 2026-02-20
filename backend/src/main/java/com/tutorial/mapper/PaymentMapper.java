package com.tutorial.mapper;

import com.tutorial.model.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper interface for Payment entity operations.
 */
@Mapper
public interface PaymentMapper {

    Payment findById(@Param("id") Long id);

    Payment findByPaymentId(@Param("paymentId") String paymentId);

    List<Payment> findByUserId(@Param("userId") Long userId);

    List<Payment> findByStatus(@Param("status") String status);

    int insert(Payment payment);

    int updateStatus(@Param("paymentId") String paymentId, @Param("status") String status);
}
