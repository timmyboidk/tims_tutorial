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
 * 具有高性能 Redis 缓存保护层的商品/库存服务 (Stock Management)。
 * 核心优势：对于 C 端的频繁查询请求，将会把数据缓存至 Redis 内存中（TTL 为 5 分钟），
 * 藉此抵挡大流量直击底层 MySQL 数据库，也就是常说的“读写分离及缓存抗压”。
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
        // 【双写一致性保障】发生更新事件时，必须主动销毁 Redis 中残留的旧缓存 (Invalidate)，强制下次查询走数据库
        redisTemplate.delete(CACHE_PREFIX + stock.getId());
        log.info("Updated stock: id={}, symbol={}", stock.getId(), stock.getSymbol());
        return stock;
    }

    public void delete(Long id) {
        stockMapper.deleteById(id);
        // 【缓存双删/淘汰】物理删除记录后，连同缓存池中的残留一并抹除
        redisTemplate.delete(CACHE_PREFIX + id);
        log.info("Deleted stock: id={}", id);
    }
}
