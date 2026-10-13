// Only public, build-time-approved article slugs can pass through this optional step.
// No free-text values, cookies, storage, contact details or analytics are used.
(() => {
  const context = document.getElementById('funnel-context');
  if (!context) return;
  const { sources } = JSON.parse(context.textContent);
  const params = new URLSearchParams(window.location.search);
  const source = params.getAll('source').length === 1 ? params.get('source') : null;
  if (!sources.includes(source)) return;
  const field = document.querySelector('input[name="source"]');
  if (field) { field.value = source; field.disabled = false; }
  document.querySelectorAll('[data-booking-link]').forEach(link => {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    url.searchParams.set('source', source);
    link.setAttribute('href', url.pathname + url.search);
  });
})();
