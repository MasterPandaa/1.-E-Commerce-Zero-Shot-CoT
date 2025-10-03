require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3000;

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

// Ensure required directories exist
ensureDir(path.join(__dirname, "..", "uploads"));
ensureDir(path.join(__dirname, "..", "uploads", "products"));
ensureDir(path.join(__dirname, "..", "logs"));

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
