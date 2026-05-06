import { useState, useEffect, useRef } from 'react';

// ─── LANGUAGE GAMES ───────────────────────────────────────────────────────────

export function WordFluency({ onComplete, level }) {
  const letters = 'ABDFGHKLMNRSTW';
  const [letter] = useState(()=>letters[Math.floor(Math.random()*letters.length)]);
  const [input, setInput] = useState('');
  const [words, setWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30+level*10);

  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const score=Math.min(100,words.length*10);setTimeout(()=>onComplete({score,accuracy:score,reaction_time_ms:500}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[words]);

  const addWord=()=>{
    const w=input.trim();
    if(w.length>1&&w.toUpperCase().startsWith(letter)&&!words.includes(w.toLowerCase())){setWords(ws=>[...ws,w.toLowerCase()]);}
    setInput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-violet-600">Wörter: {words.length}</span></div>
      <div className="bg-violet-50 rounded-2xl p-6 text-center"><div className="text-7xl font-black text-violet-600">{letter}</div><p className="text-sm text-slate-400 mt-2">Schreibe Wörter mit {letter}!</p></div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addWord()}
          className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 font-bold focus:outline-none focus:border-violet-400"
          placeholder={`Wort mit ${letter}...`} autoFocus />
        <button onClick={addWord} className="px-5 rounded-xl bg-violet-500 text-white font-bold active:scale-95">+</button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
        {words.map((w,i)=><span key={i} className="bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-sm font-bold">{w}</span>)}
      </div>
    </div>
  );
}

export function SynonymFind({ onComplete, level }) {
  const pairs = [
    {word:'groß',opts:['riesig','klein','eng','kurz'],correct:0},
    {word:'schnell',opts:['träge','flink','breit','still'],correct:1},
    {word:'glücklich',opts:['traurig','froh','wütend','müde'],correct:1},
    {word:'alt',opts:['jung','veraltet','frisch','neu'],correct:1},
    {word:'mutig',opts:['feige','tapfer','sanft','laut'],correct:1},
    {word:'klug',opts:['dumm','weise','langsam','faul'],correct:1},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, pairs.length);
  const shuffled = useRef([...pairs].sort(()=>Math.random()-0.5));

  const handle=(i)=>{ const p=shuffled.current[idx]; const correct=i===p.correct; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni); };
  const p=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Finde das Synonym!</div>
      <div className="bg-violet-50 rounded-2xl p-6 text-center font-black text-3xl text-violet-700">{p.word}</div>
      <div className="grid grid-cols-2 gap-2">{p.opts.map((o,i)=><button key={i} onClick={()=>handle(i)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-violet-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function AnagramSolver({ onComplete, level }) {
  const words = ['HUND','BAUM','HAUS','APFEL','SCHULE','BUCH','AUTO','VOGEL','BLUME','SONNE'];
  const n = Math.min(2+level, 5);
  const selected = useRef([...words].sort(()=>Math.random()-0.5).slice(0,n));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const scramble=(w)=>{ let s=w.split('').sort(()=>Math.random()-0.5).join(''); return s===w?scramble(w):s; };
  const [scrambled] = useState(()=>selected.current.map(scramble));

  const handle=()=>{
    const correct=input.toUpperCase()===selected.current[idx];
    setFeedback(correct?'✅ Richtig!':'❌ '+selected.current[idx]);
    if(correct) setScore(s=>s+1);
    setTimeout(()=>{ setFeedback(null);setInput(''); const ni=idx+1; if(ni>=n){const acc=Math.round((score+(correct?1:0))/n*100);onComplete({score:acc,accuracy:acc,reaction_time_ms:500});}else setIdx(ni); },900);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{n} • Anagramm lösen!</div>
      <div className={`rounded-2xl p-6 text-center transition-all ${feedback?feedback.startsWith('✅')?'bg-green-100':'bg-red-100':'bg-violet-50'}`}>
        {feedback?<div className="font-bold text-lg">{feedback}</div>:<div className="text-5xl font-black text-violet-600 tracking-widest">{scrambled[idx]}</div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}
          className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-bold text-lg text-center focus:outline-none focus:border-violet-400 uppercase"
          placeholder="Deine Antwort..." />
        <button onClick={handle} className="px-5 rounded-xl bg-violet-500 text-white font-bold text-lg active:scale-95">✓</button>
      </div>
    </div>
  );
}

export function WordChain({ onComplete, level }) {
  const chains = [
    {start:'Baum', steps:['Baum → ?','? → Haus','Haus → ?'], connections:[['Ast','Blatt','Wald','Holz'],['Baum','Holz','Dach','Wand'],['Tür','Garten','Familie','Licht']]},
    {start:'Wasser', steps:['Wasser → ?','? → Fisch'], connections:[['See','Meer','Regen','Fluss'],['Netz','Angel','Meer','Teich']]},
  ];
  const chain = chains[Math.floor(Math.random()*chains.length)];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handle=(word)=>{
    setScore(s=>s+1);
    const ni=idx+1;
    if(ni>=chain.connections.length){ setTimeout(()=>onComplete({score:Math.round((score+1)/chain.connections.length*100),accuracy:100,reaction_time_ms:500}),300); }
    else setIdx(ni);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">Schritt {idx+1}/{chain.connections.length}</div>
      <div className="bg-violet-50 rounded-2xl p-5 text-center font-bold text-slate-800">{chain.steps[idx].replace('?','___')}</div>
      <p className="text-center text-xs text-slate-400">Welches Wort passt am besten?</p>
      <div className="grid grid-cols-2 gap-2">{chain.connections[idx].map((w,i)=><button key={i} onClick={()=>handle(w)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-violet-400 active:scale-95">{w}</button>)}</div>
    </div>
  );
}

export function OddWordOut({ onComplete, level }) {
  const groups = [
    {words:['Hund','Katze','Auto','Vogel'],odd:2},{words:['Apfel','Birne','Karotte','Mango'],odd:2},
    {words:['Berlin','Paris','Löwe','London'],odd:2},{words:['Rot','Blau','Groß','Grün'],odd:2},
    {words:['Tisch','Stuhl','Hammer','Bett'],odd:2},{words:['Fisch','Wal','Delfin','Adler'],odd:3},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, groups.length);
  const shuffled = useRef([...groups].sort(()=>Math.random()-0.5));

  const handle=(i)=>{ const g=shuffled.current[idx]; const correct=i===g.odd; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),200);}else setIdx(ni); };
  const g=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Welches passt nicht?</div>
      <div className="grid grid-cols-2 gap-3">{g.words.map((w,i)=><button key={i} onClick={()=>handle(i)} className="py-5 rounded-2xl bg-white border-2 border-slate-200 font-bold text-slate-700 text-lg hover:border-violet-400 active:scale-95">{w}</button>)}</div>
    </div>
  );
}

export function DefinitionMatch({ onComplete, level }) {
  const defs = [
    {def:'Ein Ort, wo man Bücher ausleihen kann',opts:['Bibliothek','Supermarkt','Schule','Museum'],correct:0},
    {def:'Ein Gerät zum Messen der Temperatur',opts:['Lineal','Waage','Thermometer','Uhr'],correct:2},
    {def:'Regierungsform durch das Volk',opts:['Monarchie','Demokratie','Diktatur','Anarchie'],correct:1},
    {def:'Prozess, bei dem Pflanzen Licht in Energie umwandeln',opts:['Verdauung','Atmung','Fotosynthese','Verdunstung'],correct:2},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(2+level, defs.length);
  const shuffled = useRef([...defs].sort(()=>Math.random()-0.5));

  const handle=(i)=>{ const d=shuffled.current[idx]; const correct=i===d.correct; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni); };
  const d=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total}</div>
      <div className="bg-violet-50 rounded-2xl p-5 text-center font-semibold text-slate-800">{d.def}</div>
      <div className="grid grid-cols-2 gap-2">{d.opts.map((o,i)=><button key={i} onClick={()=>handle(i)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-violet-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function VerbalMemory({ onComplete, level }) {
  const wordList = ['Hund','Sonne','Baum','Buch','Auto','Haus','Vogel','Blume','Mond','Wasser','Berg','See'];
  const n = 4+level*2;
  const [shown] = useState(()=>[...wordList].sort(()=>Math.random()-0.5).slice(0,n));
  const [phase, setPhase] = useState('study');
  const [timeLeft, setTimeLeft] = useState(5+level*2);
  const [tested, setTested] = useState(() => {
    const wrong=[...wordList].sort(()=>Math.random()-0.5).slice(0,n);
    return [...shown,...wrong].sort(()=>Math.random()-0.5).slice(0,n+2);
  });
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);

  useEffect(()=>{
    if(phase!=='study') return;
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);setPhase('recall');return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[phase]);

  const handle=(ans)=>{
    const word=tested[idx]; const isShown=shown.includes(word);
    if(ans===isShown) setScore(s=>s+1); else setErrors(e=>e+1);
    const ni=idx+1;
    if(ni>=tested.length){const acc=Math.round((score+(ans===isShown?1:0))/tested.length*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);}
    else setIdx(ni);
  };

  return (
    <div className="space-y-4">
      {phase==='study'?(
        <><p className="text-center text-sm font-bold text-slate-500">Einprägen ({timeLeft}s)</p>
        <div className="grid grid-cols-2 gap-2">{shown.map((w,i)=><div key={i} className="bg-violet-50 rounded-xl p-3 text-center font-bold text-violet-700">{w}</div>)}</div></>
      ):(
        <><p className="text-center text-sm font-bold text-slate-500">War "{tested[idx]}" dabei?</p>
        <div className="bg-slate-50 rounded-2xl p-8 text-center text-4xl font-black text-slate-800">{tested[idx]}</div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>handle(true)} className="py-5 rounded-2xl bg-green-500 text-white font-black text-xl active:scale-95">✅ JA</button>
          <button onClick={()=>handle(false)} className="py-5 rounded-2xl bg-red-400 text-white font-black text-xl active:scale-95">❌ NEIN</button>
        </div></>
      )}
    </div>
  );
}

// ─── MATH GAMES ───────────────────────────────────────────────────────────────

export function MentalMath({ onComplete, level }) {
  function genProblem(lvl) {
    const ops=['+','-','×']; const op=ops[Math.floor(Math.random()*Math.min(lvl+1,3))];
    const max=lvl===1?10:lvl===2?20:50;
    const a=Math.floor(Math.random()*max)+2; const b=Math.floor(Math.random()*(a-1))+1;
    const bAdj=op==='×'?Math.min(b,10):b;
    const ans=op==='+'?a+bAdj:op==='-'?a-bAdj:a*bAdj;
    return {text:`${a} ${op} ${bAdj} = ?`,answer:ans,opts:[ans,ans+Math.ceil(Math.random()*5),Math.max(0,ans-Math.ceil(Math.random()*3)),ans+Math.ceil(Math.random()*10)].filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).slice(0,4)};
  }

  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [problem, setProblem] = useState(()=>genProblem(level));
  const total = useRef(0);

  useEffect(()=>{const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[score]);

  const handle=(ans)=>{ total.current++; if(ans===problem.answer) setScore(s=>s+1); else setErrors(e=>e+1); setProblem(genProblem(level)); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-pink-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <div className="bg-pink-50 rounded-2xl p-8 text-center"><div className="text-4xl font-black text-slate-800">{problem.text}</div></div>
      <div className="grid grid-cols-2 gap-3">{problem.opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-black text-slate-700 text-xl hover:border-pink-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function NumberMemory({ onComplete, level }) {
  const len = 3+level;
  const [num] = useState(()=>Array.from({length:len},()=>Math.floor(Math.random()*10)).join(''));
  const [phase, setPhase] = useState('show');
  const [timeLeft, setTimeLeft] = useState(2+level);
  const [input, setInput] = useState('');

  useEffect(()=>{
    if(phase!=='show') return;
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);setPhase('recall');return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[phase]);

  const handle=()=>{ const score=input===num?100:Math.max(0,Math.round((input.split('').filter((c,i)=>c===num[i]).length/len)*100)); onComplete({score,accuracy:score,reaction_time_ms:500}); };

  return (
    <div className="space-y-4">
      {phase==='show'?(<><p className="text-center text-sm font-bold text-slate-500">Einprägen ({timeLeft}s)</p><div className="bg-pink-50 rounded-2xl p-10 text-center"><div className="text-5xl font-black text-pink-600 tracking-widest">{num}</div></div></>):(
        <><p className="text-center text-sm font-bold text-slate-500">Zahlenfolge eingeben:</p>
        <input value={input} onChange={e=>setInput(e.target.value.replace(/\D/g,'').slice(0,len))} onKeyDown={e=>e.key==='Enter'&&handle()}
          className="w-full rounded-2xl border-2 border-pink-200 px-4 py-4 font-black text-3xl text-center focus:outline-none focus:border-pink-400 tracking-widest"
          placeholder={'_'.repeat(len)} maxLength={len} autoFocus />
        <button onClick={handle} className="w-full py-4 rounded-2xl bg-pink-500 text-white font-black text-lg active:scale-95">✓ Bestätigen</button></>
      )}
    </div>
  );
}

export function EstimationGame({ onComplete, level }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const total = 4+level;
  const genN=()=>Math.floor(Math.random()*(20*level+10))+5;
  const [current, setCurrent] = useState(()=>genN());

  const genOpts=(n)=>[n,n+Math.ceil(n*0.3),Math.max(1,n-Math.ceil(n*0.25)),n+Math.ceil(n*0.5)].filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).slice(0,4);
  const [opts, setOpts] = useState(()=>genOpts(current));

  const handle=(ans)=>{
    const diff=Math.abs(ans-current)/current; if(diff<0.15) setScore(s=>s+1);
    const nr=round+1;
    if(nr>=total){const acc=Math.round((score+(diff<0.15?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}
    else{const n=genN();setCurrent(n);setOpts(genOpts(n));setRound(nr);}
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{round+1}/{total} • Wie viele Punkte?</div>
      <div className="bg-pink-50 rounded-2xl p-4 flex flex-wrap gap-1 justify-center" style={{minHeight:100}}>
        {Array.from({length:current},(_,i)=><div key={i} className="w-3 h-3 rounded-full bg-pink-500" />)}
      </div>
      <div className="grid grid-cols-2 gap-3">{opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-black text-xl hover:border-pink-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function MathBlitz({ onComplete, level }) {
  return <MentalMath onComplete={onComplete} level={level} />;
}

export function MissingNumber({ onComplete, level }) {
  function genEq(lvl) {
    const max=lvl===1?10:lvl===2?20:50;
    const a=Math.floor(Math.random()*max)+2; const b=Math.floor(Math.random()*max)+2; const res=a+b;
    const type=Math.floor(Math.random()*3);
    if(type===0) return {text:`? + ${b} = ${res}`,answer:a,opts:[a,a+3,Math.max(1,a-2),a+7].sort(()=>Math.random()-0.5).slice(0,4)};
    if(type===1) return {text:`${a} + ? = ${res}`,answer:b,opts:[b,b+4,Math.max(1,b-1),b+8].sort(()=>Math.random()-0.5).slice(0,4)};
    return {text:`${a} + ${b} = ?`,answer:res,opts:[res,res+3,Math.max(0,res-2),res+5].sort(()=>Math.random()-0.5).slice(0,4)};
  }

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [eq, setEq] = useState(()=>genEq(level));
  const total = 4+level;

  const handle=(ans)=>{ const correct=ans===eq.answer; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),200);}else{setIdx(ni);setEq(genEq(level));} };

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total}</div>
      <div className="bg-pink-50 rounded-2xl p-8 text-center"><div className="text-4xl font-black text-slate-800">{eq.text}</div></div>
      <div className="grid grid-cols-2 gap-3">{eq.opts.map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-black text-xl hover:border-pink-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function FractionFight({ onComplete, level }) {
  const fractions = [
    {a:'1/2',b:'1/3',aVal:0.5,bVal:0.333},{a:'3/4',b:'2/3',aVal:0.75,bVal:0.667},
    {a:'1/4',b:'1/3',aVal:0.25,bVal:0.333},{a:'5/6',b:'7/8',aVal:0.833,bVal:0.875},
    {a:'2/5',b:'3/7',aVal:0.4,bVal:0.429},{a:'3/8',b:'2/5',aVal:0.375,bVal:0.4},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, fractions.length);
  const shuffled = useRef([...fractions].sort(()=>Math.random()-0.5));

  const handle=(bigger)=>{ const f=shuffled.current[idx]; const correct=bigger?(f.aVal>f.bVal):(f.bVal>f.aVal); if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),200);}else setIdx(ni); };
  const f=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Welche ist größer?</div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={()=>handle(true)} className="bg-pink-50 rounded-2xl p-8 text-center font-black text-4xl text-pink-600 border-2 border-pink-200 hover:bg-pink-100 active:scale-95">{f.a}</button>
        <button onClick={()=>handle(false)} className="bg-indigo-50 rounded-2xl p-8 text-center font-black text-4xl text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-100 active:scale-95">{f.b}</button>
      </div>
    </div>
  );
}

export function MathPatterns({ onComplete, level }) {
  const patterns = [
    {seq:'2, 4, 8, 16, ?',answer:32,opts:[32,24,20,64]},{seq:'100, 90, 80, 70, ?',answer:60,opts:[60,50,65,55]},
    {seq:'1, 3, 6, 10, ?',answer:15,opts:[15,13,14,16]},{seq:'5, 10, 20, 40, ?',answer:80,opts:[80,60,100,70]},
    {seq:'1, 4, 9, 16, 25, ?',answer:36,opts:[36,30,35,49]},{seq:'3, 6, 12, 24, ?',answer:48,opts:[48,36,60,42]},
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const total = Math.min(3+level, patterns.length);
  const shuffled = useRef([...patterns].sort(()=>Math.random()-0.5));

  const handle=(ans)=>{ const p=shuffled.current[idx]; const correct=ans===p.answer; if(correct) setScore(s=>s+1); const ni=idx+1; if(ni>=total){const acc=Math.round((score+(correct?1:0))/total*100);setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),200);}else setIdx(ni); };
  const p=shuffled.current[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-600 text-center">{idx+1}/{total} • Zahlen-Muster!</div>
      <div className="bg-pink-50 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-slate-800">{p.seq}</div></div>
      <div className="grid grid-cols-2 gap-3">{[...p.opts].sort(()=>Math.random()-0.5).map((o,i)=><button key={i} onClick={()=>handle(o)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-black text-xl hover:border-pink-400 active:scale-95">{o}</button>)}</div>
    </div>
  );
}

export function SpeedArithmetic({ onComplete, level }) {
  return <MentalMath onComplete={onComplete} level={level} />;
}