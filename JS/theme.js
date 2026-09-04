// Run before styles paint so a saved dark appearance never flashes a light page.
(() => {
  const key = 'mcruz.appearance.v1';
  const root = document.documentElement;
  const device = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => value === 'light' || value === 'dark' ? value : null;
  let storage;
  let preference = null;
  try { storage = window.localStorage; preference = normalize(storage.getItem(key)); } catch { storage = null; /* Appearance remains usable without browser storage. */ }
  let toggle;
  let auto;
  const apply = () => {
    const theme = preference || (device.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const chrome = document.querySelector('meta[name="theme-color"]');
    if (chrome) chrome.content = theme === 'dark' ? '#10151d' : '#edf0f1';
    if (toggle) toggle.checked = theme === 'dark';
    if (auto) auto.setAttribute('aria-pressed', String(preference === null));
    window.dispatchEvent(new CustomEvent('portfolio:themechange', { detail: { theme, automatic: preference === null } }));
  };
  const choose = value => {
    preference = normalize(value);
    try {
      if (preference) storage?.setItem(key, preference);
      else storage?.removeItem(key);
    } catch { storage = null; /* A blocked write does not prevent switching this page. */ }
    apply();
  };
  apply();
  device.addEventListener('change', () => { if (preference === null) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = normalize(event.newValue);
    apply();
  });
  window.addEventListener('pageshow', () => {
    try { if (storage) preference = normalize(storage.getItem(key)); } catch { /* Keep the current choice. */ }
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    toggle = document.getElementById('dark-mode-switch');
    auto = document.getElementById('theme-auto');
    if (toggle) {
      toggle.addEventListener('change', () => choose(toggle.checked ? 'dark' : 'light'));
      toggle.closest('label').hidden = false;
    }
    if (auto) {
      auto.addEventListener('click', () => choose(null));
      auto.hidden = false;
    }
    apply();
  });
})();
