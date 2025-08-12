module.exports = ({ title, description, location }) =>
  [title, description, location].filter(Boolean).join(' ').toLowerCase();

