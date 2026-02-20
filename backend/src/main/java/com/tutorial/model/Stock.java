package com.tutorial.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stock entity mapped to the `stocks` table.
 * Represents an inventory item with price and quantity tracking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    private Long id;
    private String symbol;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
