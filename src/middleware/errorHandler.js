const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  logger.error("Error: %s", err.message, {
    stack: err.stack,
    status,
    path: req.originalUrl,
    method: req.method,
  });

  const response = {
    message: status >= 500 ? "Internal server error" : err.message || "Error",
  };
  if (!isProd && err.stack) {
    response.stack = err.stack;
  }
  if (err.errors) {
    response.errors = err.errors;
  }
  res.status(status).json(response);
}

module.exports = errorHandler;
