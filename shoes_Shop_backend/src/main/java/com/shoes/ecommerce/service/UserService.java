package com.shoes.ecommerce.service;

import com.shoes.ecommerce.dto.AuthResponse;
import com.shoes.ecommerce.dto.LoginRequest;
import com.shoes.ecommerce.dto.RegisterRequest;
import com.shoes.ecommerce.entity.User;
import com.shoes.ecommerce.exception.AuthenticationFailedException;
import com.shoes.ecommerce.exception.ResourceAlreadyExistsException;
import com.shoes.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        logger.info("Register attempt for username={}", req.getUsername());
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ResourceAlreadyExistsException("username.already.exists");
        }
        String hashed = passwordEncoder.encode(req.getPassword());
        User u = new User(req.getUsername(), hashed, req.getEmail(), "user");
        userRepository.save(u);
        logger.info("User registered: {}", req.getUsername());
        return new AuthResponse(u.getUsername(), "Registration successful", u.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        logger.info("Login attempt for username={}", req.getUsername());
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new AuthenticationFailedException("invalid.credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new AuthenticationFailedException("invalid.credentials");
        }
        logger.info("User authenticated: {}", user.getUsername());
        return new AuthResponse(user.getUsername(), "Login successful", user.getRole());
    }
}
