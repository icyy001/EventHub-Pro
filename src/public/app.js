async function load(page = 1) {
  const q = (document.getElementById('q')?.value || '').trim();
  const params = new URLSearchParams({ page, limit: 25, _: Date.now() });
  if (q) params.set('search', q);

  const res = await fetch('/events?' + params.toString(), { cache: 'no-store' });
  if (!res.ok) return renderError('Failed to load events.');
  const { data, total, page: p } = await res.json();
  renderList(data, total, p);
}

function renderList(data, total, page) {
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  const count = document.getElementById('count');
  if (count) count.textContent = `Total: ${total} (page ${page})`;
  data.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.title} — ${new Date(e.startsAt).toLocaleString()} @ ${e.location || 'N/A'} — £${e.price ?? '0'}`;
    ul.appendChild(li);
  });
}
function renderError(msg){ const ul=document.getElementById('list'); ul.innerHTML = `<li>${msg}</li>`; }

function wireUI(){
  const go = document.getElementById('go');
  if (go) go.addEventListener('click', () => load(1));
  load(1);
}
document.addEventListener('DOMContentLoaded', wireUI);
