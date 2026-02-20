package com.tutorial.mapper;

import com.tutorial.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis mapper interface for User entity CRUD operations.
 * SQL definitions are in resources/mapper/UserMapper.xml.
 */
@Mapper
public interface UserMapper {

    User findById(@Param("id") Long id);

    User findByUsername(@Param("username") String username);

    User findByEmail(@Param("email") String email);

    int insert(User user);

    int update(User user);

    int deleteById(@Param("id") Long id);
}
