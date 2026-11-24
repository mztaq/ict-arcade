import React,{useEffect,useMemo,useState} from "react";
import {ArrowRight,ArrowLeft,BookOpen,Check,CheckCircle2,ChevronDown,ChevronRight,ClipboardList,Gamepad2,GraduationCap,Grid2X2,Home,Layers,Menu, Moon,Search,Sun,Target,Bookmark,BookmarkCheck,RotateCcw,Shuffle,Info,X,Lightbulb,ListChecks,ExternalLink,Eye,EyeOff,Play,Star,CalendarCheck,PenLine} from "lucide-react";
import {chapters,allLessons,flashcards} from "./content";
import {questions,writtenQuestions} from "./questions";

const safeRead=(key,fallback)=>{try {const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value;}catch{return fallback;}};
const saved=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
function useStored(key,defaultValue){const [value,setValue]=useState(()=>safeRead(key,defaultValue));useEffect(()=>saved(key,value),[key,value]);return [value,setValue];}
const routeFromHash=()=>{const parts=(window.location.hash||"#/").slice(2).split("/");return {page:parts[0]||"home",chapter:Number(parts[1])||1,lesson:Number(parts[2])||0};};
const go=(page,chapter,lesson)=>{window.location.hash="/"+page+(chapter?"/"+chapter:"")+(lesson!==undefined?"/"+lesson:"");window.scrollTo({top:0,behavior:"smooth"});};
const numbered=(n)=>String(n).padStart(2,"0");
const topicColor=(id)=>["#6a78f9","#00a6a1","#ef9c44","#ab79e7","#4e9cce"][id%5];
const categoryIcon=(id)=>[BookOpen,Layers,ClipboardList,Target,Grid2X2][id%5];

function ProgressBar({value=0}){return <div className="progress-track"><span style={{width:Math.min(100,Math.max(0,value))+"%"}}/></div>}
function PanelTitle({eyebrow,title,subtitle,action}){return <div className="panel-heading"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle&&<p className="muted intro-text">{subtitle}</p>}</div>{action&&<div>{action}</div>}</div>}
function App(){
 const [route,setRoute]=useState(routeFromHash);
 const [theme,setTheme]=useStored("ict-arcade-theme","auto");
 const [done,setDone]=useStored("ict-arcade-lessons-done",[]);
 const [bookmarked,setBookmarked]=useStored("ict-arcade-bookmarks",[]);
 const [mastered,setMastered]=useStored("ict-arcade-mastered",[]);
 const [showMenu,setShowMenu]=useState(false);
 const [query,setQuery]=useState("");
 const [group,setGroup]=useState("All");
 const [quizGroup,setQuizGroup]=useState(0);
 const [quizIndex,setQuizIndex]=useState(0);
 const [answer,setAnswer]=useState(null);
 const [written,setWritten]=useState(0);
 const [showPoints,setShowPoints]=useState(false);
 const [flashIndex,setFlashIndex]=useState(0);
 const [flipped,setFlipped]=useState(false);
 const [flashTopic,setFlashTopic]=useState(0);
 useEffect(()=>{const f=()=>{setRoute(routeFromHash());setShowMenu(false)};window.addEventListener("hashchange",f);return()=>window.removeEventListener("hashchange",f)},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;},[theme]);
 const chapter=chapters.find(c=>c.id===route.chapter)||chapters[0];
 const lesson=chapter.lessons[Math.min(route.lesson,chapter.lessons.length-1)]||chapter.lessons[0];
 const lessonKey=(id,index)=>id+"-"+index;
 const completedCount=done.filter(k=>allLessons.some(l=>lessonKey(l.chapterId,l.index)===k)).length;
 const completion=Math.round(completedCount/allLessons.length*100);
 const chapterCompletion=(ch)=>Math.round(ch.lessons.filter((l,i)=>done.includes(lessonKey(ch.id,i))).length/ch.lessons.length*100);
 const filtered=useMemo(()=>chapters.filter(ch=>(group==="All"||ch.unit===group)&&(!query||[ch.title,ch.description,...ch.lessons.flatMap(l=>[l.title,...l.points,...l.terms.map(t=>t[0])])].join(" ").toLowerCase().includes(query.toLowerCase()))),[query,group]);
 const quizItems=useMemo(()=>quizGroup?questions.filter(q=>q.chapterId===quizGroup):questions,[quizGroup]);
 const currentQ=quizItems[quizIndex%quizItems.length];
 const shuffled=useMemo(()=>{if(!currentQ)return [];const a=currentQ.answers.map((v,i)=>({v,i}));let seed=(currentQ.question.length*7919+quizIndex*97)>>>0;for(let i=a.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a;},[currentQ,quizIndex]);
 const cardPool=flashcards.filter(f=>!flashTopic||f.chapterId===flashTopic);
 const flash=cardPool[flashIndex%Math.max(cardPool.length,1)];
 const writtenQ=writtenQuestions[written%writtenQuestions.length];
 const mark=()=>{const key=lessonKey(chapter.id,route.lesson);setDone(prev=>prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);};
 const toggleBookmark=()=>{const key=lessonKey(chapter.id,route.lesson);setBookmarked(prev=>prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);};
 const selectQuestionGroup=id=>{setQuizGroup(id);setQuizIndex(0);setAnswer(null);};
 const nextQuestion=()=>{setAnswer(null);setQuizIndex(i=>i+1)};
 const nextCard=()=>{setFlipped(false);setFlashIndex(i=>i+1)};
 const nav=[{page:"home",label:"Overview",icon:Home},{page:"notes",label:"Revision notes",icon:BookOpen},{page:"practice",label:"Practice questions",icon:ClipboardList},{page:"flashcards",label:"Flashcards",icon:Layers},{page:"games",label:"Arcade games",icon:Gamepad2}];
 const highlight=(name)=>route.page===name||route.page==="chapter"&&name==="notes";
 return <div className="shell">
  <aside className={"sidebar "+(showMenu?"visible":"")}>
   <button className="brand" onClick={()=>go("home")} aria-label="ICT Arcade home"><span className="brand-icon"><Grid2X2 size={22} strokeWidth={2.6}/></span><span>ICT<span className="brand-accent">Arcade</span><small>IGCSE revision</small></span></button>
   <div className="nav-label">YOUR WORKSPACE</div>
   <nav className="primary-nav" aria-label="Main navigation">{nav.map(({page,label,icon:Icon})=><button key={page} className={"nav-button "+(highlight(page)?"active":"")} onClick={()=>go(page)}><Icon size={19}/><span>{label}</span>{page==="games"&&<span className="nav-pill">10</span>}</button>)}</nav>
   <div className="sidebar-spacer"/>
   <div className="sidebar-progress"><div className="sidebar-progress-top"><GraduationCap size={20}/><span>Your learning</span></div><strong>{completion}% complete</strong><ProgressBar value={completion}/><p>{completedCount} of {allLessons.length} lessons completed</p></div>
   <div className="theme-row"><span>Appearance</span><button className="theme-button" title="Switch appearance" onClick={()=>setTheme(v=>v==="auto"?"light":v==="light"?"dark":"auto")}>{theme==="light"?<Sun size={16}/>:theme==="dark"?<Moon size={16}/>:<Sun size={16}/>}<span>{theme==="auto"?"System":theme==="light"?"Light":"Dark"}</span></button></div>
  </aside>
  {showMenu&&<button className="menu-shade" onClick={()=>setShowMenu(false)} aria-label="Close navigation"/>}
  <div className="app-column">
   <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={()=>setShowMenu(true)}><Menu size={22}/></button><span className="breadcrumbs">ICT Arcade <ChevronRight size={14}/> {route.page==="home"?"Overview":route.page==="chapter"?chapter.title:nav.find(n=>n.page===route.page)?.label||"Revision"}</span><div className="topbar-right"><span className="course-pill"><span className="live-dot"/>Cambridge IGCSE ICT</span><button className="icon-button theme-mini" aria-label="Change appearance" onClick={()=>setTheme(v=>v==="auto"?"light":v==="light"?"dark":"auto")}>{theme==="dark"?<Moon size={19}/>:<Sun size={19}/>}</button></div></header>
   <main className={"main "+(route.page==="games"?"wide":"")}>
   {route.page==="home"&&<>
    <section className="hero"><div className="hero-content"><span className="hero-eyebrow"><span className="sparkle">✦</span> YOUR ICT REVISION SPACE</span><h1>Learn it. Practise it.<br/><span>Play your way.</span></h1><p>Clear revision notes, real examples and games that turn ICT practice into something worth coming back to.</p><div className="hero-actions"><button className="button button-white" onClick={()=>go("notes")}>Start revising <ArrowRight size={18}/></button><button className="button button-ghost" onClick={()=>go("games")}><Gamepad2 size={18}/> Explore games</button></div></div><div className="hero-illustration" aria-hidden="true"><div className="float-card float-one"><BookOpen size={25}/><span>Study</span></div><div className="float-card float-two"><Check size={25}/><span>Revise</span></div><div className="arcade-symbol"><Gamepad2 size={100} strokeWidth={1.5}/></div><div className="float-card float-three"><Star size={23}/><span>Play</span></div></div></section>
    <div className="stats-grid"><div className="stat"><div className="stat-icon purple"><BookOpen size={21}/></div><div><strong>21</strong><span>Course chapters</span></div></div><div className="stat"><div className="stat-icon blue"><Layers size={21}/></div><div><strong>{allLessons.length}</strong><span>Revision lessons</span></div></div><div className="stat"><div className="stat-icon peach"><Target size={21}/></div><div><strong>{questions.length}+</strong><span>Practice questions</span></div></div><div className="stat"><div className="stat-icon teal"><Gamepad2 size={21}/></div><div><strong>10</strong><span>Arcade games</span></div></div></div>
    <div className="section-head"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Start with a topic</h2></div><button className="text-action" onClick={()=>go("notes")}>View all topics <ArrowRight size={16}/></button></div>
    <div className="topic-grid">{chapters.slice(0,6).map(ch=>{const Icon=categoryIcon(ch.id);return <button className="topic-card" key={ch.id} onClick={()=>go("chapter",ch.id,0)}><div className="topic-icon" style={{color:topicColor(ch.id),background:topicColor(ch.id)+"17"}}><Icon size={23}/></div><div className="topic-top"><span>CHAPTER {numbered(ch.id)}</span><ChevronRight size={17}/></div><strong>{ch.title}</strong><p>{ch.description}</p><div className="topic-bottom"><span>{ch.lessons.length} lessons</span><span>{chapterCompletion(ch)}%</span></div><ProgressBar value={chapterCompletion(ch)}/></button>})}</div>
    <section className="promo-row"><div className="promo-card"><div className="promo-icon"><ClipboardList size={25}/></div><div><h3>Ready to test yourself?</h3><p>Try topic-based questions with instant feedback and answer explanations.</p><button className="text-action" onClick={()=>go("practice")}>Try a practice quiz <ArrowRight size={16}/></button></div></div><div className="promo-card"><div className="promo-icon gold"><Gamepad2 size={25}/></div><div><h3>Take a study break</h3><p>Play the original ICT Arcade games and earn points by answering questions.</p><button className="text-action" onClick={()=>go("games")}>Go to the arcade <ArrowRight size={16}/></button></div></div></section>
   </>}
   {route.page==="notes"&&<>
    <PanelTitle eyebrow="THE COMPLETE COURSE" title="Revision notes" subtitle="21 chapters. Clear explanations, worked scenarios and key terms. Find exactly what you need to revise."/>
    <div className="notes-toolbar"><label className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search chapters, concepts, definitions…" aria-label="Search revision notes"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X size={16}/></button>}</label><div className="segmented">{["All","Theory","Practical"].map(x=><button key={x} className={group===x?"selected":""} onClick={()=>setGroup(x)}>{x}</button>)}</div></div>
    <div className="list-summary">{filtered.length} chapters <span>•</span> {filtered.reduce((n,ch)=>n+ch.lessons.length,0)} lessons</div>
    <div className="chapter-grid">{filtered.map(ch=><button className="chapter-card" key={ch.id} onClick={()=>go("chapter",ch.id,0)}><div className="chapter-number">{numbered(ch.id)}</div><div className="chapter-info"><span className="chapter-tag">{ch.unit} · {ch.lessons.length} lessons</span><h3>{ch.title}</h3><p>{ch.description}</p><div className="chapter-progress"><ProgressBar value={chapterCompletion(ch)}/><span>{chapterCompletion(ch)}%</span></div></div><ChevronRight size={20} className="chev"/></button>)}</div>
    {!filtered.length&&<div className="empty">No matching chapters. Try a different search.</div>}
   </>}
   {route.page==="chapter"&&<>
    <button className="back-link" onClick={()=>go("notes")}><ArrowLeft size={17}/> All revision notes</button>
    <div className="lesson-page-title"><span className="chapter-tag">{chapter.unit.toUpperCase()} · CHAPTER {numbered(chapter.id)}</span><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
    <div className="lesson-layout"><div className="lesson-side"><span className="lesson-nav-label">IN THIS CHAPTER</span>{chapter.lessons.map((l,i)=><button className={"lesson-nav-item "+(route.lesson===i?"active":"")} onClick={()=>go("chapter",chapter.id,i)} key={l.title}><span className="lesson-number">{done.includes(lessonKey(chapter.id,i))?<CheckCircle2 size={16}/>:numbered(i+1)}</span><span>{l.title}</span></button>)}<div className="chapter-side-progress"><span>Chapter progress</span><b>{chapterCompletion(chapter)}%</b><ProgressBar value={chapterCompletion(chapter)}/></div></div>
    <article className="lesson-content"><div className="lesson-intro"><span>LESSON {route.lesson+1} OF {chapter.lessons.length}</span><div className="lesson-tools"><button onClick={toggleBookmark} aria-label="Bookmark lesson" title="Bookmark lesson">{bookmarked.includes(lessonKey(chapter.id,route.lesson))?<BookmarkCheck size={20}/>:<Bookmark size={20}/>}</button></div></div><h2>{lesson.title}</h2><p className="lead">The essentials you need to understand, explained in straightforward language.</p><div className="divider-line"/>
    <h3><BookOpen size={20}/> Key concepts</h3><ul className="concept-list">{lesson.points.map((p,i)=><li key={i}><span className="concept-bullet">{i+1}</span><span>{p}</span></li>)}</ul>
    <section className="example-box"><div className="example-heading"><Lightbulb size={20}/> <strong>Real-world example</strong></div><p>{lesson.example}</p></section>
    <section className="tip-box"><div><Star size={19}/><strong>Exam tip</strong></div><p>{lesson.tip}</p></section>
    {lesson.terms.length>0&&<><h3><Layers size={20}/> Key terminology</h3><div className="term-list">{lesson.terms.map(([word,description])=><div key={word}><b>{word}</b><p>{description}</p></div>)}</div></>}
    <div className="lesson-footer"><button className={"button "+(done.includes(lessonKey(chapter.id,route.lesson))?"button-done":"button-primary")} onClick={mark}>{done.includes(lessonKey(chapter.id,route.lesson))?<><CheckCircle2 size={18}/> Marked complete</>:<><Check size={18}/> Mark as complete</>}</button>{route.lesson<chapter.lessons.length-1?<button className="button button-outline" onClick={()=>go("chapter",chapter.id,route.lesson+1)}>Next lesson <ArrowRight size={18}/></button>:<button className="button button-outline" onClick={()=>{selectQuestionGroup(chapter.id);go("practice")}}>Practise this chapter <ArrowRight size={18}/></button>}</div></article></div>
   </>}
   {route.page==="practice"&&<>
    <PanelTitle eyebrow="PUT YOUR KNOWLEDGE TO THE TEST" title="Practice questions" subtitle="Choose a chapter, answer questions, and see why each answer is right or wrong."/>
    <div className="practice-tabs"><button className={showPoints===false?"selected":""} onClick={()=>setShowPoints(false)}><ListChecks size={18}/> Multiple choice</button><button className={showPoints===true?"selected":""} onClick={()=>setShowPoints(true)}><PenLine size={18}/> Written answers</button></div>
    {!showPoints?<><div className="quiz-toolbar"><label>Topic <select aria-label="Choose a chapter" value={quizGroup} onChange={e=>selectQuestionGroup(Number(e.target.value))}><option value={0}>All chapters</option>{chapters.map(ch=><option key={ch.id} value={ch.id}>{ch.id}. {ch.title}</option>)}</select></label><span>{quizIndex%quizItems.length+1} / {quizItems.length} questions</span></div><div className="quiz-card"><div className="quiz-meta"><span>QUESTION {quizIndex%quizItems.length+1}</span><span>{chapters.find(ch=>ch.id===currentQ.chapterId)?.title}</span></div><ProgressBar value={(quizIndex%quizItems.length+1)/quizItems.length*100}/><h2>{currentQ.question}</h2><div className="answers">{shuffled.map(({v,i},k)=><button key={v} disabled={answer!==null} className={"answer-option "+(answer!==null&&i===0?"correct":"")+(answer!==null&&answer===i&&i!==0?" incorrect":"")} onClick={()=>setAnswer(i)}><span className="answer-letter">{String.fromCharCode(65+k)}</span><span>{v}</span>{answer!==null&&i===0&&<CheckCircle2 size={20}/>}</button>)}</div>{answer!==null&&<div className={"feedback "+(answer===0?"positive":"negative")}><strong>{answer===0?"Correct answer!":"Not quite. Here's why."}</strong><p>{currentQ.why}</p><button className="button button-primary" onClick={nextQuestion}>Next question <ArrowRight size={17}/></button></div>}</div></>:<><div className="quiz-toolbar"><label>Practice prompt <select aria-label="Choose written question" value={written} onChange={e=>{setWritten(Number(e.target.value));setAnswer(null)}}>{writtenQuestions.map((q,i)=><option value={i} key={i}>Question {i+1} · Chapter {q.chapterId}</option>)}</select></label><span>{writtenQ.marks} marks</span></div><div className="quiz-card written-card"><div className="quiz-meta"><span>EXAM-STYLE PRACTICE</span><span>Chapter {writtenQ.chapterId} · {writtenQ.marks} marks</span></div><h2>{writtenQ.prompt}</h2><textarea aria-label="Write your answer" placeholder="Write your answer here before viewing the indicative marking points…" rows={7} key={written} /><button className="button button-primary" onClick={()=>setAnswer(v=>v===null?0:null)}>{answer===null?<><Eye size={18}/> Show marking points</>:<><EyeOff size={18}/> Hide marking points</>}</button>{answer!==null&&<div className="mark-points"><h3>Indicative marking points</h3><p>These are original study guidance, not an official exam-board mark scheme.</p><ol>{writtenQ.points.map((p,i)=><li key={i}>{p}</li>)}</ol></div>}</div></>}
   </>}
   {route.page==="flashcards"&&<>
    <PanelTitle eyebrow="QUICK RECALL" title="Flashcards" subtitle="Test your understanding of essential ICT terms. Flip each card, then mark the ones you know."/>
    <div className="quiz-toolbar"><label>Topic <select aria-label="Flashcard topic" value={flashTopic} onChange={e=>{setFlashTopic(Number(e.target.value));setFlashIndex(0);setFlipped(false)}}><option value={0}>All chapters</option>{chapters.map(ch=><option key={ch.id} value={ch.id}>{ch.id}. {ch.title}</option>)}</select></label><span>{(flashIndex%cardPool.length)+1} of {cardPool.length}</span></div>
    {flash&&<><button className={"flash-card "+(flipped?"flipped":"")} onClick={()=>setFlipped(v=>!v)} aria-label={flipped?"Show term":"Show definition"}><span className="flash-label">{flipped?"DEFINITION":"KEY TERM"}</span><strong>{flipped?flash.definition:flash.term}</strong><span className="flash-hint"><RotateCcw size={16}/> Click to flip</span></button><div className="flash-actions"><button className="button button-outline" onClick={nextCard}><Shuffle size={17}/> Next card</button><button className="button button-primary" onClick={()=>{setMastered(prev=>prev.includes(flash.term)?prev:[...prev,flash.term]);nextCard()}}><Check size={17}/> I know this</button></div></>}<div className="flash-overview"><CheckCircle2 size={20}/><span><b>{mastered.length}</b> terms marked as known across the course. Review again whenever you want.</span></div>
   </>}
   {route.page==="games"&&<>
    <PanelTitle eyebrow="THE ORIGINAL ARCADE" title="Learn while you play" subtitle="All original games have been preserved with their controls, quizzes and points system." action={<a className="button button-outline" href="/arcade-legacy.html" target="_blank" rel="noopener noreferrer">Open full screen <ExternalLink size={17}/></a>}/>
    <div className="arcade-notice"><Gamepad2 size={20}/><span>Choose a topic and game below. Your original game scores are kept in this browser.</span></div><iframe title="ICT Arcade original games" src="/arcade-legacy.html" className="arcade-frame" allow="fullscreen" loading="eager"/>
   </>}
   </main>
   <footer className="footer"><span>© {new Date().getFullYear()} ICT Arcade. Made for students, by students.</span><span>Independent Cambridge IGCSE ICT revision resource</span></footer>
  </div>
 </div>;
}
export default App;
