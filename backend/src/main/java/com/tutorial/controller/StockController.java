package com.tutorial.controller;

import com.tutorial.model.Stock;
import com.tutorial.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stock/Inventory REST controller.
 * Full CRUD operations for stock items with Redis-cached reads.
 */
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    /**
     * GET /api/stocks — List all stock items.
     */
    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        List<Stock> stocks = stockService.findAll();
        return ResponseEntity.ok(stocks);
    }

    /**
     * GET /api/stocks/{id} — Get a single stock by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        Stock stock = stockService.findById(id);
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stock);
    }

    /**
     * GET /api/stocks/symbol/{symbol} — Lookup a stock by ticker symbol.
     */
    @GetMapping("/symbol/{symbol}")
    public ResponseEntity<Stock> getStockBySymbol(@PathVariable String symbol) {
        Stock stock = stockService.findBySymbol(symbol.toUpperCase());
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stock);
    }

    /**
     * POST /api/stocks — Create a new stock item.
     */
    @PostMapping
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock) {
        Stock created = stockService.create(stock);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * PUT /api/stocks/{id} — Update an existing stock item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Stock> updateStock(@PathVariable Long id, @RequestBody Stock stock) {
        stock.setId(id);
        Stock updated = stockService.update(stock);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/stocks/{id} — Delete a stock item.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        stockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
