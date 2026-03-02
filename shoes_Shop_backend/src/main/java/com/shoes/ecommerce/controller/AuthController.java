package com.shoes.ecommerce.controller;

import com.shoes.ecommerce.dto.AuthResponse;
import com.shoes.ecommerce.dto.LoginRequest;
import com.shoes.ecommerce.dto.RegisterRequest;
import com.shoes.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        logger.debug("Received register request for {}", req.getUsername());
        AuthResponse res = userService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        logger.debug("Received login request for {}", req.getUsername());
        AuthResponse res = userService.login(req);
        return ResponseEntity.ok(res);
    }
}

