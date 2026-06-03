/* assets.kelpw.ing - site.js */
(function () {
  "use strict";

  const NAV = [
    { slug: "image", title: "Image Assets", href: "image" },
    { slug: "artwork", title: "Artworks", href: "artwork" },
    { slug: "reference", title: "Reference Sheets", href: "reference" },
    { slug: "audio", title: "Audio Assets", href: "audio" },
    { slug: "video", title: "Video Assets", href: "video" },
    { slug: "css", title: "CSS Assets", href: "css" },
    { slug: "errors", title: "Error Pages", href: "errors" },
    { slug: "misc", title: "Miscellaneous Assets", href: "misc" },
  ];

  function buildSidebar(activeSlug) {
    const aside = document.querySelector(".sidebar");
    if (!aside) return;

    const title = document.createElement("div");
    title.className = "sidebar-group-title";
    title.textContent = "Documentation";
    aside.appendChild(title);

    NAV.forEach(function (page) {
      const a = document.createElement("a");
      a.href = page.href;
      a.textContent = page.title;
      if (page.slug === activeSlug) a.classList.add("active");
      aside.appendChild(a);
    });
  }

  function buildPageNav(activeSlug) {
    const nav = document.querySelector(".page-nav");
    if (!nav) return;
    const idx = NAV.findIndex(function (p) { return p.slug === activeSlug; });
    if (idx === -1) return;
    const prev = NAV[idx - 1];
    const next = NAV[idx + 1];
    if (prev) {
      const a = document.createElement("a");
      a.className = "btn-nav prev";
      a.href = prev.href;
      a.innerHTML = "&#8592; " + prev.title;
      nav.appendChild(a);
    }
    if (next) {
      const a = document.createElement("a");
      a.className = "btn-nav next";
      a.href = next.href;
      a.innerHTML = next.title + " &#8594;";
      nav.appendChild(a);
    }
  }

  function initMobileToggle() {
    const toggle = document.querySelector(".sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (!toggle || !sidebar) return;
    function close() {
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
    }
    toggle.addEventListener("click", function () {
      const open = sidebar.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("open", open);
    });
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  function initSearch() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const wrapper = document.createElement("div");
    wrapper.className = "site-search";

    const input = document.createElement("input");
    input.type = "search";
    input.className = "site-search-input";
    input.placeholder = "Search assets...";
    input.setAttribute("aria-label", "Search assets");
    input.setAttribute("autocomplete", "off");

    const dropdown = document.createElement("div");
    dropdown.className = "site-search-dropdown";

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    header.appendChild(wrapper);

    var index = null;
    var currentResults = [];
    var focusedIdx = -1;
    var suppressDropdown = false;

    var depth = (window.location.pathname.match(/\//g) || []).length - 1;
    var prefix = "";

    fetch(prefix + "search-index.json")
      .then(function(r) { return r.json(); })
      .then(function(data) { index = data; })
      .catch(function() { index = []; });

    function query(q) {
      if (!index) return [];
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = [];
      for (var i = 0; i < index.length; i++) {
        var item = index[i];
        var haystack = (item.title + " " + item.section + " " + item.snippet).toLowerCase();
        var score = 0;
        for (var t = 0; t < terms.length; t++) {
          var term = terms[t];
          if (item.title.toLowerCase().includes(term)) score += 10;
          if (item.section.toLowerCase().includes(term)) score += 3;
          if (item.snippet.toLowerCase().includes(term)) score += 1;
        }
        if (score > 0) scored.push({ item: item, score: score });
      }
      scored.sort(function(a, b) { return b.score - a.score; });
      return scored.slice(0, 8).map(function(s) { return s.item; });
    }

    function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

    function highlight(text, terms) {
      var out = esc(text);
      terms.forEach(function(t) {
        if (!t) return;
        out = out.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")", "gi"),
          '<mark style="background:var(--brand-primary);color:#000;border-radius:2px;padding:0 2px">$1</mark>');
      });
      return out;
    }

    function renderResults(results, terms) {
      currentResults = results;
      focusedIdx = -1;
      dropdown.innerHTML = "";
      if (results.length === 0) {
        var empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent = "No results found";
        dropdown.appendChild(empty);
      } else {
        results.forEach(function(item) {
          var a = document.createElement("a");
          a.className = "search-result";
          a.href = item.href;
          var sectionHtml = item.section ? '<span class="search-result-section">' + esc(item.section) + '</span>' : '';
          var snippetHtml = item.snippet ? '<span class="search-result-snippet">' + highlight(item.snippet.slice(0, 120), terms) + '</span>' : '';
          a.innerHTML = '<span class="search-result-title">' + highlight(item.title, terms) + '</span>' + sectionHtml + snippetHtml;
          a.addEventListener("mousedown", function(e) {
            e.preventDefault();
            window.location.href = item.href;
          });
          dropdown.appendChild(a);
        });
      }
      dropdown.classList.add("open");
    }

    function hideDropdown() {
      dropdown.classList.remove("open");
      focusedIdx = -1;
      dropdown.querySelectorAll(".search-result").forEach(function(el) {
        el.classList.remove("focused");
      });
    }

    function updateFocus() {
      var els = dropdown.querySelectorAll(".search-result");
      els.forEach(function(el, i) { el.classList.toggle("focused", i === focusedIdx); });
      if (focusedIdx >= 0 && els[focusedIdx]) els[focusedIdx].scrollIntoView({ block: "nearest" });
    }

    function runSearch() {
      var q = input.value.trim();
      if (!q) { hideDropdown(); return; }
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var results = query(q);
      renderResults(results, terms);
    }

    input.addEventListener("input", function() { suppressDropdown = false; runSearch(); });
    input.addEventListener("focus", function() { if (!suppressDropdown && input.value.trim()) runSearch(); });
    input.addEventListener("blur", function() { setTimeout(hideDropdown, 150); });

    input.addEventListener("keydown", function(e) {
      var els = dropdown.querySelectorAll(".search-result");
      if (e.key === "Escape") {
        suppressDropdown = true; hideDropdown(); input.blur(); return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault(); suppressDropdown = false;
        if (!dropdown.classList.contains("open") && input.value.trim()) runSearch();
        if (els.length) { focusedIdx = Math.min(focusedIdx + 1, els.length - 1); updateFocus(); }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (els.length) { focusedIdx = Math.max(focusedIdx - 1, 0); updateFocus(); }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        var target = focusedIdx >= 0 ? currentResults[focusedIdx] : currentResults[0];
        if (target) window.location.href = target.href;
        return;
      }
    });

    document.addEventListener("click", function(e) { if (!wrapper.contains(e.target)) hideDropdown(); });
  }

  // ── Asset styles injected once ────────────────────────────────────────────
  var _stylesInjected = false;
  function injectAssetStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;
    var s = document.createElement('style');
    s.textContent = [
      '.asset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.25rem;margin:1.5rem 0}',
      '.asset-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .15s,box-shadow .15s,border-color .15s;box-shadow:var(--shadow);display:flex;flex-direction:column}',
      '.asset-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--brand-primary)}',
      '.asset-card-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:var(--bg-inline)}',
      '.asset-card-body{padding:.85rem 1rem;flex:1;display:flex;flex-direction:column;gap:.25rem}',
      '.asset-card-title{font-size:.9rem;font-weight:600;color:var(--text-primary);margin:0;word-break:break-word}',
      '.asset-card-desc{font-size:.8rem;color:var(--text-muted);margin:0;flex:1}',
      '.asset-card-link{display:inline-block;margin-top:.6rem;font-size:.8rem;color:var(--brand-primary);text-decoration:none;word-break:break-all}',
      '.asset-card-link:hover{text-decoration:underline}',
      '.asset-list{display:flex;flex-direction:column;gap:1rem;margin:1.25rem 0}',
      '.asset-row{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.25rem;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;transition:border-color .15s}',
      '.asset-row:hover{border-color:var(--brand-primary)}',
      '.asset-row-info{flex:1}',
      '.asset-row-title{font-size:1rem;font-weight:600;color:var(--text-primary);margin:0 0 .25rem;font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace}',
      '.asset-row-desc{font-size:.875rem;color:var(--text-muted);margin:0}',
      '.asset-row-cdn{font-size:.78rem;color:var(--text-muted);margin:.25rem 0 0;display:block}',
      '.asset-row-link{display:inline-flex;align-items:center;gap:.3rem;padding:.4rem .9rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.8rem;color:var(--brand-primary);text-decoration:none;white-space:nowrap;transition:border-color .15s,background .15s}',
      '.asset-row-link:hover{border-color:var(--brand-primary);background:var(--brand-light);text-decoration:none}'
    ].join('');
    document.head.appendChild(s);
  }

  function makeAssetCard(item) {
    var ext = item.href.split('.').pop().toLowerCase();
    var card = document.createElement('div');
    card.className = 'asset-card';
    var img = document.createElement('img');
    img.className = 'asset-card-thumb';
    img.src = item.href;
    img.alt = item.title;
    img.loading = 'lazy';
    if (ext === 'ico') img.style.imageRendering = 'pixelated';
    card.appendChild(img);
    var body = document.createElement('div');
    body.className = 'asset-card-body';
    var t = document.createElement('p');
    t.className = 'asset-card-title';
    t.textContent = item.title;
    body.appendChild(t);
    if (item.snippet) {
      var d = document.createElement('p');
      d.className = 'asset-card-desc';
      d.textContent = item.snippet;
      body.appendChild(d);
    }
    var a = document.createElement('a');
    a.className = 'asset-card-link';
    a.href = item.href;
    a.setAttribute('download', '');
    a.textContent = '\u2193 Download';
    body.appendChild(a);
    card.appendChild(body);
    return card;
  }

  function makeAssetRow(item) {
    var viewable = ['png','jpg','jpeg','gif','webp','ico','svg','css','html'];
    var ext = item.href.split('.').pop().toLowerCase();
    var row = document.createElement('div');
    row.className = 'asset-row';
    var info = document.createElement('div');
    info.className = 'asset-row-info';
    var t = document.createElement('p');
    t.className = 'asset-row-title';
    t.textContent = item.title;
    info.appendChild(t);
    if (item.snippet) {
      var d = document.createElement('p');
      d.className = 'asset-row-desc';
      d.textContent = item.snippet;
      info.appendChild(d);
    }
    if (item.cdn) {
      var c = document.createElement('code');
      c.className = 'asset-row-cdn';
      c.textContent = item.cdn;
      info.appendChild(c);
    }
    row.appendChild(info);
    var a = document.createElement('a');
    a.className = 'asset-row-link';
    a.href = item.href;
    a.textContent = viewable.indexOf(ext) !== -1 ? '\u2197 View' : '\u2193 Download';
    row.appendChild(a);
    return row;
  }

  function renderAssets(slug) {
    var container = document.getElementById('asset-list');
    if (!container) return;
    injectAssetStyles();
    fetch('search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var items = data.filter(function(i) { return i.section === slug; });
        if (items.length === 0) {
          var note = document.createElement('div');
          note.className = 'callout callout-note';
          note.innerHTML = '<strong>Coming Soon</strong><p>No assets have been uploaded yet. Check back later!</p>';
          container.appendChild(note);
          return;
        }
        // Group preserving insertion order
        var groups = Object.create(null);
        var order = [];
        items.forEach(function(item) {
          var g = item.group || 'Assets';
          if (!groups[g]) { groups[g] = []; order.push(g); }
          groups[g].push(item);
        });
        order.forEach(function(name) {
          var groupItems = groups[name];
          var useCards = groupItems.some(function(i) { return i.display === 'card'; });
          var section = document.createElement('div');
          section.className = 'doc-section';
          var h2 = document.createElement('h2');
          h2.textContent = name;
          section.appendChild(h2);
          if (useCards) {
            var grid = document.createElement('div');
            grid.className = 'asset-grid';
            groupItems.forEach(function(item) { grid.appendChild(makeAssetCard(item)); });
            section.appendChild(grid);
          } else {
            var list = document.createElement('div');
            list.className = 'asset-list';
            groupItems.forEach(function(item) { list.appendChild(makeAssetRow(item)); });
            section.appendChild(list);
          }
          container.appendChild(section);
        });
      })
      .catch(function() {
        var err = document.createElement('div');
        err.className = 'callout callout-note';
        err.innerHTML = '<strong>Error</strong><p>Could not load asset index.</p>';
        container.appendChild(err);
      });
  }

  // ── Theme system ──────────────────────────────────────────────────────────
  var THEMES = {
    ammonite: {
      name: 'Ammonite', swatch: ['#76ff8d', '#3d4c37'], dark: true,
      vars: {
        '--brand-primary': '#76ff8d', '--brand-dark': '#56d87a',
        '--brand-light': 'rgba(118,255,141,.15)',
        '--bg-page': '#3d4c37', '--bg-surface': '#4a5a44',
        '--bg-sidebar': '#3d4c3700', '--bg-inline': '#556050',
        '--bg-tip': '#3a5a3a', '--bg-note': '#3a4a5a',
        '--bg-warn': '#5a4a2a', '--bg-danger': '#5a3a3a',
        '--text-primary': '#f0f6fc', '--text-secondary': '#c8dfc0',
        '--text-muted': '#8aaa80', '--text-inline': '#76ff8d',
        '--text-link': '#76ff8d', '--border': '#556050'
      }
    },
    ocean: {
      name: 'Ocean', swatch: ['#7eb8ff', '#1e2d3d'], dark: true,
      vars: {
        '--brand-primary': '#7eb8ff', '--brand-dark': '#5a9de8',
        '--brand-light': 'rgba(126,184,255,.15)',
        '--bg-page': '#1e2d3d', '--bg-surface': '#253447',
        '--bg-sidebar': '#1e2d3d00', '--bg-inline': '#2d3e52',
        '--bg-tip': '#1e3a4a', '--bg-note': '#1e2a4a',
        '--bg-warn': '#3a2e1e', '--bg-danger': '#3a1e1e',
        '--text-primary': '#e8f4fd', '--text-secondary': '#b0cce8',
        '--text-muted': '#7a9ab8', '--text-inline': '#7eb8ff',
        '--text-link': '#7eb8ff', '--border': '#2d3e52'
      }
    },
    twilight: {
      name: 'Twilight', swatch: ['#c084fc', '#2d1f3d'], dark: true,
      vars: {
        '--brand-primary': '#c084fc', '--brand-dark': '#a060e0',
        '--brand-light': 'rgba(192,132,252,.15)',
        '--bg-page': '#2d1f3d', '--bg-surface': '#3a2850',
        '--bg-sidebar': '#2d1f3d00', '--bg-inline': '#462f5e',
        '--bg-tip': '#2a3a1e', '--bg-note': '#1e2a4a',
        '--bg-warn': '#3a2e1e', '--bg-danger': '#3a1e2a',
        '--text-primary': '#f0e8ff', '--text-secondary': '#d0b8f0',
        '--text-muted': '#9a7ab8', '--text-inline': '#c084fc',
        '--text-link': '#c084fc', '--border': '#462f5e'
      }
    },
    ember: {
      name: 'Ember', swatch: ['#ff8c42', '#3d2a1e'], dark: true,
      vars: {
        '--brand-primary': '#ff8c42', '--brand-dark': '#e06820',
        '--brand-light': 'rgba(255,140,66,.15)',
        '--bg-page': '#3d2a1e', '--bg-surface': '#4a3428',
        '--bg-sidebar': '#3d2a1e00', '--bg-inline': '#553d30',
        '--bg-tip': '#2a3a1e', '--bg-note': '#1e2a3a',
        '--bg-warn': '#4a3a1e', '--bg-danger': '#4a1e1e',
        '--text-primary': '#fdf0e8', '--text-secondary': '#e8d0b8',
        '--text-muted': '#b87a50', '--text-inline': '#ff8c42',
        '--text-link': '#ff8c42', '--border': '#553d30'
      }
    },
    rose: {
      name: 'Rose', swatch: ['#ff7eb3', '#3d1f2d'], dark: true,
      vars: {
        '--brand-primary': '#ff7eb3', '--brand-dark': '#e05a90',
        '--brand-light': 'rgba(255,126,179,.15)',
        '--bg-page': '#3d1f2d', '--bg-surface': '#4a2838',
        '--bg-sidebar': '#3d1f2d00', '--bg-inline': '#553044',
        '--bg-tip': '#1e3a2a', '--bg-note': '#1e2a4a',
        '--bg-warn': '#3a2e1e', '--bg-danger': '#4a1e2a',
        '--text-primary': '#fde8f4', '--text-secondary': '#e8b8d0',
        '--text-muted': '#b87a9a', '--text-inline': '#ff7eb3',
        '--text-link': '#ff7eb3', '--border': '#553044'
      }
    },
    slate: {
      name: 'Slate', swatch: ['#94a3b8', '#1e2533'], dark: true,
      vars: {
        '--brand-primary': '#94a3b8', '--brand-dark': '#748090',
        '--brand-light': 'rgba(148,163,184,.15)',
        '--bg-page': '#1e2533', '--bg-surface': '#252e3f',
        '--bg-sidebar': '#1e253300', '--bg-inline': '#2d3750',
        '--bg-tip': '#1e3a2a', '--bg-note': '#1e2a4a',
        '--bg-warn': '#3a2e1e', '--bg-danger': '#3a1e1e',
        '--text-primary': '#e2e8f0', '--text-secondary': '#b0bac8',
        '--text-muted': '#64748b', '--text-inline': '#94a3b8',
        '--text-link': '#94a3b8', '--border': '#2d3750'
      }
    },
    midnight: {
      name: 'Midnight', swatch: ['#60a5fa', '#0a0e1a'], dark: true,
      vars: {
        '--brand-primary': '#60a5fa', '--brand-dark': '#3a80e0',
        '--brand-light': 'rgba(96,165,250,.15)',
        '--bg-page': '#0a0e1a', '--bg-surface': '#111827',
        '--bg-sidebar': '#0a0e1a00', '--bg-inline': '#1a2234',
        '--bg-tip': '#0a1a10', '--bg-note': '#0a1020',
        '--bg-warn': '#1a1000', '--bg-danger': '#1a0a0a',
        '--text-primary': '#f1f5f9', '--text-secondary': '#b0bac8',
        '--text-muted': '#64748b', '--text-inline': '#60a5fa',
        '--text-link': '#60a5fa', '--border': '#1e2a3a'
      }
    },
    dawn: {
      name: 'Dawn', swatch: ['#2d6a4f', '#f5f0e8'], dark: false,
      vars: {
        '--brand-primary': '#2d6a4f', '--brand-dark': '#1a4f38',
        '--brand-light': 'rgba(45,106,79,.12)',
        '--bg-page': '#f5f0e8', '--bg-surface': '#ede5d5',
        '--bg-sidebar': '#f5f0e800', '--bg-inline': '#e0d8c8',
        '--bg-tip': '#d8ede0', '--bg-note': '#d8e0ed',
        '--bg-warn': '#ede8d0', '--bg-danger': '#edd8d8',
        '--text-primary': '#1a1a1a', '--text-secondary': '#3a3a3a',
        '--text-muted': '#6b6b6b', '--text-inline': '#2d6a4f',
        '--text-link': '#2d6a4f', '--border': '#c8c0b0'
      }
    },
    paper: {
      name: 'Paper', swatch: ['#7c3aed', '#fafaf9'], dark: false,
      vars: {
        '--brand-primary': '#7c3aed', '--brand-dark': '#5b21b6',
        '--brand-light': 'rgba(124,58,237,.1)',
        '--bg-page': '#fafaf9', '--bg-surface': '#f0eee8',
        '--bg-sidebar': '#fafaf900', '--bg-inline': '#e8e4dc',
        '--bg-tip': '#e8f5e9', '--bg-note': '#e8eaf6',
        '--bg-warn': '#fff8e1', '--bg-danger': '#fce4ec',
        '--text-primary': '#1c1917', '--text-secondary': '#44403c',
        '--text-muted': '#78716c', '--text-inline': '#7c3aed',
        '--text-link': '#7c3aed', '--border': '#d6d0c8'
      }
    }
  };

  function _hexToRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }
  function _blend(a, b, t) {
    return a.map(function(v,i) { return Math.round(v + (b[i]-v)*t); });
  }
  function _toHex(rgb) {
    return '#' + rgb.map(function(c) { return ('0'+Math.max(0,Math.min(255,c)).toString(16)).slice(-2); }).join('');
  }
  function _lum(rgb) { return 0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2]; }

  function buildCustomVars(accentHex, bgHex) {
    var a = _hexToRgb(accentHex), bg = _hexToRgb(bgHex);
    var dark = _lum(bg) < 140;
    var w = [255,255,255], k = [0,0,0];
    var mix = dark ? function(t) { return _toHex(_blend(bg,w,t)); }
                   : function(t) { return _toHex(_blend(bg,k,t)); };
    return {
      '--brand-primary': accentHex,
      '--brand-dark': _toHex(_blend(a,k,0.2)),
      '--brand-light': 'rgba('+a[0]+','+a[1]+','+a[2]+',.15)',
      '--bg-page': bgHex,
      '--bg-surface': mix(0.07),
      '--bg-sidebar': bgHex + '00',
      '--bg-inline': mix(0.13),
      '--bg-tip': dark ? _toHex(_blend(bg,[0,60,0],0.35)) : _toHex(_blend(bg,[0,60,0],0.08)),
      '--bg-note': dark ? _toHex(_blend(bg,[0,0,80],0.35)) : _toHex(_blend(bg,[0,0,80],0.08)),
      '--bg-warn': dark ? _toHex(_blend(bg,[80,60,0],0.35)) : _toHex(_blend(bg,[80,60,0],0.08)),
      '--bg-danger': dark ? _toHex(_blend(bg,[80,0,0],0.35)) : _toHex(_blend(bg,[80,0,0],0.08)),
      '--text-primary': dark ? '#f0f4f8' : '#1a1a1a',
      '--text-secondary': dark ? _toHex(_blend(a,w,0.5)) : _toHex(_blend(a,k,0.35)),
      '--text-muted': dark ? _toHex(_blend(a,[100,100,100],0.5)) : '#6b6b6b',
      '--text-inline': accentHex,
      '--text-link': accentHex,
      '--border': mix(0.16),
      '_dark': dark
    };
  }

  function applyVars(vars, dark) {
    var root = document.documentElement;
    Object.keys(vars).forEach(function(k) {
      if (k.startsWith('--')) root.style.setProperty(k, vars[k]);
    });
    var isDark = (dark !== undefined) ? dark : (vars['_dark'] !== false);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }

  function saveTheme(key, data) {
    try { localStorage.setItem('adoc-theme', JSON.stringify({ key: key, data: data })); } catch(e) {}
  }

  function loadSavedTheme() {
    try {
      var raw = localStorage.getItem('adoc-theme');
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved.key === 'custom' && saved.data) {
        applyVars(saved.data);
      } else if (saved.key && THEMES[saved.key]) {
        applyVars(THEMES[saved.key].vars, THEMES[saved.key].dark);
      }
    } catch(e) {}
  }

  function getActiveKey() {
    try {
      var raw = localStorage.getItem('adoc-theme');
      if (raw) return JSON.parse(raw).key;
    } catch(e) {}
    return 'ammonite';
  }

  function injectThemeStyles() {
    if (document.getElementById('adoc-theme-styles')) return;
    var s = document.createElement('style');
    s.id = 'adoc-theme-styles';
    s.textContent = [
      '.theme-toggle{background:none;border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;font-size:1rem;padding:4px 9px;margin-left:.5rem;transition:border-color .15s;line-height:1;flex-shrink:0}',
      '.theme-toggle:hover{border-color:var(--brand-primary)}',
      '.theme-panel{position:fixed;top:calc(var(--header-h) + 6px);right:1.25rem;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-md);padding:1rem;width:296px;z-index:300;display:none;animation:fadeIn .15s ease}',
      '.theme-panel.open{display:block}',
      '.theme-panel-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:.65rem}',
      '.theme-swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;margin-bottom:.75rem}',
      '.theme-swatch{border-radius:var(--radius-sm);cursor:pointer;border:2px solid transparent;overflow:hidden;transition:border-color .15s,transform .1s;aspect-ratio:1}',
      '.theme-swatch:hover{transform:scale(1.06)}',
      '.theme-swatch.active{border-color:var(--brand-primary);box-shadow:0 0 0 1px var(--brand-primary)}',
      '.theme-swatch-inner{width:100%;height:100%;display:flex;flex-direction:column}',
      '.theme-swatch-accent{flex:1}',
      '.theme-swatch-bg{height:45%}',
      '.theme-swatch-name{font-size:.6rem;text-align:center;padding:2px 1px;color:var(--text-muted);background:var(--bg-inline);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      'hr.theme-divider{border:none;border-top:1px solid var(--border);margin:.65rem 0}',
      '.theme-custom-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:.5rem}',
      '.theme-pickers{display:flex;gap:.6rem;margin-bottom:.6rem}',
      '.theme-pickers label{flex:1;font-size:.78rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:.25rem}',
      '.theme-pickers input[type=color]{width:100%;height:34px;border:1px solid var(--border);border-radius:var(--radius-sm);padding:2px 3px;background:var(--bg-inline);cursor:pointer;appearance:none}',
      '.theme-apply-btn{width:100%;padding:.38rem;background:var(--brand-primary);color:#000;font-weight:700;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:.82rem;transition:opacity .15s}',
      '.theme-apply-btn:hover{opacity:.85}',
      '.theme-reset-btn{width:100%;padding:.3rem;background:none;color:var(--text-muted);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem;margin-top:.35rem;transition:border-color .15s}',
      '.theme-reset-btn:hover{border-color:var(--text-muted)}'
    ].join('');
    document.head.appendChild(s);
  }

  function initTheme() {
    loadSavedTheme();
    injectThemeStyles();

    var header = document.querySelector('.site-header');
    if (!header) return;

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Change theme');
    btn.setAttribute('title', 'Change theme');
    btn.textContent = '🎨';
    header.appendChild(btn);

    var panel = document.createElement('div');
    panel.className = 'theme-panel';

    // Presets
    var presetsTitle = document.createElement('div');
    presetsTitle.className = 'theme-panel-title';
    presetsTitle.textContent = 'Preset Themes';
    panel.appendChild(presetsTitle);

    var grid = document.createElement('div');
    grid.className = 'theme-swatches';

    var activeKey = getActiveKey();
    var swatchEls = {};

    Object.keys(THEMES).forEach(function(key) {
      var t = THEMES[key];
      var sw = document.createElement('div');
      sw.className = 'theme-swatch' + (key === activeKey ? ' active' : '');
      sw.setAttribute('title', t.name);
      sw.innerHTML = '<div class="theme-swatch-inner">'
        + '<div class="theme-swatch-accent" style="background:' + t.swatch[0] + '"></div>'
        + '<div class="theme-swatch-bg" style="background:' + t.swatch[1] + '"></div>'
        + '<div class="theme-swatch-name">' + t.name + '</div>'
        + '</div>';
      sw.addEventListener('click', function() {
        applyVars(t.vars, t.dark);
        saveTheme(key, null);
        Object.keys(swatchEls).forEach(function(k) { swatchEls[k].classList.remove('active'); });
        sw.classList.add('active');
      });
      swatchEls[key] = sw;
      grid.appendChild(sw);
    });
    panel.appendChild(grid);

    // Custom
    var divider = document.createElement('hr');
    divider.className = 'theme-divider';
    panel.appendChild(divider);

    var customTitle = document.createElement('div');
    customTitle.className = 'theme-custom-title';
    customTitle.textContent = 'Custom Theme';
    panel.appendChild(customTitle);

    var pickers = document.createElement('div');
    pickers.className = 'theme-pickers';

    var accentLabel = document.createElement('label');
    accentLabel.textContent = 'Accent';
    var accentInput = document.createElement('input');
    accentInput.type = 'color';
    accentInput.value = '#76ff8d';
    accentInput.id = 'theme-accent-pick';
    accentLabel.appendChild(accentInput);

    var bgLabel = document.createElement('label');
    bgLabel.textContent = 'Background';
    var bgInput = document.createElement('input');
    bgInput.type = 'color';
    bgInput.value = '#3d4c37';
    bgInput.id = 'theme-bg-pick';
    bgLabel.appendChild(bgInput);

    pickers.appendChild(accentLabel);
    pickers.appendChild(bgLabel);
    panel.appendChild(pickers);

    var applyBtn = document.createElement('button');
    applyBtn.className = 'theme-apply-btn';
    applyBtn.textContent = 'Apply Custom';
    applyBtn.addEventListener('click', function() {
      var vars = buildCustomVars(accentInput.value, bgInput.value);
      applyVars(vars);
      saveTheme('custom', vars);
      Object.keys(swatchEls).forEach(function(k) { swatchEls[k].classList.remove('active'); });
    });
    panel.appendChild(applyBtn);

    var resetBtn = document.createElement('button');
    resetBtn.className = 'theme-reset-btn';
    resetBtn.textContent = 'Reset to default';
    resetBtn.addEventListener('click', function() {
      var t = THEMES.ammonite;
      applyVars(t.vars, t.dark);
      saveTheme('ammonite', null);
      Object.keys(swatchEls).forEach(function(k) { swatchEls[k].classList.remove('active'); });
      swatchEls['ammonite'].classList.add('active');
    });
    panel.appendChild(resetBtn);

    document.body.appendChild(panel);

    // Toggle panel
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  window.ADoc = {
    init: function (activeSlug) {
      buildSidebar(activeSlug);
      buildPageNav(activeSlug);
      initMobileToggle();
      initSearch();
      initTheme();
    },
    renderAssets: renderAssets
  };
})();
