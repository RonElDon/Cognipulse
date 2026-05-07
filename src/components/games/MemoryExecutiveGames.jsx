import { useState, useEffect, useRef, useCallback } from 'react';
import { useKeyboard } from '@/lib/useKeyboard';

// ─── MEMORY GAMES ─────────────────────────────────────────────────────────────

export function MemoryMatch({ onComplete, level }) {
  const pairs = 4 + level * 2;
  const emojis = ['🍎','🌟','🎸','🐬','🌈','🎯','🦁','🌸','🎲','🚀','🍕','🎭','🦋','🌙','🔮','⚡','🎪','🦊'];
  const [cardState, setCardState] = useState(() => {
    const sel = emojis.slice(0, pairs);
    return [...sel,...sel].sort(()=>Math.random()-0.5).map((e,i)=>({ id:i, emoji:e, flipped:false, matched:false }));
  });
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchCount, setMatchCount] = useState(0);

  const handleFlip = (card) => {
    if (flipped.length === 2 || card.flipped || card.matched) return;
    const newF = [...flipped, card.id];
    setCardState(c => c.map(cc => cc.id === card.id ? {...cc,flipped:true} : cc));
    if (newF.length === 2) {
      setMoves(m => m + 1);
      const [a,b] = newF.map(id => cardState.find(c => c.id === id));
      if (a?.emoji === b?.emoji) {
        setCardState(c => c.map(cc => newF.includes(cc.id) ? {...cc,matched:true} : cc));
        setMatchCount(m => { const nm=m+1; if(nm===pairs){ const acc=Math.max(0,100-Math.max(0,moves-pairs)*8); setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),500); } return nm; });
        setFlipped([]);
      } else {
        setTimeout(()=>{ setCardState(c=>c.map(cc=>newF.includes(cc.id)?{...cc,flipped:false}:cc)); setFlipped([]); },800);
      }
    } else setFlipped(newF);
  };

  const cols = Math.ceil(Math.sqrt(pairs * 2));
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>🎯 {matchCount}/{pairs}</span><span>🔄 {moves} Züge</span></div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cardState.map(card => (
          <button key={card.id} onClick={()=>handleFlip(card)}
            className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-300 ${card.matched?'bg-emerald-100 border-2 border-emerald-400':card.flipped?'bg-indigo-100 border-2 border-indigo-400':'bg-indigo-500 hover:bg-indigo-600 shadow-md hover:scale-105'}`}>
            {(card.flipped||card.matched)?card.emoji:'?'}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SequenceRecall({ onComplete, level }) {
  const [sequence, setSequence] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [phase, setPhase] = useState('show');
  const [showIdx, setShowIdx] = useState(0);
  const [round, setRound] = useState(1);
  const maxRound = 4 + level;
  const colors = [{ bg:'bg-red-400', label:'🔴' },{ bg:'bg-blue-400', label:'🔵' },{ bg:'bg-green-400', label:'🟢' },{ bg:'bg-yellow-400', label:'🟡' }];
  useKeyboard({ '1':()=>phase==='input'&&handleInput(0), '2':()=>phase==='input'&&handleInput(1), '3':()=>phase==='input'&&handleInput(2), '4':()=>phase==='input'&&handleInput(3) }, [phase, userSeq, sequence, round]);

  const startRound = useCallback((seq) => {
    const newSeq = [...seq, Math.floor(Math.random()*4)];
    setSequence(newSeq); setUserSeq([]); setPhase('show'); setShowIdx(0);
    let i = 0;
    const iv = setInterval(() => { i++; if(i>=newSeq.length){clearInterval(iv);setTimeout(()=>setPhase('input'),400);}else setShowIdx(i); }, 800);
  }, []);

  useEffect(() => { startRound([]); }, []);

  const handleInput = (idx) => {
    const newUser = [...userSeq, idx];
    setUserSeq(newUser);
    if (newUser[newUser.length-1] !== sequence[newUser.length-1]) { onComplete({ score: Math.max(10, Math.round(((newUser.length-1)/sequence.length)*100)), accuracy: 60, reaction_time_ms: 500 }); return; }
    if (newUser.length === sequence.length) {
      if (round >= maxRound) { onComplete({ score: 100, accuracy: 100, reaction_time_ms: 400 }); return; }
      setRound(r=>r+1); setTimeout(() => startRound(sequence), 600);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>Runde {round}/{maxRound}</span><span>{phase==='show'?'Einprägen...':'Wiederholen!'}</span></div>
      <div className="flex gap-2 justify-center mb-2">
        {sequence.map((c,i)=><div key={i} className={`w-6 h-6 rounded-full transition-all ${i===showIdx&&phase==='show'?colors[c].bg+' scale-150':'bg-slate-200'}`} />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {colors.map((c,i)=>(
          <button key={i} onClick={()=>phase==='input'&&handleInput(i)}
            className={`${c.bg} ${phase==='input'?'hover:scale-105 active:scale-95':'opacity-60'} text-white rounded-2xl py-10 text-4xl font-black transition-all`}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

export function WordList({ onComplete, level }) {
  const wordPool = ['Apfel','Haus','Baum','Hund','Wasser','Sonne','Buch','Auto','Vogel','Blume','Mond','Berg','See','Gras','Stein','Wolke'];
  const n = 3 + level;
  const [words] = useState(() => wordPool.sort(()=>Math.random()-0.5).slice(0,n));
  const [phase, setPhase] = useState('study');
  const [timeLeft, setTimeLeft] = useState(5+level*2);
  const [options] = useState(() => {
    const wrong = wordPool.filter(w=>!words.includes(w)).sort(()=>Math.random()-0.5).slice(0,n);
    return [...words,...wrong].sort(()=>Math.random()-0.5);
  });
  const [selected, setSelected] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase !== 'study') return;
    const ti = setInterval(() => setTimeLeft(t => { if(t<=1){clearInterval(ti);setPhase('recall');return 0;}return t-1; }),1000);
    return () => clearInterval(ti);
  }, [phase]);

  const handleSelect = (word) => {
    if (done) return;
    const newSel = selected.includes(word)?selected.filter(w=>w!==word):[...selected,word];
    setSelected(newSel);
    if (newSel.length===words.length) { setDone(true); const score=Math.round(newSel.filter(w=>words.includes(w)).length/words.length*100); setTimeout(()=>onComplete({score,accuracy:score,reaction_time_ms:500}),600); }
  };

  return (
    <div className="space-y-4">
      {phase==='study'?(
        <><p className="text-center text-sm font-bold text-slate-500">Einprägen: {timeLeft}s übrig</p><div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-2 gap-3">{words.map((w,i)=><div key={i} className="bg-white rounded-xl p-3 text-center font-bold text-slate-700 border border-slate-200 shadow-sm">{w}</div>)}</div></>
      ):(
        <><p className="text-center text-sm font-bold text-slate-500">Welche {words.length} Wörter hattest du?</p><div className="grid grid-cols-2 gap-2">{options.map((w,i)=><button key={i} onClick={()=>handleSelect(w)} className={`py-3 rounded-xl font-bold text-sm transition-all ${selected.includes(w)?'bg-indigo-500 text-white scale-95':'bg-slate-100 text-slate-700 hover:bg-indigo-100'}`}>{w}</button>)}</div></>
      )}
    </div>
  );
}

export function NBackChallenge({ onComplete, level }) {
  const n = 1 + level;
  const letters = 'ABCDEFGHIJK';
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState('');
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = 15;
  const responded = useRef(false);
  const histRef = useRef([]);
  useKeyboard({ ' ': () => handleMatch(), 'Enter': () => handleMatch() }, [score, errors, round]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (histRef.current.length >= totalRounds) { clearInterval(iv); return; }
      const letter = letters[Math.floor(Math.random()*letters.length)];
      histRef.current = [...histRef.current, letter];
      setHistory([...histRef.current]);
      setCurrent(letter);
      responded.current = false;
      setRound(histRef.current.length);
      const h = histRef.current;
      setTimeout(() => { if(!responded.current){ const nb=h.length>n?h[h.length-1-n]:null; if(nb===letter) setErrors(e=>e+1); } }, 1700);
    }, 2000);
    return () => clearInterval(iv);
  }, [n]);

  useEffect(() => {
    if (round >= totalRounds) { const acc=Math.round((score/(score+errors+0.01))*100); setTimeout(()=>onComplete({score:Math.min(100,acc),accuracy:acc,reaction_time_ms:500}),500); }
  }, [round]);

  const handleMatch = () => {
    responded.current = true;
    const nb = histRef.current.length>n?histRef.current[histRef.current.length-1-n]:null;
    if (nb===current) setScore(s=>s+1); else setErrors(e=>e+1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>{n}-Back</span><span>{round}/{totalRounds}</span><span className="text-green-600">✓ {score}</span></div>
      <p className="text-center text-xs text-slate-400">War der Buchstabe von {n} Schritten zuvor gleich?</p>
      <div className="bg-indigo-50 rounded-2xl p-10 text-center">
        <div className="text-7xl font-black text-indigo-600">{current}</div>
        <div className="flex gap-2 justify-center mt-3">{history.slice(-5).map((l,i)=><span key={i} className="text-sm text-slate-400">{l}</span>)}</div>
      </div>
      <button onClick={handleMatch} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 active:scale-95">✓ MATCH! (gleicher wie vor {n})</button>
    </div>
  );
}

export function PositionMemory({ onComplete, level }) {
  const gridSize = 4;
  const numTargets = 2 + level;
  const [targets] = useState(() => { const p=new Set(); while(p.size<numTargets)p.add(Math.floor(Math.random()*gridSize*gridSize)); return [...p]; });
  const [phase, setPhase] = useState('show');
  const [timeLeft, setTimeLeft] = useState(3+level);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (phase!=='show') return;
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);setPhase('recall');return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[phase]);

  const handleSelect=(pos)=>{
    if(phase!=='recall') return;
    const ns=selected.includes(pos)?selected.filter(p=>p!==pos):[...selected,pos];
    setSelected(ns);
    if(ns.length===numTargets){const score=Math.round(ns.filter(p=>targets.includes(p)).length/numTargets*100);setTimeout(()=>onComplete({score,accuracy:score,reaction_time_ms:500}),500);}
  };

  return (
    <div className="space-y-4">
      {phase==='show'?<p className="text-center text-sm font-bold text-slate-500">Merke Positionen! ({timeLeft}s)</p>:<p className="text-center text-sm font-bold text-slate-500">Wo waren ⭐? (Wähle {numTargets})</p>}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({length:gridSize*gridSize},(_,i)=>(
          <button key={i} onClick={()=>handleSelect(i)}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${phase==='show'&&targets.includes(i)?'bg-amber-400 scale-110':phase==='recall'&&selected.includes(i)?'bg-indigo-400':'bg-slate-100 hover:bg-slate-200'}`}>
            {phase==='show'&&targets.includes(i)?'⭐':''}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ColorSequenceSimon({ onComplete, level }) {
  const colors = [
    {id:0,bg:'bg-red-500',active:'bg-red-300',label:'🔴'},
    {id:1,bg:'bg-blue-500',active:'bg-blue-300',label:'🔵'},
    {id:2,bg:'bg-green-500',active:'bg-green-300',label:'🟢'},
    {id:3,bg:'bg-yellow-400',active:'bg-yellow-200',label:'🟡'},
  ];
  useKeyboard({ '1':()=>handleInput(0), '2':()=>handleInput(1), '3':()=>handleInput(2), '4':()=>handleInput(3) }, [phase, userInput, seq, round]);
  const [seq, setSeq] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [phase, setPhase] = useState('show');
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(0);
  const maxRound = 3+level*2;

  const playSequence = useCallback((s)=>{
    setPhase('show'); let i=0;
    const show=()=>{ if(i>=s.length){setTimeout(()=>setPhase('input'),400);return;} setActiveColor(s[i]); setTimeout(()=>{setActiveColor(null);setTimeout(()=>{i++;show();},200);},600); };
    setTimeout(show,500);
  },[]);

  const addAndPlay = useCallback((prev)=>{
    const ns=[...prev,Math.floor(Math.random()*4)];
    setSeq(ns);setUserInput([]);setRound(r=>r+1);playSequence(ns);
  },[playSequence]);

  useEffect(()=>{addAndPlay([]);},[]);

  const handleInput=(id)=>{
    if(phase!=='input') return;
    const ni=[...userInput,id]; setUserInput(ni);
    if(ni[ni.length-1]!==seq[ni.length-1]){onComplete({score:Math.max(10,Math.round((round/maxRound)*100)),accuracy:70,reaction_time_ms:400});return;}
    if(ni.length===seq.length){if(round>=maxRound){onComplete({score:100,accuracy:100,reaction_time_ms:400});return;}setTimeout(()=>addAndPlay(seq),600);}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>Runde {round}/{maxRound}</span><span>{phase==='show'?'Aufpassen!':'Wiederholen!'}</span></div>
      <div className="grid grid-cols-2 gap-3">
        {colors.map(c=>(
          <button key={c.id} onClick={()=>handleInput(c.id)}
            className={`${activeColor===c.id?c.active:c.bg} rounded-2xl h-28 text-5xl transition-all ${phase==='input'?'hover:scale-105 active:scale-95':'opacity-70'}`}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

export function StoryRecall({ onComplete, level }) {
  const stories = [
    {text:'Lisa kauft am Montag 3 rote Äpfel und 2 blaue Bücher.',questions:[{q:'Was kauft Lisa?',options:['Äpfel & Bücher','Orangen & Hefte','Birnen'],correct:0},{q:'Wann kauft Lisa?',options:['Dienstag','Montag','Freitag'],correct:1},{q:'Wie viele Äpfel?',options:['2','4','3'],correct:2}]},
    {text:'Tom fährt mit dem roten Auto nach Berlin. Er nimmt seinen Hund Max mit.',questions:[{q:'Wohin fährt Tom?',options:['Hamburg','Berlin','München'],correct:1},{q:'Was nimmt er mit?',options:['Katze','Hund','Vogel'],correct:1},{q:'Autofarbe?',options:['Blau','Grün','Rot'],correct:2}]},
  ];
  const story = stories[Math.floor(Math.random()*stories.length)];
  const [phase, setPhase] = useState('read');
  const [timeLeft, setTimeLeft] = useState(8+level*2);
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  useKeyboard({ '1':()=>phase==='quiz'&&handleAnswer(0), '2':()=>phase==='quiz'&&handleAnswer(1), '3':()=>phase==='quiz'&&handleAnswer(2) }, [phase, qIdx, correct]);

  useEffect(()=>{
    if(phase!=='read') return;
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);setPhase('quiz');return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[phase]);

  const handleAnswer=(i)=>{
    const isC=i===story.questions[qIdx].correct; const nc=correct+(isC?1:0);
    if(qIdx+1>=story.questions.length){onComplete({score:Math.round(nc/story.questions.length*100),accuracy:Math.round(nc/story.questions.length*100),reaction_time_ms:500});}
    else{setCorrect(nc);setQIdx(q=>q+1);}
  };

  const q=story.questions[qIdx];
  return (
    <div className="space-y-4">
      {phase==='read'?(<><p className="text-center text-sm font-bold text-slate-500">Einprägen ({timeLeft}s)</p><div className="bg-indigo-50 rounded-2xl p-6 text-center"><p className="text-base font-semibold text-slate-800 leading-relaxed">{story.text}</p></div></>):(
        <><p className="text-center text-sm font-bold text-slate-500">Frage {qIdx+1}/{story.questions.length}</p><div className="bg-slate-50 rounded-2xl p-4 text-center font-bold text-slate-800">{q.q}</div><div className="space-y-2">{q.options.map((opt,i)=><button key={i} onClick={()=>handleAnswer(i)} className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 font-semibold text-slate-700 hover:border-indigo-400 active:scale-95">{opt}</button>)}</div></>
      )}
    </div>
  );
}

export function FaceName({ onComplete, level }) {
  const people = [{name:'Anna',emoji:'👩',color:'bg-pink-100'},{name:'Max',emoji:'👨',color:'bg-blue-100'},{name:'Sofia',emoji:'👩‍🦱',color:'bg-purple-100'},{name:'Leon',emoji:'👦',color:'bg-green-100'},{name:'Emma',emoji:'👧',color:'bg-yellow-100'},{name:'Lukas',emoji:'🧑',color:'bg-orange-100'}];
  const n = 2+level;
  const [targets] = useState(()=>people.slice(0,n));
  const [phase, setPhase] = useState('study');
  const [timeLeft, setTimeLeft] = useState(5+level*2);
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [questions] = useState(()=>targets.map(t=>({face:t.emoji,correct:t.name,options:people.sort(()=>Math.random()-0.5).slice(0,4).map(p=>p.name).includes(t.name)?people.sort(()=>Math.random()-0.5).slice(0,4).map(p=>p.name):[...people.filter(p=>p.name!==t.name).sort(()=>Math.random()-0.5).slice(0,3).map(p=>p.name),t.name].sort(()=>Math.random()-0.5)})));

  useEffect(()=>{if(phase!=='study')return;const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);setPhase('quiz');return 0;}return t-1;}),1000);return()=>clearInterval(ti);},[phase]);

  const handleAnswer=(name)=>{
    const isC=name===questions[qIdx].correct; const nc=correct+(isC?1:0);
    if(qIdx+1>=targets.length){onComplete({score:Math.round(nc/targets.length*100),accuracy:Math.round(nc/targets.length*100),reaction_time_ms:500});}
    else{setCorrect(nc);setQIdx(q=>q+1);}
  };

  return (
    <div className="space-y-4">
      {phase==='study'?(<><p className="text-center text-sm font-bold text-slate-500">Namen merken ({timeLeft}s)</p><div className="grid grid-cols-2 gap-3">{targets.map((p,i)=><div key={i} className={`${p.color} rounded-2xl p-4 text-center`}><div className="text-5xl mb-2">{p.emoji}</div><div className="font-black text-slate-800">{p.name}</div></div>)}</div></>):(
        <><p className="text-center text-sm font-bold text-slate-500">{qIdx+1}/{targets.length}: Wer ist das?</p><div className="text-center text-8xl py-4">{questions[qIdx].face}</div><div className="grid grid-cols-2 gap-2">{questions[qIdx].options.map((name,i)=><button key={i} onClick={()=>handleAnswer(name)} className="py-3 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-indigo-400 active:scale-95">{name}</button>)}</div></>
      )}
    </div>
  );
}

// ─── EXECUTIVE GAMES ──────────────────────────────────────────────────────────

export function TaskSwitch({ onComplete, level }) {
  const rules = ['Farbe', 'Form'];
  const shapes = ['🔺','🔷','⬛','🔴','🟦','🟨'];
  const colorNames = ['rot','blau','gelb','grün'];
  const [rule, setRule] = useState('Farbe');
  const [item, setItem] = useState({ shape:'🔺', color:'rot' });
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const total = useRef(0);
  // keyboard added after options is computed below

  const nextItem = () => {
    setRule(rules[Math.floor(Math.random()*2)]);
    setItem({ shape:shapes[Math.floor(Math.random()*6)], color:colorNames[Math.floor(Math.random()*4)] });
  };

  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:500}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[score]);

  const handleAnswer=(answer)=>{
    total.current++;
    const correct=rule==='Farbe'?answer===item.color:answer===item.shape;
    if(correct) setScore(s=>s+1); else setErrors(e=>e+1);
    nextItem();
  };

  const options=rule==='Farbe'?colorNames.map(c=>({label:c,value:c})):shapes.slice(0,4).map(s=>({label:s,value:s}));
  useKeyboard({ '1':()=>handleAnswer(options[0]?.value), '2':()=>handleAnswer(options[1]?.value), '3':()=>handleAnswer(options[2]?.value), '4':()=>handleAnswer(options[3]?.value) }, [rule, item, score]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-emerald-600">Regel: {rule}</span><span className="text-green-600">✓ {score}</span></div>
      <div className="bg-slate-50 rounded-2xl p-5 text-center">
        <p className="text-xs text-slate-400 mb-2">Sortiere nach: <strong>{rule}</strong></p>
        <div className="text-6xl mb-2">{item.shape}</div><p className="text-sm text-slate-600">Farbe: {item.color}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">{options.map((o,i)=><button key={i} onClick={()=>handleAnswer(o.value)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-emerald-400 active:scale-95 text-lg">{o.label}</button>)}</div>
    </div>
  );
}

export function StopSignal({ onComplete, level }) {
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [round, setRound] = useState(0);
  const total = 12;
  const isStop = useRef(false);
  const responded = useRef(false);
  const roundRef = useRef(0);
  useKeyboard({ ' ': () => handleTap(), 'Enter': () => handleTap() }, [score, errors, round]);

  const nextRound = useCallback(() => {
    if (roundRef.current >= total) return;
    const stop = Math.random() < 0.3;
    isStop.current = stop; responded.current = false;
    setCurrent(stop ? '🔴' : '🟢'); roundRef.current++;
    setRound(roundRef.current);
    setTimeout(() => {
      if (!responded.current) { if (!stop) setErrors(e=>e+1); else setScore(s=>s+1); }
      setCurrent(null);
      setTimeout(() => { if (roundRef.current < total) nextRound(); }, 300);
    }, Math.max(900 - level * 80, 500));
  }, [level]);

  useEffect(() => { setTimeout(nextRound, 500); }, []);
  useEffect(() => { if (round >= total) { const acc=Math.round((score/(score+errors+0.01))*100); setTimeout(()=>onComplete({score:Math.min(100,acc),accuracy:acc,reaction_time_ms:400}),600); } }, [round, score, errors]);

  const handleTap = () => {
    if (!current) return; responded.current = true;
    if (!isStop.current) setScore(s => s + 1); else setErrors(e => e + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>{round}/{total}</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <p className="text-center text-xs text-slate-400 font-bold">Bei 🟢 tippen — bei 🔴 STOPP!</p>
      <button onClick={handleTap} className={`w-full h-56 rounded-3xl flex items-center justify-center text-9xl transition-all duration-150 ${current==='🟢'?'bg-green-200':current==='🔴'?'bg-red-200':'bg-slate-100'}`}>{current || '⏳'}</button>
    </div>
  );
}

export function StroopChallenge({ onComplete, level }) {
  const colorMap = { rot:'#ef4444', blau:'#3b82f6', gelb:'#eab308', grün:'#22c55e' };
  const colorNames = Object.keys(colorMap);
  const [item, setItem] = useState(() => ({ word:colorNames[0], inkColor:colorNames[1] }));
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const total = useRef(0);
  useKeyboard({ '1':()=>handleAnswer(colorNames[0]), '2':()=>handleAnswer(colorNames[1]), '3':()=>handleAnswer(colorNames[2]), '4':()=>handleAnswer(colorNames[3]) }, [item, score]);

  const nextItem = () => setItem({ word:colorNames[Math.floor(Math.random()*4)], inkColor:colorNames[Math.floor(Math.random()*4)] });
  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[score]);

  const handleAnswer=(ans)=>{ total.current++; if(ans===item.inkColor) setScore(s=>s+1); else setErrors(e=>e+1); nextItem(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {errors}</span></div>
      <p className="text-center text-xs text-slate-400">Wähle die TINTENFARBE (nicht das Wort)!</p>
      <div className="bg-slate-50 rounded-2xl p-8 text-center"><div className="text-5xl font-black" style={{color:colorMap[item.inkColor]}}>{item.word}</div></div>
      <div className="grid grid-cols-2 gap-2">{colorNames.map(c=><button key={c} onClick={()=>handleAnswer(c)} className="py-4 rounded-xl font-black text-white text-lg active:scale-95" style={{backgroundColor:colorMap[c]}}>{c}</button>)}</div>
    </div>
  );
}

export function RuleShift({ onComplete, level }) {
  const rules = ['Farbe','Größe','Form'];
  const [ruleIdx, setRuleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [item, setItem] = useState({size:'groß',color:'rot',shape:'Kreis'});
  const total = useRef(0); const counter = useRef(0);
  useKeyboard({ '1':()=>handleAnswer(getOptions()[0]?.val), '2':()=>handleAnswer(getOptions()[1]?.val) }, [ruleIdx, item, score]);

  const nextItem=()=>{ counter.current++; if(counter.current%4===0) setRuleIdx(r=>(r+1)%rules.length); setItem({size:['groß','klein'][Math.floor(Math.random()*2)],color:['rot','blau'][Math.floor(Math.random()*2)],shape:['Kreis','Quadrat'][Math.floor(Math.random()*2)]}); };

  useEffect(()=>{
    const ti=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(ti);const acc=total.current>0?Math.round(score/total.current*100):0;setTimeout(()=>onComplete({score:acc,accuracy:acc,reaction_time_ms:400}),300);return 0;}return t-1;}),1000);
    return()=>clearInterval(ti);
  },[score]);

  const getCorrect=()=>rules[ruleIdx]==='Farbe'?item.color:rules[ruleIdx]==='Größe'?item.size:item.shape;
  const getOptions=()=>{ if(rules[ruleIdx]==='Farbe')return [{label:'🔴 Rot',val:'rot'},{label:'🔵 Blau',val:'blau'}]; if(rules[ruleIdx]==='Größe')return [{label:'🔼 Groß',val:'groß'},{label:'🔽 Klein',val:'klein'}]; return [{label:'⭕ Kreis',val:'Kreis'},{label:'⬛ Quadrat',val:'Quadrat'}]; };

  const handleAnswer=(ans)=>{ total.current++; if(ans===getCorrect()) setScore(s=>s+1); else setErrors(e=>e+1); nextItem(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-emerald-600">Regel: {rules[ruleIdx]}</span><span className="text-green-600">✓ {score}</span></div>
      <div className="bg-slate-50 rounded-2xl p-6 text-center"><p className="text-sm text-slate-400 mb-3">Sortiere nach: <strong>{rules[ruleIdx]}</strong></p><div className="text-3xl font-bold">{item.color} {item.size} {item.shape}</div></div>
      <div className="grid grid-cols-2 gap-3">{getOptions().map((o,i)=><button key={i} onClick={()=>handleAnswer(o.val)} className="py-4 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:border-emerald-400 active:scale-95 text-lg">{o.label}</button>)}</div>
    </div>
  );
}