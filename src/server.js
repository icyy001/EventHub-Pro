require('dotenv').config();
const app = require('./app');
const { PORT } = require('./config');   // from your src/config.js

app.listen(PORT, () => {
  console.log(`EventHub Pro listening on http://localhost:${PORT}`);
});
