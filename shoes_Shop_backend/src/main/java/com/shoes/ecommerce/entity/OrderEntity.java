package com.shoes.ecommerce.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "orders")
public class OrderEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderItem> items = new ArrayList<>();

	private String status;

	// epoch millis
	private Long createdAt;

	@Column(length = 1000)
	private String shippingAddress;

	private String phone;

	private String method;

	private String shipper;

	@Column(length = 1000)
	private String cancelReason;

	private Double total;

	public OrderEntity() {}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public List<OrderItem> getItems() { return items; }
	public void setItems(List<OrderItem> items) { this.items = items; }

	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }

	public Long getCreatedAt() { return createdAt; }
	public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

	public String getShippingAddress() { return shippingAddress; }
	public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
	// map JSON field "address" to shippingAddress for frontend compatibility
	@JsonProperty("address")
	public void setAddress(String address){ this.shippingAddress = address; }
	@JsonProperty("address")
	public String getAddress(){ return this.shippingAddress; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public String getMethod() { return method; }
	public void setMethod(String method) { this.method = method; }

	public String getShipper() { return shipper; }
	public void setShipper(String shipper) { this.shipper = shipper; }

	public String getCancelReason() { return cancelReason; }
	public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

	public Double getTotal() { return total; }
	public void setTotal(Double total) { this.total = total; }
}

