function requireFields(obj, fields) {
  const missing = fields.filter(f => obj[f] == null);
  if (missing.length) { const e = new Error(`Missing: ${missing.join(', ')}`); e.status = 400; throw e; }
}
function parseISO(name, value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) { const e = new Error(`${name} must be ISO datetime`); e.status = 400; throw e; }
  return d;
}
module.exports = { requireFields, parseISO };
