'use strict';
(() => {
  const apiBase = location.hostname.endsWith('.joshua-509.workers.dev')
    ? location.origin : 'https://aiify-free-file.joshua-509.workers.dev';
  const form = document.querySelector('#lead-form');
  const steps = [1, 2, 3].map(n => document.querySelector(`#step-${n}`));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'li_fat_id'];
  const params = new URLSearchParams(location.search);
  const tracking = Object.fromEntries(trackingKeys.map(key => [key, (params.get(key) || '').slice(0, 512)]));
  for (const [name, value] of Object.entries(tracking)) {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = name; input.value = value;
    document.querySelector('#attribution').append(input);
  }
  let current = 1;
  let busy = false;
  let transitioning = false;
  const errorBox = document.querySelector('#submit-error');
  const field = name => form.elements.namedItem(name);
  function setError(name, message) {
    const input = field(name);
    const error = document.querySelector(`#${name}-error`);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message || ''; error.hidden = !message;
  }
  function validate(step) {
    const errors = {};
    if (step === 1) {
      if (!field('name').value.trim()) errors.name = 'Please enter your name.';
      if (!field('company').value.trim()) errors.company = 'Please enter your company.';
    } else {
      const email = field('email').value.trim();
      const phone = field('phone').value.trim();
      if (!email && !phone) errors.email = 'Please enter an email or a phone number.';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email doesn't look right. Please check it.";
      if (phone && !validPhone(phone)) errors.phone = "That phone number doesn't look right. Please check it.";
    }
    for (const key of step === 1 ? ['name', 'company'] : ['email', 'phone']) setError(key, errors[key]);
    const first = Object.keys(errors)[0];
    if (first) field(first).focus();
    return !first;
  }
  function validPhone(value) {
    const core = value.replace(/(?:ext\.?|x|#)\s*\d{1,8}$/i, '').trim();
    const digits = core.replace(/\D/g, '');
    return /^[+\d\s().\-/]+$/.test(core) && digits.length >= 7 && digits.length <= 15;
  }
  async function showStep(next) {
    if (transitioning) return;
    transitioning = true;
    const outgoing = steps[current - 1];
    if (!reducedMotion.matches && outgoing.animate) {
      await outgoing.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 130, easing: 'ease-in' }).finished;
    }
    outgoing.hidden = true;
    current = next;
    form.hidden = next === 3;
    document.querySelector('#privacy').hidden = next === 3;
    const incoming = steps[next - 1]; incoming.hidden = false;
    document.querySelectorAll('.progress li').forEach((item, index) => {
      item.classList.toggle('complete', index < next - 1);
      if (index === next - 1) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    if (!reducedMotion.matches && incoming.animate) {
      incoming.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
      if (next === 3) document.querySelector('.success-check').animate([{ transform: 'scale(.7)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 350 });
    }
    document.querySelector('#step-status').textContent = `${next} / 3`;
    if (next < 3) field(next === 1 ? 'name' : 'email').focus({ preventScroll: true });
    else incoming.querySelector('h2').focus({ preventScroll: true });
    transitioning = false;
  }
  document.querySelector('#back').addEventListener('click', () => { if (!busy) { errorBox.hidden = true; void showStep(1); } });
  form.addEventListener('input', event => {
    if (['name', 'company', 'email', 'phone'].includes(event.target.name)) setError(event.target.name, '');
    errorBox.hidden = true;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || transitioning || !validate(current)) return;
    if (current === 1) { await showStep(2); return; }
    busy = true; form.setAttribute('aria-busy', 'true'); errorBox.hidden = true;
    form.querySelectorAll('button').forEach(button => { button.disabled = true; });
    try {
      const payload = { ...tracking, page_variant: 'b' };
      for (const key of ['name', 'company', 'email', 'phone', 'website']) payload[key] = field(key).value.trim();
      const response = await fetch(`${apiBase}/api/lead`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000), credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.download_url) throw new Error('submit');
      const download = new URL(result.download_url, apiBase);
      if (download.origin !== apiBase || download.pathname !== '/api/download') throw new Error('download');
      document.querySelector('#download').href = download.href;
      await showStep(3);
    } catch {
      // Operational error only; never include personal data or API details in the UI or console.
      errorBox.textContent = 'Unable to submit. Please try again.';
      errorBox.hidden = false;
    } finally {
      busy = false; form.removeAttribute('aria-busy');
      form.querySelectorAll('button').forEach(button => { button.disabled = false; });
    }
  });
  field('name').focus({ preventScroll: true });
})();
