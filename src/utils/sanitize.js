const xss = require('xss');

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return xss(str.trim());
}

function sanitizeObject(obj) {
  const out = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      out[key] = typeof val === 'string' ? sanitizeString(val) : val;
    }
  }
  return out;
}

module.exports = { sanitizeString, sanitizeObject };
