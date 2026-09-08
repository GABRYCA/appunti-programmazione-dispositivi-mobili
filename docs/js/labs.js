// PDM Lab — labs.js: laboratori interattivi vanilla, accessibili
(function(){
  const $ = id => document.getElementById(id);
  function ctx2d(c){ const w=c.width,h=c.height; c.style.aspectRatio = w+'/'+h; return {x:c.getContext('2d'),w,h}; }
  function cssVar(n, fb){ return (getComputedStyle(document.documentElement).getPropertyValue(n) || fb).trim() || fb; }

  /* LAB 1 — DP -> px / pollici */
  const dpEl=$('dpVal'), dpiEl=$('dpiVal');
  function drawDp(){
    if(!dpEl || !dpiEl) return;
    const dp=+dpEl.value, dpi=+dpiEl.value;
    $('dpOut').textContent=dp; $('dpiOut').textContent=dpi;
    const px=dp*(dpi/160), inches=px/dpi;
    const c=$('dpCanvas'); if(c){
      const {x,w,h}=ctx2d(c); x.clearRect(0,0,w,h);
      const base = dp*(160/160); // larghezza di riferimento a 160dpi
      const maxPx = 400*(640/160); // caso peggiore: max slider DP × max slider dpi
      const bw=Math.max(4,(px/maxPx)*(w-120));
      const bwRef=Math.max(4,(base/maxPx)*(w-120));
      x.fillStyle='#94a3b8'; x.fillRect(40,40,bwRef,34);
      x.fillStyle=cssVar('--brand','#3b82f6'); x.fillRect(40,100,bw,34);
      x.fillStyle=cssVar('--ink','#1c2a2e'); x.font='12px system-ui';
      x.fillText('riferimento mdpi (160 dpi): '+base.toFixed(0)+' px', 40, 32);
      x.fillText('questo dispositivo ('+dpi+' dpi): '+px.toFixed(1)+' px', 40, 92);
    }
    $('dpResult').innerHTML='Pixel reali = '+dp+' × ('+dpi+'/160) = <strong>'+px.toFixed(1)+' px</strong> · Dimensione fisica = '+px.toFixed(1)+'/'+dpi+' = <strong>'+inches.toFixed(3)+' pollici</strong>. Esempio dagli appunti: 100 dp a 240 dpi → 150 px → 0,625″.';
  }
  dpEl?.addEventListener('input',drawDp); dpiEl?.addEventListener('input',drawDp); drawDp();

  /* LAB 2 — Ciclo di vita Activity */
  const lifeInfo={
    onCreate:['onCreate() — setup iniziale','Chiamato una sola volta. Qui si crea la UI con setContentView. L’Activity esiste ma non è ancora visibile (lo diventa in onStart).'],
    onStart:['onStart() — activity visibile','L’activity diventa visibile ma non ha ancora il focus. Inizio del Visible lifetime.'],
    onResume:['onResume() — focus e interazione','L’activity è in foreground e interagisce con l’utente. Confine superiore del Foreground lifetime.'],
    onPause:['onPause() — perde il focus','Ancora parzialmente visibile (dialog semi-trasparente, multi-finestra) ma senza focus. Qui si mettono in pausa animazioni e sensori.'],
    onStop:['onStop() — completamente nascosta','L’utente ha premuto Home o aperto un’altra app a tutto schermo. Fine del Visible lifetime.'],
    onDestroy:['onDestroy() — distruzione','Ultima pulizia prima della rimozione. Con rotazione schermo segue onStop e precede una nuova onCreate.']
  };
  document.querySelectorAll('[data-life]').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('[data-life]').forEach(o=>o.classList.remove('sel'));
      b.classList.add('sel');
      const [t,d]=lifeInfo[b.dataset.life]||['',''];
      const r=$('lifeResult'); if(r) r.innerHTML='<strong>'+t+':</strong> '+d;
    });
  });

  /* LAB 3 — View recycling */
  const totEl=$('recTot'), visEl=$('recVis');
  function drawRec(){
    if(!totEl||!visEl) return;
    let tot=+totEl.value, vis=+visEl.value;
    if(vis>tot){ vis=tot; visEl.value=String(vis); }
    $('recTotOut').textContent=tot; $('recVisOut').textContent=vis;
    const c=$('recCanvas');
    if(c){
      const {x,w,h}=ctx2d(c); x.clearRect(0,0,w,h);
      const n=Math.min(tot,40), cols=10, cw=(w-20)/cols, ch=26;
      for(let i=0;i<n;i++){
        const row=Math.floor(i/cols), col=i%cols;
        const px=10+col*cw+3, py=16+row*ch;
        x.fillStyle = i<Math.min(vis,40) ? cssVar('--brand','#3b82f6') : 'rgba(148,163,184,.55)';
        x.fillRect(px,py,cw-6,ch-8);
      }
      x.fillStyle=cssVar('--ink','#1c2a2e'); x.font='12px system-ui';
      x.fillText('blu = righe davvero in RAM ('+Math.min(vis,tot)+') · grigie = righe virtuali riciclate', 10, h-8);
    }
    const created=Math.min(vis+2,tot);
    const saved=Math.max(0,tot-created);
    $('recResult').innerHTML='Con '+tot+' elementi e '+vis+' righe visibili, la ListView crea solo <strong>'+created+' view</strong> (visibili + 2 di scorta). Le altre <strong>'+saved+'</strong> vengono riutilizzate tramite <strong>convertView</strong> in getView(): niente inflate, solo setText/setImage. Risparmio memoria ≈ <strong>'+(tot?Math.round(saved/tot*100):0)+'%</strong>.';
  }
  totEl?.addEventListener('input',drawRec); visEl?.addEventListener('input',drawRec); drawRec();

  /* LAB 4 — Compose: stato e ricomposizione */
  let count=0, recomps=0, remembered=true;
  const cEl=$('composeCount'), rEl=$('composeRecomp');
  function renderCompose(){
    if(cEl) cEl.textContent=count;
    if(rEl) rEl.textContent=recomps;
    const res=$('composeResult'); if(!res) return;
    res.innerHTML = remembered
      ? 'Con <strong>remember { mutableStateOf(0) }</strong>: count = <strong>'+count+'</strong>, ricomposizioni = <strong>'+recomps+'</strong>. UI = f(stato): ogni click notifica Compose che ridisegna solo il Text.'
      : 'Senza remember: a ogni ricomposizione count tornerebbe a 0. La UI <strong>non</strong> si aggiornerebbe mai: ecco perché serve lo State osservabile.';
  }
  $('composeInc')?.addEventListener('click',()=>{ if(remembered){ count++; recomps++; } else { count=0; /* senza remember la var si re-inizializza */ } renderCompose(); });
  $('composeReset')?.addEventListener('click',()=>{ count=0; recomps=0; renderCompose(); });
  $('composeToggle')?.addEventListener('click',(e)=>{ remembered=!remembered; e.target.textContent = remembered ? 'Simula: rimuovi remember' : 'Simula: aggiungi remember'; renderCompose(); });
  renderCompose();

  /* LAB 5 — Service o WorkManager? */
  const svcRadios=document.querySelectorAll('input[name="svc"]');
  function drawSvc(){
    const v=document.querySelector('input[name="svc"]:checked')?.value;
    const r=$('svcResult'); if(!r) return;
    if(v==='immediato') r.innerHTML='<strong>Foreground Service</strong>: operazione immediata ed evidente (musica, navigazione GPS). Obbligatori: dichiarazione nel Manifest, permesso FOREGROUND_SERVICE e <strong>notifica persistente</strong> con startForeground(). Se ucciso, con START_STICKY si riavvia da solo.';
    else if(v==='differibile') r.innerHTML='<strong>WorkManager</strong>: task differibile o periodico (backup, sync, invio log). Rispetta Doze Mode e batteria, sopravvive al riavvio, supporta Constraints (es. solo Wi-Fi + in carica). I Background Service classici da API 26 vengono terminati.';
    else if(v==='bind') r.innerHTML='<strong>Bound Service</strong>: serve un’interfaccia client-server (l’Activity chiama musicService.pause()). Il Service restituisce un IBinder da onBind() e vive finché c’è almeno un client collegato. Ricorda: gira nel Main Thread, usa coroutine per il lavoro pesante.';
    else r.innerHTML='Seleziona uno scenario per la raccomandazione architetturale.';
  }
  svcRadios.forEach(r=>r.addEventListener('change',drawSvc)); drawSvc();

  /* LAB 6 — Quale database Firebase? */
  document.querySelectorAll('#fbTable tr[data-band]').forEach(tr=>{
    function show(){
      document.querySelectorAll('#fbTable tr').forEach(o=>o.classList.remove('sel'));
      tr.classList.add('sel');
      $('fbResult').innerHTML='<strong>'+tr.cells[0].textContent.trim()+':</strong> '+tr.dataset.band;
    }
    tr.addEventListener('click',show);
    tr.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(); } });
  });

  window.addEventListener('resize', ()=>{ drawDp(); drawRec(); });
})();
