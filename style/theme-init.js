/* theme-init.js — apply saved theme before first paint to avoid flash */
(function () {
  try {
    var raw = localStorage.getItem('adoc-theme');
    if (!raw) return;
    var saved = JSON.parse(raw);
    var vars = null;
    if (saved.key === 'custom' && saved.data) {
      vars = saved.data;
    } else {
      // Inline minimal theme map — only the vars needed to avoid FOUC
      var presets = {
        ammonite: { p: '#76ff8d', bg: '#3d4c37', s: '#4a5a44', b: '#556050', tp: '#f0f6fc', tm: '#8aaa80', dark: true },
        ocean:    { p: '#7eb8ff', bg: '#1e2d3d', s: '#253447', b: '#2d3e52', tp: '#e8f4fd', tm: '#7a9ab8', dark: true },
        twilight: { p: '#c084fc', bg: '#2d1f3d', s: '#3a2850', b: '#462f5e', tp: '#f0e8ff', tm: '#9a7ab8', dark: true },
        ember:    { p: '#ff8c42', bg: '#3d2a1e', s: '#4a3428', b: '#553d30', tp: '#fdf0e8', tm: '#b87a50', dark: true },
        rose:     { p: '#ff7eb3', bg: '#3d1f2d', s: '#4a2838', b: '#553044', tp: '#fde8f4', tm: '#b87a9a', dark: true },
        slate:    { p: '#94a3b8', bg: '#1e2533', s: '#252e3f', b: '#2d3750', tp: '#e2e8f0', tm: '#64748b', dark: true },
        midnight: { p: '#60a5fa', bg: '#0a0e1a', s: '#111827', b: '#1e2a3a', tp: '#f1f5f9', tm: '#64748b', dark: true },
        dawn:     { p: '#2d6a4f', bg: '#f5f0e8', s: '#ede5d5', b: '#c8c0b0', tp: '#1a1a1a', tm: '#6b6b6b', dark: false },
        paper:    { p: '#7c3aed', bg: '#fafaf9', s: '#f0eee8', b: '#d6d0c8', tp: '#1c1917', tm: '#78716c', dark: false }
      };
      var t = presets[saved.key];
      if (!t) return;
      vars = {
        '--brand-primary': t.p, '--brand-dark': t.p,
        '--brand-light': 'rgba(0,0,0,.1)',
        '--bg-page': t.bg, '--bg-surface': t.s,
        '--bg-sidebar': t.bg + '00', '--bg-inline': t.b,
        '--text-primary': t.tp, '--text-muted': t.tm,
        '--text-inline': t.p, '--text-link': t.p, '--border': t.b,
        '_dark': t.dark
      };
    }
    if (!vars) return;
    var root = document.documentElement;
    Object.keys(vars).forEach(function (k) {
      if (k.startsWith('--')) root.style.setProperty(k, vars[k]);
    });
    root.style.colorScheme = (vars['_dark'] !== false) ? 'dark' : 'light';
  } catch (e) {}
})();
