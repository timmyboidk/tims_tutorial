package com.tutorial.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User entity mapped to the `users` table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private Long id;
    private String username;
    private String email;
    private String password;

    @Builder.Default
    private String role = "USER";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
