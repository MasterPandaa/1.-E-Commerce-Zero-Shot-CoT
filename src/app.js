const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const compression = require("compression");
const morgan = require("morgan");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");
const sanitizeRequest = require("./middleware/sanitizeRequest");

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(
  cors({
    origin: process.env.APP_URL || "*",
    credentials: true,
  }),
);

// Body parsers with limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Sanitize incoming strings against XSS injection
app.use(sanitizeRequest);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting (generic limiter for public APIs)
app.use("/api/", rateLimiter.apiLimiter);
app.use("/api/auth/", rateLimiter.authLimiter);

// Static files with cache
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"), {
    maxAge: "7d",
    etag: true,
    dotfiles: "ignore",
  }),
);
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1h",
    etag: true,
    dotfiles: "ignore",
  }),
);

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
