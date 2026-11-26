/* =============================================================
   BG MASTER: app logic
   Builds the sidebar from BACKGROUNDS (backgrounds.js), shows the
   chosen background full screen, and handles search, filters,
   download, shuffle, and keyboard shortcuts.
   ============================================================= */
(() => {
  'use strict';
  const BGS = window.BACKGROUNDS || [];
  const ICONS = window.CATEGORY_ICONS || {};
  const $ = id => document.getElementById(id);

  const stage = $('stage'), frame = $('frame'), list = $('list'), chips = $('chips'), search = $('search');
  const categories = [...new Set(BGS.map(b => b.category))];
  let activeCat = 'All';
  let current = null;

  const icon = cat => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[cat] || ICONS._default}</svg>`;
  const gradient = b => `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[1]})`;
  const fileName = b => b.file.split('/').pop();

  $('count').textContent = BGS.length;

  /* ---------- Category chips ---------- */
  ['All', ...categories].forEach(cat => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.cat = cat;
    c.innerHTML = (cat === 'All' ? '' : icon(cat)) + `<span>${cat}</span>`;
    c.setAttribute('aria-pressed', String(cat === activeCat));
    c.addEventListener('click', () => {
      activeCat = cat;
      chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === cat)));
      renderList();
    });
    chips.appendChild(c);
  });

  /* ---------- Sidebar list ---------- */
  function visible() {
    const q = search.value.trim().toLowerCase();
    return BGS.filter(b =>
      (activeCat === 'All' || b.category === activeCat) &&
      (!q || (b.name + ' ' + b.desc + ' ' + b.category).toLowerCase().includes(q)));
  }

  function renderList() {
    const items = visible();
    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<div class="empty">No backgrounds match that search.<br>Try another word or pick “All”.</div>';
      return;
    }
    let delay = 0;
    categories.forEach(cat => {
      const inCat = items.filter(b => b.category === cat);
      if (!inCat.length) return;
      const t = document.createElement('div');
      t.className = 'group-title';
      t.innerHTML = `${cat} <i>${inCat.length}</i>`;
      list.appendChild(t);

      inCat.forEach(b => {
        const a = document.createElement('a');
        a.className = 'item' + (current && current.id === b.id ? ' active' : '');
        a.href = '#' + b.id;
        a.dataset.id = b.id;
        a.style.animationDelay = (delay++ * 25) + 'ms';
        a.innerHTML = `
          <span class="thumb" style="background:${gradient(b)}">${icon(b.category)}</span>
          <span class="meta"><b></b><small></small></span>
          <span class="dl" role="button" tabindex="0" title="Download ${fileName(b)}" aria-label="Download ${b.name}">
            <svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>
          </span>`;
        a.querySelector('b').textContent = b.name;
        a.querySelector('small').textContent = b.desc;

        const dl = a.querySelector('.dl');
        dl.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); download(b); });
        dl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); download(b); } });
        list.appendChild(a);
      });
    });
  }

  /* ---------- Show a background ---------- */
  // split = sidebar gets its own column and the background moves beside it
  function show(b, split) {
    if (!b) return;
    const same = current && current.id === b.id;
    const splitNow = split && !document.body.classList.contains('split');
    current = b;
    document.body.classList.remove('is-home');
    document.title = `${b.name} · BG Master`;

    // update the sidebar highlight
    list.querySelectorAll('.item').forEach(el => el.classList.toggle('active', el.dataset.id === b.id));
    const el = list.querySelector(`.item[data-id="${b.id}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    // update the floating bar
    $('nowThumb').style.background = gradient(b);
    $('nowName').textContent = b.name;
    $('nowCat').textContent = b.category;
    $('nowOpen').href = b.file;

    $('rail').style.setProperty('--rail-bg',
      `radial-gradient(circle at 30% 20%, ${b.colors[0]}, transparent 60%), radial-gradient(circle at 70% 85%, ${b.colors[1]}, transparent 60%), ${b.colors[1]}`);

    if (same && !splitNow) return;
    stage.classList.add('loading');
    // change the layout while the old background is faded out, then load the new one
    setTimeout(() => {
      if (split) document.body.classList.add('split');
      if (same) frame.src = current.file; else frame.src = b.file;
    }, 180);
  }
  frame.addEventListener('load', () => stage.classList.remove('loading'));

  /* ---------- Download ----------
     Browsers block normal download links when index.html is opened
     straight from a folder (a file:// address), and open the page
     instead. So the file's text is fetched (on a web server) or read
     from its copy in assets/downloads/ (from a folder), then saved
     from memory, which works everywhere. */
  async function download(b) {
    toast(`Preparing ${fileName(b)}…`);
    let text = null;
    if (location.protocol !== 'file:') {
      try { const r = await fetch(b.file); if (r.ok) text = await r.text(); } catch (e) {}
    }
    if (text == null) text = await loadCopy(b.id);
    if (text == null) {
      // last resort: open it so it can be saved by hand
      window.open(b.file, '_blank', 'noopener');
      toast('Opened in a new tab. Press Ctrl+S (⌘S on Mac) to save it.', 4000);
      return;
    }
    const url = URL.createObjectURL(new Blob([text], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(b);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast(`Downloaded ${fileName(b)}`);
  }

  // assets/downloads/<id>.js holds a copy of each background as text
  // (made by tools/build-downloads.py). Script files load from a folder too.
  function loadCopy(id) {
    window.BG_SOURCES = window.BG_SOURCES || {};
    if (window.BG_SOURCES[id]) return Promise.resolve(window.BG_SOURCES[id]);
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = `assets/downloads/${id}.js`;
      s.onload = () => { s.remove(); resolve(window.BG_SOURCES[id] || null); };
      s.onerror = () => { s.remove(); resolve(null); };
      document.head.appendChild(s);
    });
  }
  $('nowDownload').addEventListener('click', () => current && download(current));

  /* ---------- Address bar: index.html#aquarium opens that one ---------- */
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    return BGS.find(b => b.id === id);
  }
  window.addEventListener('hashchange', () => {
    const b = fromHash();
    if (b) show(b, true); else goHome();
  });

  /* ---------- Homepage (no background picked) ---------- */
  function goHome() {
    current = null;
    document.title = 'BG Master · Background Collections';
    document.body.classList.add('is-home');
    document.body.classList.remove('split', 'hide-side');
    list.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
    stage.classList.remove('loading');
    frame.src = 'about:blank';          // stop the last background running behind the homepage
  }
  function backHome() {
    if (location.hash) history.pushState(null, '', location.pathname + location.search);
    goHome();
  }
  $('homeLink').addEventListener('click', e => { e.preventDefault(); backHome(); });

  /* ---------- Light / dark theme (remembered in this browser) ---------- */
  const themeBtn = $('themeBtn');
  function showThemeLabel() {
    const light = document.documentElement.dataset.theme === 'light';
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
  themeBtn.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    if (light) document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('bgm-theme', light ? 'light' : 'dark'); } catch (e) {}
    showThemeLabel();
  });
  showThemeLabel();
  window.addEventListener('popstate', () => { if (!fromHash()) goHome(); });

  // homepage category shortcuts: "4 Nature", "2 Weather"…
  categories.forEach(cat => {
    const s = document.createElement('button');
    s.type = 'button';
    s.className = 'stat';
    s.innerHTML = `${icon(cat)}<b>${BGS.filter(b => b.category === cat).length}</b> ${cat}`;
    s.addEventListener('click', () => chips.querySelector(`.chip[data-cat="${cat}"]`).click());
    $('stats').appendChild(s);
  });
  $('heroShuffle').addEventListener('click', shuffle);

  /* ---------- Buttons ---------- */
  // Hide / show the sidebar. In split view the background is resized, so fade it
  // out, change the layout, and restart it at its new size.
  function setSide(hidden) {
    if (hidden && document.body.classList.contains('is-home')) return;   // nothing to see full screen on the homepage
    if (document.body.classList.contains('hide-side') === hidden) return;
    if (!document.body.classList.contains('split') || !current) {
      document.body.classList.toggle('hide-side', hidden);
      return;
    }
    stage.classList.add('loading');
    setTimeout(() => {
      document.body.classList.toggle('hide-side', hidden);
      frame.src = current.file;
    }, 180);
  }
  $('hideBtn').addEventListener('click', () => setSide(true));
  $('showBtn').addEventListener('click', () => setSide(false));
  // the ↻ button in the bottom bar goes back to the homepage
  $('reloadBtn').addEventListener('click', backHome);
  $('shuffleBtn').addEventListener('click', shuffle);
  function shuffle() {
    const pool = BGS.filter(b => !current || b.id !== current.id);
    location.hash = pool[Math.floor(Math.random() * pool.length)].id;
  }
  function step(dir) {
    const items = visible();
    if (!items.length) return;
    const i = items.findIndex(b => current && b.id === current.id);
    const next = i < 0 ? (dir > 0 ? 0 : items.length - 1) : (i + dir + items.length) % items.length;
    location.hash = items[next].id;
  }

  search.addEventListener('input', renderList);
  search.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = visible()[0]; if (first) location.hash = first.id; }
    if (e.key === 'Escape') { search.value = ''; renderList(); search.blur(); }
  });

  /* ---------- Keyboard shortcuts ---------- */
  window.addEventListener('keydown', e => {
    if (e.target === search || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); setSide(false); search.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'f' || e.key === 'F') setSide(!document.body.classList.contains('hide-side'));
    else if (e.key === 'r' || e.key === 'R') shuffle();
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg, ms) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove('show'), ms || 1800);
  }

  /* ---------- Start ---------- */
  renderList();
  // Opening or reloading the page always starts on the homepage
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  goHome();
})();
