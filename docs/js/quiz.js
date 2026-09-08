// PDM Lab — quiz.js: verifica a risposta multipla con feedback e spiegazione
(function(){
  const Q=[
    {q:'Mercato mobile: quale affermazione su sviluppo nativo e cross-platform è corretta?',o:['Il nativo garantisce massime performance e accesso immediato alle API; il cross-platform riduce costi ma può compromettere prestazioni','Il cross-platform è sempre più performante del nativo','KMM è un framework UI che ridisegna i widget','Flutter usa JavaScript'],a:0,w:'Nativo = Kotlin/Java su Android, Swift su iOS. Cross = React Native (JS), Flutter (Dart, rendering custom), KMM (solo logica condivisa, UI nativa).'},
    {q:'APK, DEX e ART: quale sequenza è corretta?',o:['Sorgente → DEX → .class → APK','Sorgente → .class → DEX → APK (via aapt), eseguito da ART con compilazione AOT','ART usa solo JIT come Dalvik','resources.arsc contiene il codice eseguibile'],a:1,w:'Il codice diventa .class, poi DEX ottimizzato per mobile, poi APK con aapt. ART compila AOT all’installazione: più veloce, installazione più lunga. classes.dex = codice, resources.arsc = risorse compilate.'},
    {q:'Nel Manifest, come si dichiara l’Activity di avvio?',o:['Con un permesso INTERNET','Con intent-filter MAIN + LAUNCHER e android:exported="true"','Con un Service','Con res/layout-land'],a:1,w:'<intent-filter> con action MAIN e category LAUNCHER indica la Home. Ogni Activity/Service/Receiver/Provider va dichiarato, altrimenti crash all’avvio.'},
    {q:'Kotlin: val, var e null safety. Cosa è vero?',o:['val è mutabile e String accetta null','val è immutabile; String? accetta null e si gestisce con ?. (safe call), ?: (Elvis) o !! (assertion rischiosa)','Il compilatore converte implicitamente Int in Long','it si usa solo nelle classi astratte'],a:1,w:'Tutto è oggetto, niente conversioni implicite. ?. ritorna null se null, ?: dà un default, !! forza e può lanciare NPE.'},
    {q:'Ordine di inizializzazione di una classe Kotlin?',o:['Secondario → init → primario','Primario → proprietà e init in ordine di apparizione → secondario (che deve delegare con : this(...))','init → secondario → primario','Le proprietà vengono dopo il secondario'],a:1,w:'Il blocco init non è un costruttore ma fa parte dell’inizializzazione del primario; senza delega : this(...) il secondario non compila.'},
    {q:'100 dp su schermo a 240 dpi: pixel e pollici?',o:['100 px e 1 pollice','150 px e 0,625 pollici','240 px e 0,5 pollici','160 px e 1,5 pollici'],a:1,w:'Pixel = 100 × (240/160) = 150 px. Pollici = 150/240 = 0,625″. A 160 dpi (mdpi) 1 dp = 1 px; i testi usano SP che segue le preferenze font.'},
    {q:'Style vs Theme in Android?',o:['Sono identici','Lo Style si applica a una singola View (style="@style/..."), il Theme all’intera app/Activity dal Manifest e tocca anche status bar e colori primari','Il Theme va in drawable/','Gli stili non supportano parent'],a:1,w:'Entrambi <style> in res/values con parent. I qualificatori (layout-land, values-en) scelgono il best match a runtime.'},
    {q:'Intent esplicito vs implicito?',o:['L’esplicito indica la classe esatta (SecondActivity::class.java); l’implicito indica un’azione generica (ACTION_VIEW) risolta via intent-filter','Sono la stessa cosa','L’implicito richiede sempre la classe','ACTION_VIEW avvia solo service'],a:0,w:'Gli espliciti si usano dentro la propria app; gli impliciti delegano al sistema (es. aprire un URL con il browser).'},
    {q:'Perché startActivityForResult è deprecato?',o:['Perché era troppo veloce','Perché era accoppiato al ciclo di vita e perdeva il risultato se l’Activity veniva distrutta; oggi si usa Activity Result API: Contract → registerForActivityResult → launch','Perché non supportava gli Intent','Perché richiedeva WorkManager'],a:1,w:'Il launcher restituito da registerForActivityResult riceve il callback anche dopo la ricreazione (es. StartActivityForResult con resultCode e data).'},
    {q:'Rotazione schermo: cosa fa Android di default e qual è la soluzione migliore?',o:['Non fa nulla','Distrugge e ricrea l’Activity (onPause→onStop→onDestroy→onCreate); la soluzione moderna è il ViewModel che sopravvive, poi onSaveInstanceState, mentre android:configChanges è sconsigliato','Chiude sempre l’app','Basta un Theme'],a:1,w:'Il ViewModel (MVVM) tiene lo stato UI oltre la rotazione. Il Bundle salva piccole quantità; forzare il Manifest evita il restart ma rompe il flusso atteso.'},
    {q:'ListView: cosa succede con convertView != null in getView?',o:['Si fa sempre inflate','Si riutilizza la view uscita dallo schermo cambiando solo testi/immagini: niente inflate, meno GC e più performance','Si crea un nuovo Adapter','Si blocca il Main Thread apposta'],a:1,w:'La ListView tiene in RAM solo le righe visibili + scorta. SimpleAdapter (Map con più campi) è più flessibile di ArrayAdapter; per le immagini da URL serve ViewBinder + Glide/Coil. RecyclerView impone il ViewHolder e delega ai LayoutManager.'},
    {q:'XML → Compose: quale mappatura è corretta?',o:['LinearLayout vertical → Row','FrameLayout → Box, RecyclerView → LazyColumn, setOnClickListener → Modifier.clickable o Button(onClick)','TextView → Activity','ListView → Service'],a:1,w:'Column = verticale, Row = orizzontale, Box = sovrapposizione. Le liste lazy creano solo i visibili, come RecyclerView, ma in poche righe.'},
    {q:'Compose: perché serve remember { mutableStateOf(0) }?',o:['È solo stile','Una var normale non notifica nessuno: mutableStateOf rende lo stato osservabile e remember lo conserva tra ricomposizioni; al cambio scatta la ricomposizione (UI = f(stato))','Serve solo per il Manifest','Sostituisce il DEX'],a:1,w:'Senza State la UI non si aggiorna. LaunchedEffect esegue il lavoro asincrono una sola volta; le immagini da rete si caricano con Coil AsyncImage + permesso INTERNET.'},
    {q:'Service: quale trabocchetto da esame?',o:['Il Service ha sempre una UI','Di default il Service gira nel Main Thread: il lavoro bloccante va su thread/coroutine altrimenti ANR','I Foreground Service non mostrano notifiche','START_STICKY impedisce il riavvio'],a:1,w:'Background (oggi WorkManager da API 26), Foreground (notifica obbligatoria via startForeground, es. musica/GPS), Bound (IBinder da onBind, vive finché c’è un client). START_STICKY riavvia, START_NOT_STICKY no.'},
    {q:'Room: Entity, DAO e Database. Cosa è vero?',o:['@Entity = query, @Dao = tabella','@Entity = tabella, @Dao = query (suspend = coroutine, Flow = stream reattivo), @Database = contenitore; le query sono verificate a compile-time e serve KSP','Room non usa SQLite','Flow blocca la UI'],a:1,w:'SQLite puro (SQLiteOpenHelper + Cursor/ContentValues) è verboso e non type-safe. Con collectAsStateWithLifecycle il Flow ridisegna la lista senza notifyDataSetChanged. Catena: Compose → ViewModel → Repository → DAO → SQLite.'},
    {q:'Firebase: Realtime Database vs Firestore?',o:['Sono identici','Realtime = grande JSON tree (scarica tutto il nodo, ValueEventListener); Firestore = Collection/Documenti (query mirate, possibili indici, addSnapshotListener per il real-time). Nei NoSQL si denormalizza con nodi top-level','Firestore non è real-time','Realtime usa addSnapshotListener'],a:1,w:'Entrambi usano WebSocket. Regola NoSQL: appiattire (es. classes / students / class_enrolments) per non scaricare megabyte inutili. Lettura una tantum: .get().addOnSuccessListener.'}
  ];
  const box=document.getElementById('quizBox'); if(!box) return;
  const scoreEl=document.getElementById('quizScore'), prog=document.getElementById('quizProg'), bestEl=document.getElementById('quizBest');
  let best=+(localStorage.getItem('pdm-quiz-best')||-1);
  if(best>=0) bestEl.textContent='miglior punteggio: '+best+' / '+Q.length;
  let score=0, done=0;
  const letters=['A','B','C','D'];
  Q.forEach((item,i)=>{
    const d=document.createElement('article'); d.className='q'; d.id='q'+i;
    d.innerHTML='<h4>'+(i+1)+'. '+item.q+'</h4><div class="opts"></div><p class="why" hidden></p>';
    const opts=d.querySelector('.opts'), why=d.querySelector('.why');
    item.o.forEach((t,j)=>{
      const b=document.createElement('button'); b.type='button'; b.className='opt'; b.innerHTML='<strong>'+letters[j]+'</strong> · '+t;
      b.addEventListener('click',()=>{
        if(d.classList.contains('done')) return;
        d.classList.add('done'); done++;
        const ok = j===item.a;
        [...opts.children].forEach((c,k)=>{ if(k===item.a) c.classList.add('correct'); });
        if(!ok) b.classList.add('wrong'); else score++;
        why.hidden=false; why.innerHTML=(ok?'<strong>Risposta corretta.</strong> ':'<strong>Risposta errata.</strong> ')+item.w;
        scoreEl.textContent='Punteggio: '+score+' / '+Q.length;
        prog.style.width=(done/Q.length*100)+'%';
        if(done===Q.length){
          const msg = score===Q.length?'Punteggio massimo: preparazione completa su questi contenuti.':score>=12?'Ottimo: ripassa solo le risposte errate e il formulario.':score>=9?'Buon risultato: rivedi laboratori e capitoli delle risposte errate.':'Si consiglia di rileggere capitoli e formulario, provare i laboratori e ripetere la verifica.';
          why.innerHTML+=' <br><strong>'+msg+'</strong>';
          if(score>best){ best=score; localStorage.setItem('pdm-quiz-best',best); bestEl.textContent='miglior punteggio: '+best+' / '+Q.length; }
        }
      });
      opts.appendChild(b);
    });
    box.appendChild(d);
  });
  document.getElementById('quizReset')?.addEventListener('click',()=>{
    score=0; done=0; scoreEl.textContent='Punteggio: 0 / '+Q.length; prog.style.width='0';
    box.querySelectorAll('.q').forEach(q=>{ q.classList.remove('done'); q.querySelectorAll('.opt').forEach(o=>o.classList.remove('correct','wrong')); q.querySelector('.why').hidden=true; });
    document.getElementById('quiz').scrollIntoView({behavior:'smooth'});
  });
})();
