package com.shoes.ecommerce.security;

import com.shoes.ecommerce.entity.User;
import com.shoes.ecommerce.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        GrantedAuthority auth = new SimpleGrantedAuthority("ROLE_" + (u.getRole() == null ? "USER" : u.getRole().toUpperCase()));
        return new org.springframework.security.core.userdetails.User(u.getUsername(), u.getPassword(), Collections.singletonList(auth));
    }
}
