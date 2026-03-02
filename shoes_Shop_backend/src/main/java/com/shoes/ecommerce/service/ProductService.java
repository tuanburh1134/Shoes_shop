package com.shoes.ecommerce.service;

import com.shoes.ecommerce.dto.ProductDTO;
import com.shoes.ecommerce.entity.Product;
import com.shoes.ecommerce.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final Logger logger = LoggerFactory.getLogger(ProductService.class);

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDTO> listAll() {
        logger.info("Fetching all products");
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(p -> new ProductDTO(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getBrand(), p.isHot(),
                    p.getImage(), p.getDetailImage(), p.getDetail(), p.getDiscount(), p.getSize(),
                    p.getQty39(), p.getQty40(), p.getQty41(), p.getQty42(), p.getQty43(), p.getQty44()))
                .collect(Collectors.toList());
    }

    public ProductDTO create(ProductDTO dto) {
        // determine hot tag automatically for certain brands
        boolean hot = dto.getBrand() != null && (dto.getBrand().equalsIgnoreCase("labubu") || dto.getBrand().equalsIgnoreCase("adidas"));
        Product p = new Product(dto.getName(), dto.getDescription(), dto.getPrice(), dto.getBrand(), hot);
        p.setImage(dto.getImage());
        p.setDetailImage(dto.getDetailImage());
        p.setDetail(dto.getDetail());
        p.setDiscount(dto.getDiscount());
        p.setSize(dto.getSize());
        p.setQty39(dto.getQty39());
        p.setQty40(dto.getQty40());
        p.setQty41(dto.getQty41());
        p.setQty42(dto.getQty42());
        p.setQty43(dto.getQty43());
        p.setQty44(dto.getQty44());
        Product saved = productRepository.save(p);
        return new ProductDTO(saved.getId(), saved.getName(), saved.getDescription(), saved.getPrice(), saved.getBrand(), saved.isHot(),
            saved.getImage(), saved.getDetailImage(), saved.getDetail(), saved.getDiscount(), saved.getSize(),
            saved.getQty39(), saved.getQty40(), saved.getQty41(), saved.getQty42(), saved.getQty43(), saved.getQty44());
    }

    public ProductDTO update(Long id, ProductDTO dto) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return null;
        Product p = opt.get();
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setBrand(dto.getBrand());
        p.setImage(dto.getImage());
        p.setDetailImage(dto.getDetailImage());
        p.setDetail(dto.getDetail());
        p.setDiscount(dto.getDiscount());
        p.setSize(dto.getSize());
        p.setQty39(dto.getQty39());
        p.setQty40(dto.getQty40());
        p.setQty41(dto.getQty41());
        p.setQty42(dto.getQty42());
        p.setQty43(dto.getQty43());
        p.setQty44(dto.getQty44());
        // recalc hot flag
        boolean hot = dto.getBrand() != null && (dto.getBrand().equalsIgnoreCase("labubu") || dto.getBrand().equalsIgnoreCase("adidas"));
        p.setHot(hot);
        Product saved = productRepository.save(p);
        return new ProductDTO(saved.getId(), saved.getName(), saved.getDescription(), saved.getPrice(), saved.getBrand(), saved.isHot(),
            saved.getImage(), saved.getDetailImage(), saved.getDetail(), saved.getDiscount(), saved.getSize(),
            saved.getQty39(), saved.getQty40(), saved.getQty41(), saved.getQty42(), saved.getQty43(), saved.getQty44());
    }

    public boolean delete(Long id) {
        if (!productRepository.existsById(id)) return false;
        productRepository.deleteById(id);
        return true;
    }
}
