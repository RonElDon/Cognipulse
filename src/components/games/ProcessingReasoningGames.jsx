import { useState, useEffect, useRef, useCallback } from 'react';

// ─── VISUOMOTOR GAMES ─────────────────────────────────────────────────────────

export function DotConnect({ onComplete, level }) {
  const n = 5 + level * 2;
  const [dots] = useState(()=>Array.from({length:n},(_,i)=>({id:i,x:15+Math.random()*70,y:10+Math.random()*80})));
  const [nextIdx, setNextIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());

  const handleDot=(id)=>{
    if(id===nextIdx){setNextIdx(i=>{if(i+1>=n){const elapsed=Date.now()-startTime;const score=Math.max(0,100-errors*10);setTimeout(()=>onComplete({score,accuracy:100-errors*5,reaction_time_ms:elapsed/n}),300);}return i+1;});}
    else setErrors(e=>e+1);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>Verbinde der Reihe nach!</span><span className="text-green-600">{nextIdx}/{n}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden" style={{height:360}}>
        {dots.map((d,i)=>(
          <button key={d.id} onClick={()=>handleDot(d.id)}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${i<nextIdx?'bg-green-400 text-white scale-90':i===nextIdx?'bg-amber-400 text-slate-900 scale-110 animate-pulse':'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
            style={{left:`${d.x}%`,top:`${d.y}%`,transform:'translate(-50%,-50%)'}}>
            {i+1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TargetTap({ onComplete, level }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);

  useEffect(()=>{
    const spawn=()=>{
      const id=Date.now()+Math.random(); const size=50-level*5;
      setTargets(t=>[...t,{id,x:10+Math.random()*80,y:10+Math.random()*80,size}]);
      setTimeout(()=>{setTargets(t=>{if(t.find(tt=>tt.id===id))setMissed(m=>m+1);return t.filter(tt=>tt.id!==id);});},Math.max(1500-level*200,600));
    };
    const si=setInterval(spawn,Math.max(900-level*100,400));
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(si);clearInterval(ti);const total=score+missed;const acc=total>0?Math.round(score/total*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);
    return()=>{clearInterval(si);clearInterval(ti);};
  },[score,missed,level]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {missed}</span></div>
      <div className="relative bg-slate-800 rounded-2xl overflow-hidden" style={{height:360}}>
        {targets.map(t=>(
          <button key={t.id} onClick={()=>{setScore(s=>s+1);setTargets(tt=>tt.filter(x=>x.id!==t.id));}}
            className="absolute rounded-full bg-orange-400 border-4 border-orange-300 shadow-lg pop-in hover:bg-orange-300 active:scale-75 transition-all"
            style={{left:`${t.x}%`,top:`${t.y}%`,width:t.size,height:t.size,transform:'translate(-50%,-50%)'}} />
        ))}
      </div>
    </div>
  );
}

export function SpatialRotation({ onComplete, level }) {
  const questions = [
    {q:'🔺',correct:'🔻',opts:['🔻','🔷','⬛','🔴']},
    {q:'🔷',correct:'🔶',opts:['🔶','🔺','🟦','⬜']},
    {q:'◀️',correct:'▶️',opts:['▶️','🔼','🔽','⬛']},
    {q:'🔼',correct:'🔽',opts:['🔽','🔺','🔻','◀️']},
    {q:'↗️',correct:'↙️',opts:['↙️','↖️','↘️','↕️']},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, questions.length);

  const handle=(opt)=>{
    const q=questions[idx];
    if(opt===q.correct) setScore(s=>s+1);
    const ni=idx+1;
    if(ni>=total){const acc=Math.round((score+(opt===q.correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),300);}
    else setIdx(ni);
  };

  const q=questions[idx];
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Gespiegeltes/Gedrehtes Objekt?</div>
      <div className="bg-orange-50 rounded-2xl p-10 text-center text-8xl">{q.q}</div>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-5 rounded-2xl bg-white border-2 border-slate-200 text-4xl hover:border-orange-400 active:scale-95 transition-all">{o}</button>)}
      </div>
    </div>
  );
}

export function GridNavigator({ onComplete, level }) {
  const size = 5;
  const [pos, setPos] = useState({ x:0, y:0 });
  const [goal] = useState({ x:size-1, y:size-1 });
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const optimal = (size-1)*2;

  const move=(dx,dy)=>{
    if(done) return;
    const nx=Math.max(0,Math.min(size-1,pos.x+dx));
    const ny=Math.max(0,Math.min(size-1,pos.y+dy));
    const newMoves=moves+1; setMoves(newMoves); setPos({x:nx,y:ny});
    if(nx===goal.x&&ny===goal.y){
      setDone(true);
      const score=Math.max(0,Math.round(100-(newMoves-optimal)*10));
      setTimeout(()=>onComplete({score,accuracy:score,reaction_time_ms:500}),500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>Moves: {moves}</span><span>Ziel: ({goal.x},{goal.y})</span></div>
      <div className="grid gap-1 mx-auto" style={{gridTemplateColumns:`repeat(${size},1fr)`,maxWidth:280}}>
        {Array.from({length:size*size},(_,i)=>{const x=i%size;const y=Math.floor(i/size);return(
          <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${pos.x===x&&pos.y===y?'bg-indigo-500 text-white':goal.x===x&&goal.y===y?'bg-yellow-400 text-white':'bg-slate-100'}`}>
            {pos.x===x&&pos.y===y?'🔵':goal.x===x&&goal.y===y?'🏁':''}
          </div>
        );})}
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
        <div /><button onClick={()=>move(0,-1)} className="py-3 rounded-xl bg-slate-200 font-black text-lg active:scale-95">▲</button><div />
        <button onClick={()=>move(-1,0)} className="py-3 rounded-xl bg-slate-200 font-black text-lg active:scale-95">◀</button>
        <div />
        <button onClick={()=>move(1,0)} className="py-3 rounded-xl bg-slate-200 font-black text-lg active:scale-95">▶</button>
        <div /><button onClick={()=>move(0,1)} className="py-3 rounded-xl bg-slate-200 font-black text-lg active:scale-95">▼</button><div />
      </div>
    </div>
  );
}

// ─── PROCESSING SPEED GAMES ───────────────────────────────────────────────────

export function SymbolMatch({ onComplete, level }) {
  const symbols = [['★','1'],['♦','2'],['●','3'],['▲','4'],['✦','5'],['◆','6']];
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [current, setCurrent] = useState(()=>symbols[Math.floor(Math.random()*symbols.length)]);
  const total = useRef(0);

  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:300}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[score]);

  const handle=(code)=>{ total.current++; if(code===current[1]) setScore(s=>s+1); else setErrors(e=>e+1); setCurrent(symbols[Math.floor(Math.random()*symbols.length)]); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="grid grid-cols-6 gap-1 bg-slate-50 rounded-xl p-3 text-center text-sm font-bold">
        {symbols.map(([s,n])=><div key={n}><div className="text-xl">{s}</div><div className="text-slate-500">={n}</div></div>)}
      </div>
      <div className="bg-white rounded-2xl p-8 text-center border-2 border-slate-100"><div className="text-7xl font-black">{current[0]}</div><p className="text-slate-400 text-sm mt-2">Welche Zahl?</p></div>
      <div className="grid grid-cols-3 gap-2">{['1','2','3','4','5','6'].map(n=><button key={n} onClick={()=>handle(n)} className="py-4 rounded-xl bg-cyan-50 border-2 border-cyan-200 font-black text-cyan-700 text-xl hover:bg-cyan-100 active:scale-95">{n}</button>)}</div>
    </div>
  );
}

export function QuickSort({ onComplete, level }) {
  const categories = ['🐾 Tier','🌿 Pflanze','🚗 Fahrzeug'];
  const items = [
    {word:'Hund',cat:0},{word:'Rose',cat:1},{word:'Auto',cat:2},{word:'Katze',cat:0},{word:'Baum',cat:1},
    {word:'Bus',cat:2},{word:'Vogel',cat:0},{word:'Blume',cat:1},{word:'Zug',cat:2},{word:'Fisch',cat:0},
    {word:'Gras',cat:1},{word:'Fahrrad',cat:2},{word:'Löwe',cat:0},{word:'Kaktus',cat:1},{word:'Schiff',cat:2},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const shuffled = useRef([...items].sort(()=>Math.random()-0.5));

  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=Math.round(score/(score+errors+0.01)*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[score,errors]);

  const handle=(cat)=>{ const item=shuffled.current[idx%shuffled.current.length]; if(cat===item.cat) setScore(s=>s+1); else setErrors(e=>e+1); setIdx(i=>i+1); };
  const item=shuffled.current[idx%shuffled.current.length];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="bg-slate-50 rounded-2xl p-8 text-center"><div className="text-4xl font-black text-slate-800">{item.word}</div></div>
      <div className="space-y-2">{categories.map((c,i)=><button key={i} onClick={()=>handle(i)} className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-cyan-400 active:scale-95">{c}</button>)}</div>
    </div>
  );
}

export function ReactionTimer({ onComplete, level }) {
  const [phase, setPhase] = useState('waiting');
  const [reactions, setReactions] = useState([]);
  const [round, setRound] = useState(0);
  const totalRounds = 5+level;
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const startRound = useCallback(()=>{
    setPhase('waiting');
    timerRef.current=setTimeout(()=>{setPhase('go');startRef.current=Date.now();},1500+Math.random()*2000);
  },[]);

  useEffect(()=>{startRound();return()=>clearTimeout(timerRef.current);},[]);

  const handleTap=()=>{
    if(phase==='waiting'){clearTimeout(timerRef.current);setPhase('tooEarly');setTimeout(startRound,1200);return;}
    if(phase==='go'){
      const rt=Date.now()-startRef.current; const newR=[...reactions,rt]; setReactions(newR);
      const nr=round+1; setRound(nr);
      if(nr>=totalRounds){const avg=Math.round(newR.reduce((a,b)=>a+b)/newR.length);setPhase('done');setTimeout(()=>onComplete({score:Math.min(100,Math.max(0,Math.round(100-(avg-180)/5))),accuracy:100,reaction_time_ms:avg}),600);}
      else{setPhase('hit');setTimeout(startRound,700);}
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold"><span className="text-slate-600">Runde {Math.min(round+1,totalRounds)}/{totalRounds}</span>{reactions.length>0&&<span className="text-cyan-600">Ø {Math.round(reactions.reduce((a,b)=>a+b)/reactions.length)}ms</span>}</div>
      <button onClick={handleTap} className={`w-full rounded-3xl h-60 flex flex-col items-center justify-center gap-3 transition-all duration-100 active:scale-95 ${phase==='go'?'bg-green-400 shadow-2xl':phase==='waiting'?'bg-slate-200':phase==='tooEarly'?'bg-red-200':phase==='hit'?'bg-cyan-200':'bg-slate-100'}`}>
        <div className="text-6xl">{phase==='go'?'⚡':phase==='hit'?'✅':phase==='tooEarly'?'❌':phase==='done'?'🏁':'⏳'}</div>
        <div className="font-black text-slate-700 text-xl">{phase==='go'?'JETZT!':phase==='waiting'?'Warten...':phase==='tooEarly'?'Zu früh!':phase==='hit'?'Super!':'Fertig!'}</div>
        {reactions.length>0&&<div className="flex gap-2">{reactions.slice(-3).map((r,i)=><span key={i} className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-bold">{r}ms</span>)}</div>}
      </button>
    </div>
  );
}

export function DecisionDash({ onComplete, level }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [current, setCurrent] = useState(()=>Math.floor(Math.random()*20)+1);
  const [rule] = useState(()=>['gerade','ungerade','> 10','< 10'][Math.floor(Math.random()*4)]);
  const total = useRef(0);

  const isCorrect=(n)=>{if(rule==='gerade')return n%2===0;if(rule==='ungerade')return n%2!==0;if(rule==='> 10')return n>10;return n<10;};
  useEffect(()=>{const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:300}),300);return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[score]);

  const handle=(ans)=>{ total.current++; if(ans===isCorrect(current)) setScore(s=>s+1); else setErrors(e=>e+1); setCurrent(Math.floor(Math.random()*20)+1); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-cyan-600">Regel: {rule}</span><span className="text-green-600">✓ {score}</span></div>
      <div className="bg-slate-50 rounded-2xl p-10 text-center"><div className="text-7xl font-black text-slate-800">{current}</div></div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>handle(true)} className="py-5 rounded-2xl bg-green-500 text-white font-black text-xl active:scale-95">✅ JA</button>
        <button onClick={()=>handle(false)} className="py-5 rounded-2xl bg-red-400 text-white font-black text-xl active:scale-95">❌ NEIN</button>
      </div>
    </div>
  );
}

export function NumberCompare({ onComplete, level }) {
  const [a, setA] = useState(()=>Math.floor(Math.random()*100));
  const [b, setB] = useState(()=>Math.floor(Math.random()*100));
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const total = useRef(0);
  const max = Math.pow(10, level+1);
  const next=()=>{setA(Math.floor(Math.random()*max));setB(Math.floor(Math.random()*max));};

  useEffect(()=>{const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:300}),300);return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[score]);

  const handle=(bigger)=>{ total.current++; if(bigger?(a>b):(a<b)) setScore(s=>s+1); else setErrors(e=>e+1); next(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-6">
        <div className="text-center"><div className="text-5xl font-black text-indigo-600">{a}</div><div className="text-sm text-slate-400 mt-1">A</div></div>
        <div className="text-center"><div className="text-5xl font-black text-purple-600">{b}</div><div className="text-sm text-slate-400 mt-1">B</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>handle(true)} className="py-4 rounded-2xl bg-indigo-500 text-white font-black text-lg active:scale-95">A &gt; B</button>
        <button onClick={()=>handle(false)} className="py-4 rounded-2xl bg-purple-500 text-white font-black text-lg active:scale-95">B &gt; A</button>
      </div>
    </div>
  );
}

export function TrueFalseBlitz({ onComplete, level }) {
  const statements = [
    {q:'Paris ist die Hauptstadt von Frankreich.',a:true},{q:'Die Erde hat 3 Monde.',a:false},
    {q:'7 × 8 = 56',a:true},{q:'Wasser siedet bei 90°C.',a:false},{q:'Ein Jahr hat 365 Tage.',a:true},
    {q:'Deutschland liegt in Asien.',a:false},{q:'5² = 25',a:true},{q:'12 × 12 = 144',a:true},
    {q:'3 + 4 × 2 = 11',a:true},{q:'Rom ist in Deutschland.',a:false},{q:'Der Atlantik hat Salzwasser.',a:true},{q:'2³ = 6',a:false},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const shuffled = useRef([...statements].sort(()=>Math.random()-0.5));

  useEffect(()=>{const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const total=score+errors;const acc=total>0?Math.round(score/total*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[score,errors]);

  const handle=(ans)=>{ const s=shuffled.current[idx%shuffled.current.length]; if(ans===s.a) setScore(sc=>sc+1); else setErrors(e=>e+1); setIdx(i=>i+1); };
  const s=shuffled.current[idx%shuffled.current.length];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="bg-slate-50 rounded-2xl p-6 min-h-24 flex items-center justify-center text-center"><p className="font-bold text-slate-800 text-base">{s.q}</p></div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>handle(true)} className="py-5 rounded-2xl bg-green-500 text-white font-black text-xl active:scale-95">✅ WAHR</button>
        <button onClick={()=>handle(false)} className="py-5 rounded-2xl bg-red-400 text-white font-black text-xl active:scale-95">❌ FALSCH</button>
      </div>
    </div>
  );
}

// ─── REASONING GAMES ──────────────────────────────────────────────────────────

export function PatternMaster({ onComplete, level }) {
  const patterns = [
    {seq:['🔴','🔵','🔴','🔵','?'],answer:'🔴',opts:['🔴','🟢','🟡','🔵']},
    {seq:['1','2','4','8','?'],answer:'16',opts:['10','16','12','32']},
    {seq:['A','C','E','G','?'],answer:'I',opts:['H','I','J','K']},
    {seq:['🌑','🌒','🌓','🌔','?'],answer:'🌕',opts:['🌕','🌑','🌒','🌗']},
    {seq:['2','4','6','8','?'],answer:'10',opts:['9','10','12','11']},
    {seq:['🐟','🐠','🐟','🐠','?'],answer:'🐟',opts:['🐟','🦈','🐬','🐠']},
    {seq:['3','6','12','24','?'],answer:'48',opts:['36','48','60','42']},
    {seq:['⬜','⬜⬜','⬜⬜⬜','?'],answer:'⬜⬜⬜⬜',opts:['⬜⬜⬜⬜','⬜⬜⬜','⬜⬜⬜⬜⬜','⬜⬜']},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const total = Math.min(4+level, patterns.length);
  const shuffled = useRef([...patterns].sort(()=>Math.random()-0.5));

  const handle=(opt)=>{
    const p=shuffled.current[idx]; const correct=opt===p.answer;
    setFeedback(correct?'correct':'wrong'); if(correct) setScore(s=>s+1);
    setTimeout(()=>{ setFeedback(null); const ni=idx+1; if(ni>=total){const sc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:sc,accuracy:sc,reaction_time_ms:500}),200);}else setIdx(ni); },600);
  };

  const p=shuffled.current[idx];
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Was kommt als nächstes?</div>
      <div className={`rounded-2xl p-5 text-center transition-all ${feedback==='correct'?'bg-green-100':feedback==='wrong'?'bg-red-100':'bg-slate-50'}`}>
        <div className="flex gap-3 justify-center items-center flex-wrap text-3xl">{p.seq.map((s,i)=><span key={i}>{s}</span>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">{p.opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 text-lg hover:border-rose-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function NumberSequences({ onComplete, level }) {
  const seqs = [
    {seq:[2,4,6,8],next:10},{seq:[3,6,9,12],next:15},{seq:[1,4,9,16],next:25},
    {seq:[100,50,25,12],next:6},{seq:[1,1,2,3,5],next:8},{seq:[2,3,5,7,11],next:13},
    {seq:[5,10,20,40],next:80},{seq:[1,8,27,64],next:125},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(4+level, seqs.length);
  const shuffled = useRef([...seqs].sort(()=>Math.random()-0.5));

  const handle=(ans)=>{
    const s=shuffled.current[idx]; const correct=parseInt(ans)===s.next; if(correct) setScore(sc=>sc+1);
    const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni);
  };

  const s=shuffled.current[idx];
  const diff=s.next-s.seq[s.seq.length-1];
  const opts=[s.next,s.next+Math.abs(diff),s.next-Math.abs(diff),s.next*2].filter((v,i,a)=>a.indexOf(v)===i&&v>0).sort(()=>Math.random()-0.5).slice(0,4);

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Nächste Zahl?</div>
      <div className="bg-slate-50 rounded-2xl p-6 text-center"><div className="flex gap-3 justify-center text-3xl font-black text-indigo-600">{s.seq.map((n,i)=><span key={i}>{n}</span>)}<span className="text-slate-400">?</span></div></div>
      <div className="grid grid-cols-2 gap-3">{opts.map((o,i)=><button key={i} onClick={()=>handle(String(o))} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-black text-slate-700 text-xl hover:border-rose-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function LogicPuzzles({ onComplete, level }) {
  const puzzles = [
    {q:'Alle Katzen haben Fell. Mimi ist eine Katze. Hat Mimi Fell?',opts:['Ja','Nein','Vielleicht'],correct:0},
    {q:'Wenn A>B und B>C, was gilt für A und C?',opts:['A>C','A<C','A=C','Unbekannt'],correct:0},
    {q:'Ein Zug fährt 2h mit 100km/h. Wie weit?',opts:['100km','200km','50km','150km'],correct:1},
    {q:'Wenn alle Blumen schön sind und Rosen Blumen sind...',opts:['Rosen sind schön','Rosen sind nicht schön','Nur manche','Unbekannt'],correct:0},
    {q:'Alle Vögel fliegen. Pinguine fliegen nicht. Was folgt?',opts:['Pinguine sind keine Vögel','Pinguine können fliegen','Unbekannt','Pinguine sind Vögel'],correct:2},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, puzzles.length);
  const shuffled = useRef([...puzzles].sort(()=>Math.random()-0.5));

  const handle=(i)=>{ const p=shuffled.current[idx]; const correct=i===p.correct; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:600}),200);}else setIdx(ni); };
  const p=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total}</div>
      <div className="bg-rose-50 rounded-2xl p-5 font-semibold text-slate-800 leading-relaxed text-center">{p.q}</div>
      <div className="space-y-2">{p.opts.map((o,i)=><button key={i} onClick={()=>handle(i)} className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold text-slate-700 hover:border-rose-400 active:scale-95 text-left px-4">{o}</button>)}</div>
    </div>
  );
}

export function MatrixReasoning({ onComplete, level }) {
  const matrices = [
    {grid:['🔴','🔵','🟡','🔵','🟡','🔴','🟡','🔴','?'],answer:'🔵',opts:['🔴','🔵','🟡','🟢']},
    {grid:['1','2','3','4','5','6','7','8','?'],answer:'9',opts:['9','10','8','7']},
    {grid:['⭐','⭐⭐','⭐⭐⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','?'],answer:'⭐⭐⭐⭐⭐',opts:['⭐⭐⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐','⭐⭐⭐⭐⭐⭐']},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(2+level, matrices.length);
  const shuffled = useRef([...matrices].sort(()=>Math.random()-0.5));

  const handle=(opt)=>{ const m=shuffled.current[idx]; const correct=opt===m.answer; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni); };
  const m=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Was kommt ins ?-Feld?</div>
      <div className="grid grid-cols-3 gap-2">{m.grid.map((cell,i)=><div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold ${cell==='?'?'bg-yellow-200 border-2 border-yellow-400 text-2xl':'bg-slate-100'}`}>{cell}</div>)}</div>
      <div className="grid grid-cols-2 gap-3">{m.opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-lg hover:border-rose-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function AnalogyTrain({ onComplete, level }) {
  const analogies = [
    {q:'Hund : Welpe = Katze : ?',opts:['Kätzchen','Fohlen','Küken','Lamm'],correct:0},
    {q:'Tag : Nacht = Sommer : ?',opts:['Herbst','Winter','Frühling','Regen'],correct:1},
    {q:'Auge : Sehen = Ohr : ?',opts:['Hören','Riechen','Schmecken','Fühlen'],correct:0},
    {q:'Messer : Schneiden = Pinsel : ?',opts:['Malen','Backen','Schneiden','Bauen'],correct:0},
    {q:'Arzt : Krankenhaus = Lehrer : ?',opts:['Schule','Büro','Fabrik','Markt'],correct:0},
    {q:'Heiß : Kalt = Groß : ?',opts:['Klein','Mittel','Warm','Eng'],correct:0},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, analogies.length);
  const shuffled = useRef([...analogies].sort(()=>Math.random()-0.5));

  const handle=(i)=>{ const a=shuffled.current[idx]; const correct=i===a.correct; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni); };
  const a=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total}</div>
      <div className="bg-rose-50 rounded-2xl p-5 text-center font-bold text-slate-800 text-lg">{a.q}</div>
      <div className="grid grid-cols-2 gap-2">{a.opts.map((o,i)=><button key={i} onClick={()=>handle(i)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-rose-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function CategorySort({ onComplete, level }) {
  const categories = [{label:'🦁 Tiere',words:['Löwe','Hund','Vogel','Fisch','Katze']},{label:'🍎 Früchte',words:['Apfel','Mango','Birne','Traube','Kiwi']},{label:'🏙️ Städte',words:['Berlin','Paris','London','Tokio','Rom']}];
  const allWords = useRef(categories.flatMap(c=>c.words).sort(()=>Math.random()-0.5));
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const total = allWords.current.length;

  useEffect(()=>{const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=Math.round(score/(score+errors+0.01)*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[score,errors]);

  const getCategory=(word)=>categories.findIndex(c=>c.words.includes(word));
  const handle=(catIdx)=>{ const word=allWords.current[wordIdx%total]; if(catIdx===getCategory(word)) setScore(s=>s+1); else setErrors(e=>e+1); const ni=wordIdx+1; if(ni>=total){const acc=Math.round((score+(catIdx===getCategory(word)?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);}else setWordIdx(ni); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span>{wordIdx+1}/{total}</span><span className="text-green-600">✓ {score}</span></div>
      <div className="bg-rose-50 rounded-2xl p-8 text-center"><div className="text-4xl font-black text-slate-800">{allWords.current[wordIdx%total]}</div></div>
      <div className="space-y-2">{categories.map((c,i)=><button key={i} onClick={()=>handle(i)} className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-rose-400 active:scale-95">{c.label}</button>)}</div>
    </div>
  );
}

export function SyllogismSprint({ onComplete, level }) {
  const syllogisms = [
    {q:'Alle Menschen sterben. Sokrates ist ein Mensch. → Sokrates stirbt.',correct:true},
    {q:'Einige Hunde bellen. Rex bellt. → Rex ist ein Hund.',correct:false},
    {q:'Kein Fisch ist ein Vogel. Alle Adler sind Vögel. → Kein Adler ist ein Fisch.',correct:true},
    {q:'Alle Katzen schlafen tagsüber. Mimi schläft nicht. → Mimi ist keine Katze.',correct:true},
    {q:'Alle A sind B. Alle B sind C. → Alle A sind C.',correct:true},
    {q:'Einige A sind B. Alle B sind C. → Alle A sind C.',correct:false},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const total = Math.min(4+level, syllogisms.length);
  const shuffled = useRef([...syllogisms].sort(()=>Math.random()-0.5));

  const handle=(ans)=>{ const s=shuffled.current[idx]; const correct=ans===s.correct; if(correct) setScore(sc=>sc+1); else setErrors(e=>e+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),200);}else setIdx(ni); };
  const s=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>{idx+1}/{total}</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="bg-rose-50 rounded-2xl p-5 font-semibold text-slate-800 leading-relaxed">{s.q}</div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>handle(true)} className="py-5 rounded-2xl bg-green-500 text-white font-black text-xl active:scale-95">✅ GÜLTIG</button>
        <button onClick={()=>handle(false)} className="py-5 rounded-2xl bg-red-400 text-white font-black text-xl active:scale-95">❌ UNGÜLTIG</button>
      </div>
    </div>
  );
}

export function DeductionGame({ onComplete, level }) {
  const puzzles = [
    {q:'A,B,C in einer Reihe. A ist nicht links. C ist rechts von B. Wer steht links?',opts:['A','B','C'],correct:1},
    {q:'5 Personen im Rennen. Carla ist 3. Bob ist hinter Carla. Anna ist nicht 1. Wer könnte 1. sein?',opts:['Anna','Bob','Dave','Carla'],correct:2},
    {q:'Alle Vögel fliegen. Pinguine fliegen nicht. Folgt: Pinguine sind keine Vögel?',opts:['Ja, logisch','Nein, Widerspruch','Kann nicht sicher gesagt werden','Pinguine sind Vögel'],correct:2},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(2+level, puzzles.length);

  const handle=(i)=>{ const p=puzzles[idx]; const correct=i===p.correct; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:600}),200);}else setIdx(ni); };
  const p=puzzles[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total}</div>
      <div className="bg-rose-50 rounded-2xl p-5 font-semibold text-slate-800 leading-relaxed">{p.q}</div>
      <div className="space-y-2">{p.opts.map((o,i)=><button key={i} onClick={()=>handle(i)} className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold text-slate-700 hover:border-rose-400 active:scale-95 text-left px-4">{o}</button>)}</div>
    </div>
  );
}