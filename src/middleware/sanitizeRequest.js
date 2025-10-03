const { sanitizeString } = require("../utils/sanitize");

function sanitizeContainer(container) {
  if (!container || typeof container !== "object") return container;
  for (const key of Object.keys(container)) {
    const val = container[key];
    if (typeof val === "string") container[key] = sanitizeString(val);
  }
  return container;
}

module.exports = function sanitizeRequest(req, res, next) {
  sanitizeContainer(req.body);
  sanitizeContainer(req.query);
  sanitizeContainer(req.params);
  next();
};
