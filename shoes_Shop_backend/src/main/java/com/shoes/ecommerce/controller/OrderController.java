package com.shoes.ecommerce.controller;

import com.shoes.ecommerce.entity.OrderEntity;
import com.shoes.ecommerce.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService){ this.orderService = orderService; }

    @PostMapping
    public ResponseEntity<OrderEntity> createOrder(@RequestBody OrderEntity order, Principal principal){
        String user = principal == null ? null : principal.getName();
        try{
            OrderEntity created = orderService.createOrder(order, user);
            return ResponseEntity.status(201).body(created);
        }catch(IllegalArgumentException ex){
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderEntity>> listOrders(Principal principal){
        if(principal == null) return ResponseEntity.ok(List.of());
        // if caller has role ADMIN, return all orders
        // otherwise return only orders for the authenticated user
        boolean isAdmin = false;
        try{
            isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        }catch(Exception ex){ /* ignore */ }

        if(isAdmin){
            List<OrderEntity> list = orderService.listAll();
            return ResponseEntity.ok(list);
        }

        List<OrderEntity> userList = orderService.listByUsername(principal.getName());
        return ResponseEntity.ok(userList);
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderEntity> getOne(@PathVariable Long id, Principal principal){
        var opt = orderService.findById(id);
        if(opt.isEmpty()) return ResponseEntity.notFound().build();
        var o = opt.get();
        boolean isAdmin = false;
        try{ isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN")); }catch(Exception ex){ }
        String caller = principal == null ? null : principal.getName();
        String owner = o.getUser() == null ? null : o.getUser().getUsername();
        if(isAdmin || (owner != null && owner.equals(caller))){
            return ResponseEntity.ok(o);
        }
        return ResponseEntity.status(403).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}/status")
    public ResponseEntity<OrderEntity> updateStatus(@PathVariable Long id,
                                                    @RequestParam String status,
                                                    @RequestParam(required = false) String shipper,
                                                    @RequestParam(required = false) String address,
                                                    @RequestParam(required = false, name = "cancelReason") String cancelReason){
        var opt = orderService.findById(id);
        if(opt.isEmpty()) return ResponseEntity.notFound().build();
        var o = opt.get();
        switch(status.toLowerCase()){
            case "approved":
                o.setStatus("approved");
                if(shipper != null) o.setShipper(shipper);
                if(address != null) o.setShippingAddress(address);
                break;
            case "cancelled":
                o.setStatus("cancelled");
                if(cancelReason != null) o.setCancelReason(cancelReason);
                break;
            default:
                o.setStatus(status);
        }
        orderService.save(o);
        return ResponseEntity.ok(o);
    }
}
