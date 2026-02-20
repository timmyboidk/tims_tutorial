package com.tutorial.mapper;

import com.tutorial.model.Stock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper interface for Stock entity CRUD operations.
 */
@Mapper
public interface StockMapper {

    List<Stock> findAll();

    Stock findById(@Param("id") Long id);

    Stock findBySymbol(@Param("symbol") String symbol);

    List<Stock> findByCategory(@Param("category") String category);

    int insert(Stock stock);

    int update(Stock stock);

    int deleteById(@Param("id") Long id);
}
