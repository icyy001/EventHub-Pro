function parsePagination(query){
  const DEFAULT_LIMIT = 25;
  const MAX_LIMIT = 50;
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}
module.exports = { parsePagination };
