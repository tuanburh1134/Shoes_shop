package com.shoes.ecommerce.controller;

import com.shoes.ecommerce.entity.User;
import com.shoes.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/me")
public class UserProfileController {
    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository){ this.userRepository = userRepository; }

    @GetMapping
    public ResponseEntity<User> me(Principal principal){
        if(principal == null) return ResponseEntity.status(401).build();
        return userRepository.findByUsername(principal.getName()).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<User> update(Principal principal, @RequestBody User payload){
        if(principal == null) return ResponseEntity.status(401).build();
        var opt = userRepository.findByUsername(principal.getName());
        if(opt.isEmpty()) return ResponseEntity.notFound().build();
        var u = opt.get();
        // allow updating addresses and avatarUrl and phone/email
        u.setAddresses(payload.getAddresses());
        if(payload.getAvatarUrl()!=null) u.setAvatarUrl(payload.getAvatarUrl());
        if(payload.getEmail()!=null) u.setEmail(payload.getEmail());
        userRepository.save(u);
        return ResponseEntity.ok(u);
    }
}
