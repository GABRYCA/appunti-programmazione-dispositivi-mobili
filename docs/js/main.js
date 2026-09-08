// PDM Lab — main.js: tema, progress, TOC, ricerca, copia, stampa, menu
(function(){
  const root = document.documentElement;
  const segBtns = [...document.querySelectorAll('[data-theme-value]')];
  const saved = localStorage.getItem('pdm-theme');
  if(saved) root.setAttribute('data-theme', saved);
  function syncTheme(){
    const cur = root.getAttribute('data-theme') || 'auto';
    segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeValue === cur)));
  }
  segBtns.forEach(b => b.addEventListener('click', () => {
    root.setAttribute('data-theme', b.dataset.themeValue);
    localStorage.setItem('pdm-theme', b.dataset.themeValue);
    syncTheme();
  }));
  syncTheme();

  const bar = document.getElementById('progressBar');
  const links = [...document.querySelectorAll('[data-toc]')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if(bar) bar.style.width = (p*100).toFixed(1) + '%';
  }
  document.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if(e.isIntersecting){
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s => io.observe(s));

  const header = document.querySelector('.site-header');
  let lastY = window.scrollY, navTicking = false;
  function hideNav(){ header?.classList.add('nav-hidden'); document.body.classList.add('nav-hidden'); }
  function showNav(){ header?.classList.remove('nav-hidden'); document.body.classList.remove('nav-hidden'); }
  function onScrollNav(){
    navTicking = false;
    const y = window.scrollY;
    if(!header) return;
    if(y > 160 && y > lastY + 4) hideNav();
    else if(y < lastY - 4 || y <= 160) showNav();
    lastY = y;
  }
  window.addEventListener('scroll', () => {
    if(!navTicking){ navTicking = true; requestAnimationFrame(onScrollNav); }
  }, {passive:true});
  document.addEventListener('mousemove', e => { if(e.clientY < 72) showNav(); }, {passive:true});
  header?.addEventListener('focusin', showNav);

  const menuBtn = document.getElementById('menuToggle');
  const toc = document.getElementById('toc');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  menuBtn?.addEventListener('click', () => {
    const open = toc.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    if(open) toc.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start'});
  });
  toc?.addEventListener('click', e => { if(e.target.closest('a')) toc.classList.remove('open'); });

  document.querySelectorAll('details.callout, details.exercise').forEach(det => {
    const sum = det.querySelector(':scope > summary');
    if(!sum) return;
    sum.addEventListener('click', ev => {
      if(reduceMotion.matches) return;
      ev.preventDefault();
      if(det.classList.contains('is-animating')) return;
      const cs = getComputedStyle(det);
      const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      det.classList.add('is-animating');
      det.style.overflow = 'hidden';
      if(det.open){
        const openH = det.offsetHeight;
        const closedH = sum.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + border;
        det.classList.add('is-closing');
        const anim = det.animate(
          [{height: openH + 'px'}, {height: closedH + 'px'}],
          {duration: 240, easing: 'cubic-bezier(.16,1,.3,1)'}
        );
        anim.onfinish = () => { det.open = false; det.classList.remove('is-closing'); det.style.height = ''; det.style.overflow = ''; det.classList.remove('is-animating'); };
        anim.oncancel = () => { det.classList.remove('is-closing'); det.style.height = ''; det.style.overflow = ''; det.classList.remove('is-animating'); };
      } else {
        const closedH = det.offsetHeight;
        det.open = true;
        const openH = det.scrollHeight + border;
        const anim = det.animate(
          [{height: closedH + 'px'}, {height: openH + 'px'}],
          {duration: 340, easing: 'cubic-bezier(.16,1,.3,1)'}
        );
        anim.onfinish = () => { det.style.height = ''; det.style.overflow = ''; det.classList.remove('is-animating'); };
        anim.oncancel = () => { det.style.height = ''; det.style.overflow = ''; det.classList.remove('is-animating'); };
      }
    });
  });

  // ricerca con feedback: conteggio, evidenziazione e salto al risultato
  const input = document.getElementById('searchInput');
  const noRes = document.getElementById('noResults');
  const status = document.getElementById('searchStatus');
  const blocks = [...document.querySelectorAll('[data-searchable]')];
  let firstHit = null;
  function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function clearMarks(block){
    block.querySelectorAll('mark').forEach(m => {
      m.replaceWith(document.createTextNode(m.textContent));
    });
    block.normalize?.();
  }
  function highlight(block, q){
    if(typeof NodeFilter === 'undefined' || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, { acceptNode(n){
      if(!n.nodeValue || !n.nodeValue.toLowerCase().includes(q)) return NodeFilter.FILTER_REJECT;
      const p = n.parentNode;
      if(p && p.closest && p.closest('script,style')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const text = n.nodeValue, lower = text.toLowerCase();
      const frag = document.createDocumentFragment();
      let i = 0, idx;
      while((idx = lower.indexOf(q, i)) >= 0){
        frag.appendChild(document.createTextNode(text.slice(i, idx)));
        const m = document.createElement('mark');
        m.textContent = text.slice(idx, idx + q.length);
        frag.appendChild(m);
        i = idx + q.length;
      }
      frag.appendChild(document.createTextNode(text.slice(i)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  function gotoFirst(){
    if(!firstHit) return;
    firstHit.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start'});
  }
  function applySearch(q){
    const raw = (q || '').trim(), lq = raw.toLowerCase();
    firstHit = null;
    blocks.forEach(b => { clearMarks(b); b.hidden = false; });
    if(!lq){
      if(noRes) noRes.hidden = true;
      if(status) status.hidden = true;
      return;
    }
    let shown = 0;
    blocks.forEach(b => {
      const hit = b.textContent.toLowerCase().includes(lq);
      b.hidden = !hit;
      if(hit){ shown++; highlight(b, lq); if(!firstHit) firstHit = b; }
    });
    if(noRes) noRes.hidden = shown > 0;
    if(status){
      if(!shown){ status.hidden = true; }
      else {
        status.hidden = false;
        status.innerHTML = '<span>Ricerca <strong>“' + escapeHtml(raw) + '”</strong>: <strong>' + shown + '</strong> sezion' + (shown === 1 ? 'e trovata' : 'i trovate') + '.</span><button class="btn btn-secondary" type="button" data-goto>Vai al primo risultato ↓</button>';
        status.querySelector('[data-goto]')?.addEventListener('click', gotoFirst);
      }
    }
  }
  input?.addEventListener('input', () => applySearch(input.value));
  input?.addEventListener('keydown', e => {
    if(e.key === 'Enter'){ e.preventDefault(); gotoFirst(); }
    else if(e.key === 'Escape'){ input.value = ''; applySearch(''); }
  });
  document.querySelectorAll('[data-suggest]').forEach(b => b.addEventListener('click', () => {
    if(input){ input.value = b.dataset.suggest; applySearch(input.value); input.focus(); }
  }));

  document.querySelectorAll('.btn-copy').forEach(btn => btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy);
    const txt = el ? el.innerText : '';
    try{ await navigator.clipboard.writeText(txt); btn.textContent = 'Copiato'; }
    catch{ btn.textContent = 'Seleziona e copia manualmente'; }
    setTimeout(() => btn.textContent = 'Copia', 1600);
  }));

  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
})();
