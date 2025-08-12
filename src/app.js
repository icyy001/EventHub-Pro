const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const eventsRouter = require('./routes/events');

const app = express();

app.use(helmet());          // basic security headers
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.set('etag', false);     // avoid 304 caching weirdness in dev

// serve static homepage (index.html, styles.css, app.js)
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/events', eventsRouter);

// tiny favicon handler (optional)
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// minimal error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
});

module.exports = app;
