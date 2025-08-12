module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 50,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
