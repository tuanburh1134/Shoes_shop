package com.shoes.ecommerce.config;

import com.shoes.ecommerce.entity.Product;
import com.shoes.ecommerce.entity.User;
import com.shoes.ecommerce.repository.ProductRepository;
import com.shoes.ecommerce.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    private final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                productRepository.save(new Product("Classic Sneaker","Comfortable everyday sneaker",299000.0, "Nike", false));
                productRepository.save(new Product("Running Pro","Lightweight running shoe",499000.0, "Adidas", true));
                productRepository.save(new Product("Leather Oxford","Formal leather shoe",799000.0, "Labubu", true));
                logger.info("Sample products created");
            }
        };
    }

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", encoder.encode("admin"), "admin@example.com", "admin");
                userRepository.save(admin);
                logger.info("Default admin created: admin / admin");
            }
        };
    }
}
