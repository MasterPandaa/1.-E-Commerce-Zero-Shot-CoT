function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = { parsePagination };
