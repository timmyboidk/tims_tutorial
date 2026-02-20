package com.tutorial.service;

import com.tutorial.mapper.UserMapper;
import com.tutorial.model.User;
import com.tutorial.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication service handling user registration and login.
 * Passwords are hashed with BCrypt; successful login returns a JWT token.
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
        // Check for existing username
        if (userMapper.findByUsername(username) != null) {
            throw new IllegalArgumentException("Username already exists");
        }
        // Check for existing email
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
