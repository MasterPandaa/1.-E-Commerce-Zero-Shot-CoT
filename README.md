# E-Commerce (Express.js + MySQL)

A secure, performant, and maintainable E‑Commerce web application built with Node.js (Express.js) and MySQL. Features include user authentication (JWT), password reset via email, product management (with image upload), cart, checkout with simulated payment, PDF invoice generation, email confirmation, and admin dashboard with sales statistics.

## Tech Stack

- Backend: Node.js, Express.js
- Database: MySQL (mysql2)
- Auth: JWT
- File Upload: Multer
- Email: Nodemailer
- PDF: PDFKit
- Frontend: HTML, CSS, JavaScript

## Security Highlights

- Input validation and sanitization (express-validator)
- Password hashing (bcryptjs)
- JWT-based authentication
- Rate limiting (express-rate-limit)
- Secure headers (helmet), CORS, HPP
- Parameterized SQL queries to prevent SQL Injection
- Centralized error handling and logging (winston)

## Project Structure

```
src/
  app.js
  server.js
  config/
  middleware/
  utils/
  models/
  services/
  controllers/
  routes/
  public/
sql/
```

## Quick Start

1. Copy `.env.example` to `.env` and configure your environment variables.
2. Create a MySQL database and import `sql/schema.sql`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open the app at `http://localhost:3000`.

## API Overview

- Auth:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - POST `/api/auth/request-password-reset`
  - POST `/api/auth/reset-password`
- Products:
  - GET `/api/products` (pagination, filter, search)
  - GET `/api/products/:id`
  - POST `/api/products` (admin, image upload)
  - PUT `/api/products/:id` (admin, image upload)
  - DELETE `/api/products/:id` (admin)
- Cart:
  - GET `/api/cart`
  - POST `/api/cart/items`
  - PATCH `/api/cart/items/:productId`
  - DELETE `/api/cart/items/:productId`
- Checkout & Orders:
  - POST `/api/checkout`
  - GET `/api/orders`
  - GET `/api/orders/:id`
- Admin:
  - GET `/api/admin/stats`
  - GET `/api/admin/orders`
  - PATCH `/api/admin/orders/:id/status`
  - GET `/api/admin/users`

Detailed request/response examples are documented inline in route/controller code and can be expanded as needed.

## Scripts

- `npm run dev` - start with live reload (nodemon)
- `npm start` - start production server

## Notes

- For development, configure SMTP with a test provider (e.g., [Ethereal Email](https://ethereal.email/)) or your SMTP server.
- Default upload directory is `uploads/` (ignored by git). Max upload size is configurable via `UPLOAD_MAX_SIZE_MB`.
