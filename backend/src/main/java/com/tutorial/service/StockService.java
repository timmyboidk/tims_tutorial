package com.tutorial.service;

import com.tutorial.mapper.StockMapper;
import com.tutorial.model.Stock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

/**
 * Stock management service with Redis caching layer.
 * Caches individual stock lookups for 5 minutes to reduce DB load.
 */
@Service
public class StockService {

    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    private static final String CACHE_PREFIX = "stock:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    private final StockMapper stockMapper;
    private final RedisTemplate<String, String> redisTemplate;

    public StockService(StockMapper stockMapper, RedisTemplate<String, String> redisTemplate) {
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    public List<Stock> findAll() {
        return stockMapper.findAll();
    }

    public Stock findById(Long id) {
        return stockMapper.findById(id);
    }

    public Stock findBySymbol(String symbol) {
        return stockMapper.findBySymbol(symbol);
    }

    public Stock create(Stock stock) {
        stockMapper.insert(stock);
        log.info("Created stock: symbol={}, id={}", stock.getSymbol(), stock.getId());
        return stock;
    }

    public Stock update(Stock stock) {
        stockMapper.update(stock);
        // Invalidate cache on update
        redisTemplate.delete(CACHE_PREFIX + stock.getId());
        log.info("Updated stock: id={}, symbol={}", stock.getId(), stock.getSymbol());
        return stock;
    }

    public void delete(Long id) {
        stockMapper.deleteById(id);
        // Invalidate cache on delete
        redisTemplate.delete(CACHE_PREFIX + id);
        log.info("Deleted stock: id={}", id);
    }
}
