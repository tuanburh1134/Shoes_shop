# Shoes Shop Backend

Simple Spring Boot backend that provides API endpoints used by the existing frontend.

Features:
- Register and Login endpoints: `POST /api/auth/register`, `POST /api/auth/login`
- Product list: `GET /api/products`
- H2 in-memory database (sample data seeded)

Run:

```bash
cd shoes_Shop_backend
mvn spring-boot:run
```

Notes for frontend integration:
- Update frontend to call `http://localhost:8080/api/auth/register` and `/api/auth/login` with JSON payloads.
- Product listing already expects `http://localhost:8080/api/products`.
- CORS is enabled for `/api/**`.
