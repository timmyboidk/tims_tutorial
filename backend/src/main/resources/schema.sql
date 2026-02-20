-- ============================================================
-- CodeForge Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS codeforge;
USE codeforge;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id  VARCHAR(36)    NOT NULL UNIQUE,
    user_id     BIGINT         NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL,
    currency    VARCHAR(3)     NOT NULL DEFAULT 'USD',
    status      VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    description VARCHAR(255),
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_id (payment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stocks / Inventory table
CREATE TABLE IF NOT EXISTS stocks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    symbol      VARCHAR(10)    NOT NULL UNIQUE,
    name        VARCHAR(100)   NOT NULL,
    price       DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    quantity    INT            NOT NULL DEFAULT 0,
    category    VARCHAR(50),
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data for stocks
INSERT INTO stocks (symbol, name, price, quantity, category) VALUES
    ('AAPL', 'Apple Inc.', 189.8400, 1000, 'Technology'),
    ('GOOGL', 'Alphabet Inc.', 141.8000, 500, 'Technology'),
    ('AMZN', 'Amazon.com Inc.', 178.2500, 750, 'E-Commerce'),
    ('MSFT', 'Microsoft Corp.', 378.9100, 300, 'Technology'),
    ('TSLA', 'Tesla Inc.', 248.4200, 400, 'Automotive')
ON DUPLICATE KEY UPDATE symbol = symbol;
