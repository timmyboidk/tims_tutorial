package com.tutorial.service;

import com.tutorial.mapper.UserMapper;
import com.tutorial.model.User;
import com.tutorial.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 核心认证服务层 (Service)，专门用于处理用户的注册和登录业务逻辑。
 * 安全规范：绝不明文存储密码，这里使用 Spring Security 的 BCrypt 算法进行不可逆哈希加密；
 * 状态管理：抛弃传统的 Session 方案，登录成功后直接向客户端签发无状态的 JWT 令牌。
 */
@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new user. Returns a map with user info and JWT token.
     *
     * @throws IllegalArgumentException if username or email already exists
     */
    public Map<String, Object> register(String username, String email, String password) {
        // 【第一步】防御性校验：检查数据库中是否已存在被注册的用户名（保持数据唯一性）
        if (userMapper.findByUsername(username) != null) {
            throw new IllegalArgumentException("Username already exists");
        }
        // 【第二步】校验防重：确保该邮箱尚未与系统内的其它账号绑定
        if (userMapper.findByEmail(email) != null) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role("USER")
                .build();

        userMapper.insert(user);

        String token = jwtUtil.generateToken(username, "USER");

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", username);
        result.put("email", email);
        result.put("token", token);
        return result;
    }

    /**
     * Authenticate a user by username and password. Returns JWT token on success.
     *
     * @throws IllegalArgumentException if credentials are invalid
     */
    public Map<String, Object> login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(username, user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", username);
        result.put("token", token);
        return result;
    }
}
