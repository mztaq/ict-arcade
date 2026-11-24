import React, {useEffect, useMemo, useState} from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck,
  Check, CheckCircle2, Eye, EyeOff,
  Layers, FileText, Moon, RotateCcw, Search, Sun, X
} from "lucide-react";
import {chapters, allLessons, flashcards} from "./content.js";
import {questions, writtenQuestions} from "./questions.js";

const load = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
};
function useStored(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
  }, [key, value]);
  return [value, setValue];
}
const getRoute = () => {
  const parts = (location.hash || "#/home").replace(/^#\/?/, "").split("/");
  return {page: parts[0] || "home", id: Number(parts[1]) || 1, lesson: Number(parts[2]) || 0, game: parts[0] === "games" ? (Number(parts[1]) || 0) : 0};
};
const navigate = (page, id, lesson) => {
  const destination = "#/" + page + (id === undefined ? "" : "/" + id) + (lesson === undefined ? "" : "/" + lesson);
  if (location.hash === destination) {
    window.scrollTo({top: 0, behavior: "smooth"});
  } else {
    location.hash = destination;
  }
};
const formatNumber = value => String(value).padStart(2, "0");
const keyFor = (chapterId, lessonIndex) => chapterId + "-" + lessonIndex;
const chapterName = id => chapters.find(ch => ch.id === id)?.title || "ICT";
const chapterProgress = (chapter, done) =>
  Math.round(chapter.lessons.filter((_, i) => done.includes(keyFor(chapter.id, i))).length / chapter.lessons.length * 100);
function Progress({value, label}) {
  return <div className="progress-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
    <span style={{width: Math.max(0, Math.min(value, 100)) + "%"}} />
  </div>;
}
function ChapterRow({chapter, done, compact = false, onOpen}) {
  const progress = chapterProgress(chapter, done);
  return <button className={"chapter-row " + (compact ? "is-compact" : "")} onClick={onOpen}>
    <span className="chapter-index">{formatNumber(chapter.id)}</span>
    <span className="chapter-description">
      <strong>{chapter.title}</strong>
      {!compact && <span className="row-summary">{chapter.description}</span>}
    </span>
    <span className="chapter-status">
      <span>{chapter.lessons.length} lessons · {progress === 100 ? "Complete" : progress === 0 ? "Not started" : progress + "%"}</span>
      <span className="mini-progress"><span style={{width: progress + "%"}} /></span>
    </span>
    <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" />
  </button>;
}
function Title({title, description, action}) {
  return <div className="page-title">
    <div><h1>{title}</h1><p>{description}</p></div>
    {action && <div className="title-action">{action}</div>}
  </div>;
}

const arcadeGames = [
  {id: 1, name: "Pixel Dash", detail: "Run, jump and answer questions."},
  {id: 2, name: "Rune Dungeon", detail: "Solve runes and unlock the next room."},
  {id: 3, name: "Snake", detail: "Collect apples and answer ICT questions."},
  {id: 4, name: "Taxi Rush", detail: "Pick up passengers and answer fare questions."},
  {id: 5, name: "Wing Byte", detail: "Fly through gaps and answer questions."},
  {id: 6, name: "Block Stack", detail: "Clear rows to earn a question."},
  {id: 7, name: "Server Climb", detail: "Climb ladders and avoid rolling bugs."},
  {id: 8, name: "Space Defenders", detail: "Defeat alien waves to earn questions."},
  {id: 9, name: "Brick Breaker", detail: "Break bricks and find question blocks."},
  {id: 10, name: "Dojo Duel", detail: "Fight opponents and earn question combos."},
  {id: 11, name: "Mr. Toner's ICT Superstore", detail: "Pick the correct device for each customer."}
];


function ArcadeVisual({id}) {
  const backgrounds = ["#122D3A","#252D3A","#132F2C","#23303B","#183A48","#242D3D","#203242","#162B3B","#283341","#2E303E","#263A3A"];
  const block=(x,y,w,h,color,extra={})=><rect x={x} y={y} width={w} height={h} fill={color} {...extra}/>;
  return <div className="game-visual" aria-hidden="true">
    <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="320" height="150" fill={backgrounds[id-1] || "#122D3A"}/>
      {id===1&&<>
        {block(0,121,320,29,"#2C5362")}{block(0,121,320,6,"#57BFC2")}
        {block(56,91,70,9,"#2C5362")}{block(190,70,78,9,"#2C5362")}
        {block(210,47,27,25,"#F8C56B")}{<text x="223" y="65" fontSize="17" fontWeight="bold" textAnchor="middle" fill="#25333D">?</text>}
        {block(77,103,19,18,"#FF7659")}{block(82,97,13,7,"#FFB693")}
        {block(278,108,16,13,"#73E1D6")}
        <path d="M148 120l12-17 12 17m7 0l12-17 12 17" stroke="#FF7659" strokeWidth="4" fill="none"/>
      </>}
      {id===2&&<>
        {[0,1,2,3,4,5].map(x=><path key={x} d={"M"+(x*65)+" 0V150"} stroke="#394655" strokeWidth="1"/>)}
        {[0,1,2,3].map(y=><path key={y} d={"M0 "+(y*48)+"H320"} stroke="#394655" strokeWidth="1"/>)}
        <path d="M127 8h67v78h-67z" stroke="#77808B" strokeWidth="8" fill="#182333"/>
        <path d="M143 33l17-17 17 17-17 17z" fill="#F1BF65"/>
        <path d="M147 115l13-21 13 21-13 23z" fill="#5ED0C7"/>
        <circle cx="66" cy="72" r="15" stroke="#E68C69" strokeWidth="4" fill="#362D37"/>
        <circle cx="258" cy="78" r="15" stroke="#E68C69" strokeWidth="4" fill="#362D37"/>
      </>}
      {id===3&&<>
        {[0,1,2,3,4,5,6,7].map(x=><path key={x} d={"M"+(x*46)+" 0V150"} stroke="#31554B" strokeWidth="1"/>)}
        {[0,1,2,3,4].map(y=><path key={y} d={"M0 "+(y*35)+"H320"} stroke="#31554B" strokeWidth="1"/>)}
        {[[3,1],[4,1],[4,2],[5,2],[5,3],[6,3]].map(([x,y],i)=><rect key={i} x={x*37+6} y={y*30+4} width="25" height="25" rx="5" fill={i===5?"#B4F0CF":"#5DD0AE"}/>)}
        <circle cx="258" cy="106" r="3" fill="#182F2A"/><circle cx="52" cy="85" r="10" fill="#FC795D"/><rect x="52" y="72" width="3" height="7" rx="2" fill="#B9E39B"/>
      </>}
      {id===4&&<>
        {block(42,0,235,150,"#3B4650")}
        {[22,80,138].map((x,i)=>block(150,x,5,26,"#CBD6D7",{key:i,rx:2}))}
        <path d="M42 0V150M277 0V150" stroke="#D6E2E1" strokeWidth="5"/>
        <rect x="95" y="73" width="73" height="38" rx="11" fill="#F6BE57"/>
        <rect x="109" y="80" width="40" height="22" rx="5" fill="#23445B"/>
        {block(104,67,14,9,"#101B25",{rx:3})}{block(142,67,14,9,"#101B25",{rx:3})}
        <circle cx="236" cy="32" r="12" fill="#FF8666"/><circle cx="236" cy="32" r="5" fill="#FFF0DA"/>
      </>}
      {id===5&&<>
        {block(0,0,320,150,"#215268")}
        <circle cx="57" cy="35" r="15" fill="#E0F4E8" opacity=".8"/>
        {block(230,0,49,66,"#66B9A0")}{block(225,60,59,11,"#A4DEAE")}
        {block(230,113,49,37,"#66B9A0")}{block(225,103,59,11,"#A4DEAE")}
        <ellipse cx="111" cy="77" rx="23" ry="19" fill="#FC8765"/><path d="M90 81l-16 8 19 3z" fill="#E9B164"/><circle cx="120" cy="72" r="3.5" fill="#13232C"/><ellipse cx="105" cy="88" rx="12" ry="6" fill="#FFD0A1"/>
      </>}
      {id===6&&<>
        {[0,1,2,3,4,5,6].map(x=><path key={x} d={"M"+(55+x*30)+" 12V150"} stroke="#3C4657" strokeWidth="1"/>)}
        {[0,1,2,3,4].map(y=><path key={y} d={"M55 "+(12+y*30)+"H265"} stroke="#3C4657" strokeWidth="1"/>)}
        {[[1,3],[2,3],[3,3],[3,2],[4,4],[4,3],[5,3],[5,2],[0,4],[1,4],[2,4],[3,4]].map(([x,y],i)=><rect key={i} x={57+x*30} y={14+y*27} width="25" height="23" rx="2" fill={i<4?"#FF8A62":i<8?"#5FCABF":"#F0C66C"}/>)}
        {[[2,0],[3,0],[4,0],[3,1]].map(([x,y],i)=><rect key={i} x={57+x*30} y={14+y*27} width="25" height="23" rx="2" fill="#8BADC9"/>)}
      </>}
      {id===7&&<>
        {[38,82,126].map((y,i)=><rect key={i} x="16" y={y} width="290" height="7" fill="#5F7B85"/>)}
        {[100,229].map(x=><g key={x}><path d={"M"+x+" 13V145m19-132v132"} stroke="#E9BB76" strokeWidth="5"/>{[30,45,60,75,90,105,120,135].map(y=><path key={y} d={"M"+x+" "+y+"h19"} stroke="#E9BB76" strokeWidth="3"/>)}</g>)}
        <rect x="60" y="106" width="18" height="19" rx="3" fill="#57CFC7"/><circle cx="69" cy="99" r="8" fill="#F4AA86"/>
        <circle cx="273" cy="111" r="10" fill="#F38B68"/><circle cx="269" cy="108" r="2" fill="#1B2634"/>
      </>}
      {id===8&&<>
        {[68,130,192,254].map((x,i)=><g key={x}><path d={"M"+(x-16)+" 32h32v19h-8v8h-6v-8h-5v8h-6v-8h-7z"} fill={i%2?"#F7BC75":"#69D6D0"}/><rect x={x-7} y="38" width="4" height="5" fill="#152634"/><rect x={x+5} y="38" width="4" height="5" fill="#152634"/></g>)}
        <rect x="152" y="111" width="18" height="23" fill="#E5E8E0"/><path d="M143 126h36l-7-14h-22z" fill="#6FC6D0"/>
        <rect x="160" y="76" width="3" height="24" fill="#F8B85D"/><circle cx="161.5" cy="72" r="3" fill="#F8B85D"/>
      </>}
      {id===9&&<>
        {[0,1,2,3].map(row=>[0,1,2,3,4,5].map(col=><rect key={row+"-"+col} x={17+col*49} y={20+row*23} width="44" height="17" rx="3" fill={["#F6BD75","#77C5C7","#FC856B","#B7D9CF"][row]} />))}
        <circle cx="203" cy="112" r="7" fill="#F7F4EC"/><path d="M169 126l-11-7" stroke="#F7F4EC" strokeWidth="2"/>
        <rect x="110" y="137" width="103" height="8" rx="4" fill="#F7F4EC"/>
      </>}
      {id===10&&<>
        <rect x="0" y="130" width="320" height="20" fill="#44505A"/>
        <rect x="17" y="21" width="129" height="8" rx="3" fill="#77C9B8"/><rect x="174" y="21" width="129" height="8" rx="3" fill="#FC8C6E"/>
        <circle cx="109" cy="78" r="14" fill="#E9B28F"/><path d="M98 92l25 0 17 29h-63z" fill="#6EC9C5"/><path d="M111 100l-30 7m42 0 33-12" stroke="#6EC9C5" strokeWidth="11" strokeLinecap="round"/>
        <circle cx="226" cy="78" r="14" fill="#E9B28F"/><path d="M213 92h26l13 29h-55z" fill="#FC8969"/><path d="M214 101l-31-7m55 8 22 11" stroke="#FC8969" strokeWidth="10" strokeLinecap="round"/>
      </>}
      {id===11&&<>
        <rect x="23" y="18" width="274" height="111" rx="7" fill="#324D50"/>
        <rect x="32" y="29" width="94" height="77" rx="4" fill="#D8E8D9"/>
        <rect x="43" y="43" width="73" height="9" fill="#5A847D"/><rect x="43" y="58" width="47" height="7" fill="#90B5A6"/>
        <rect x="181" y="83" width="92" height="39" fill="#C9A874"/><rect x="190" y="92" width="31" height="23" fill="#F58D69"/><rect x="229" y="94" width="32" height="21" fill="#78D0C2"/>
        <rect x="180" y="45" width="47" height="32" rx="3" fill="#1B2B37"/><rect x="186" y="51" width="35" height="17" fill="#8DC9BD"/><rect x="238" y="34" width="37" height="43" rx="3" fill="#F1C578"/>
      </>}
    </svg>
  </div>;
}

function TheoryPreview() {
  const section=chapters[3].lessons[1];
  return <div className="course-preview theory-preview" aria-hidden="true">
    <div className="preview-browser">
      <div className="preview-toolbar"><span className="preview-dots"><i/><i/><i/></span><span>ICT / Theory</span><span>04 / 11</span></div>
      <div className="theory-mock-content">
        <aside><span>01 Systems</span><span>02 Devices</span><span className="selected">04 Networks</span><span>05 Effects of IT</span></aside>
        <div className="mock-lesson">
          <span className="mock-kicker">Lesson 02</span>
          <strong>{section.title}</strong>
          <div className="mock-rule"/>
          {section.terms.slice(0,2).map(([term,definition])=><div className="mock-term" key={term}><b>{term}</b><span>{definition}</span></div>)}
        </div>
      </div>
    </div>
  </div>;
}
function PracticalPreview() {
  const cells=[
    ["","A","B","C","D"],
    ["1","Item","Qty","Price","Total"],
    ["2","Notebook","2","7","14"],
    ["3","Cable","3","12","36"],
    ["4","Mouse","1","35","35"],
    ["5","Total","","","85"]
  ];
  return <div className="course-preview practical-preview" aria-hidden="true">
    <div className="sheet-mock">
      <div className="preview-toolbar"><span className="preview-dots"><i/><i/><i/></span><span>Spreadsheet</span><span>Sheet 01</span></div>
      <div className="formula-bar"><span>ƒx</span><code>=SUM(D2:D4)</code></div>
      <div className="sheet-grid">{cells.flatMap((row,i)=>row.map((cell,j)=><span key={i+"-"+j} className={"sheet-cell "+(i===0?"sheet-col ":"")+(j===0?"sheet-row ":"")+(i===5&&j===4?"sheet-total":"")}>{cell}</span>))}</div>
    </div>
  </div>;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [theme, setTheme] = useStored("ict-arcade-theme", "auto");
  const [done, setDone] = useStored("ict-arcade-lessons-done", []);
  const [bookmarks, setBookmarks] = useStored("ict-arcade-bookmarks", []);
  const [known, setKnown] = useStored("ict-arcade-mastered", []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [quizChapter, setQuizChapter] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [practiceType, setPracticeType] = useState("choice");
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [showMarking, setShowMarking] = useState(false);
  const [drafts, setDrafts] = useStored("ict-arcade-written-drafts", {});
  const [flashChapter, setFlashChapter] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); window.scrollTo({top: 0, behavior: "smooth"}); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = event => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const chapter = chapters.find(ch => ch.id === route.id) || chapters[0];
  const lessonIndex = Math.max(0, Math.min(route.lesson, chapter.lessons.length - 1));
  const lesson = chapter.lessons[lessonIndex];
  const lessonKey = keyFor(chapter.id, lessonIndex);
  const theoryChapters = chapters.filter(ch => ch.unit === "Theory");
  const theoryLessons = allLessons.filter(l => l.chapterId <= 11);
  const theoryQuestions = questions.filter(q => q.chapterId <= 11);
  const theoryFlashcards = flashcards.filter(card => card.chapterId <= 11);
  const validDone = done.filter(k => theoryLessons.some(l => keyFor(l.chapterId, l.index) === k));
  const overallPercent = Math.round(validDone.length / theoryLessons.length * 100);
  const bookmarkCount = bookmarks.filter(k => theoryLessons.some(l => keyFor(l.chapterId, l.index) === k)).length;
  const darkMode = theme === "dark" || (theme === "auto" && systemDark);
  const toggleTheme = () => setTheme(darkMode ? "light" : "dark");

  const results = useMemo(() => chapters.filter(ch => {
    if (ch.unit !== "Theory") return false;
    if (filter === "Saved" && !ch.lessons.some((_, i) => bookmarks.includes(keyFor(ch.id, i)))) return false;
    const searchable = [ch.title, ch.description, ...ch.lessons.flatMap(l => [l.title, ...l.points, l.example, ...l.terms.flat()])].join(" ").toLowerCase();
    return searchable.includes(search.trim().toLowerCase());
  }), [filter, search, bookmarks]);

  const quizItems = useMemo(() => quizChapter ? theoryQuestions.filter(q => q.chapterId === quizChapter) : theoryQuestions, [quizChapter, theoryQuestions.length]);
  const finished = quizIndex >= quizItems.length;
  const quizQuestion = !finished ? quizItems[quizIndex] : null;
  const options = useMemo(() => {
    if (!quizQuestion) return [];
    const items = quizQuestion.answers.map((text, value) => ({text, value}));
    let seed = (quizIndex * 431 + quizQuestion.question.length * 977) >>> 0;
    for (let i = items.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [quizQuestion, quizIndex]);

  const flashPool = theoryFlashcards.filter(card => !flashChapter || card.chapterId === flashChapter);
  const currentFlash = flashPool[flashIndex % flashPool.length];
  const knownInPool = flashPool.filter(card => known.includes(card.term)).length;
  const writtenQuestion = writtenQuestions[writtenIndex];
  const words = (drafts[writtenIndex] || "").trim().split(/\s+/).filter(Boolean).length;

  const startQuiz = id => {
    setQuizChapter(id); setQuizIndex(0); setQuizScore(0); setPicked(null);
  };
  const pickAnswer = index => {
    if (picked !== null) return;
    setPicked(index);
    if (index === 0) setQuizScore(s => s + 1);
  };
  const nextQuestion = () => {setPicked(null); setQuizIndex(i => i + 1);};
  const selectFlashChapter = id => { setFlashChapter(id); setFlashIndex(0); setFlipped(false); };
  const advanceFlash = () => {setFlipped(false); setFlashIndex(i => i + 1);};
  const toggleDone = () => setDone(old => old.includes(lessonKey) ? old.filter(k => k !== lessonKey) : [...old, lessonKey]);
  const toggleBookmark = () => setBookmarks(old => old.includes(lessonKey) ? old.filter(k => k !== lessonKey) : [...old, lessonKey]);
  return <div className="site-shell">
    <button className="skip-link" onClick={() => document.getElementById("main-content")?.focus()}>Skip to content</button>
    <header className={"site-header " + (route.page === "home" ? "home-header" : "")}>
      {route.page !== "home" && <button className="header-brand" onClick={() => navigate("home")} aria-label="Back to ICT Arcade home">
        <img className="brand-image" src="/ict-arcade-mark.svg" alt="" />
        <span className="header-brand-name">ICT Arcade<span>.</span></span>
      </button>}
      <button className="header-theme" type="button" onClick={toggleTheme}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        {darkMode ? <Sun size={19} strokeWidth={1.85}/> : <Moon size={19} strokeWidth={1.85}/>}
      </button>
    </header>
    <div className="site-body">
      <main id="main-content" tabIndex={-1} className="site-main">

        {route.page === "home" && <>
          <section className="home-intro">
            <div className="home-signature">
              <img className="home-logo-mark" src="/ict-arcade-mark.svg" alt="" />
              <h1>ICT Arcade<span>.</span></h1>
            </div>
            <h2>Choose what to revise</h2>
            <a className="past-papers-link" href="https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-information-and-communication-technology-0417/past-papers/" target="_blank" rel="noopener noreferrer">
              <FileText size={17}/> Past papers <ArrowUpRight size={16}/>
            </a>
          </section>

          <section className="course-choices" aria-label="Revision sections">
            <button className="course-choice theory-card" onClick={() => navigate("notes")}>
              <TheoryPreview/>
              <span className="course-choice-body">
                <span className="course-title-line"><BookOpen size={20}/><strong>Theory</strong><ArrowUpRight size={19}/></span>
                <span className="course-description">11 chapters · {theoryLessons.length} lessons · Notes, explanations and exam practice.</span>
              </span>
            </button>
            <button className="course-choice practical-card" onClick={() => navigate("practical")}>
              <PracticalPreview/>
              <span className="course-choice-body">
                <span className="course-title-line"><Layers size={20}/><strong>Practical</strong><span className="coming-soon">Coming soon</span></span>
                <span className="course-description">Spreadsheets, databases, documents and web authoring.</span>
              </span>
            </button>
          </section>

          <section className="home-games">
            <div className="home-section-heading"><h2>Games</h2><span>11 games</span></div>
            <div className="featured-games">
              {arcadeGames.map((game,i) => <button key={game.id} className={"featured-game "+(i<2?"featured-game-large":"")}
                onClick={() => navigate("games",game.id)} aria-label={"Play "+game.name}>
                <ArcadeVisual id={game.id}/>
                <span className="featured-game-bottom">
                  <span className="featured-game-copy"><strong>{game.name}</strong><small>{game.detail}</small></span>
                  <ArrowUpRight size={19} aria-hidden="true"/>
                </span>
              </button>)}
            </div>
          </section>
        </>}

        {route.page === "notes" && <>
          <Title title="Theory" description="11 chapters of explanations, examples and key definitions." />
          <div className="theory-shortcuts">
            <button onClick={() => navigate("practice")}><CheckCircle2 size={17}/> Questions <ArrowRight size={15}/></button>
            <button onClick={() => navigate("flashcards")}><RotateCcw size={17}/> Flashcards <ArrowRight size={15}/></button>
          </div>
          <div className="library-toolbar">
            <label className="search-field"><Search size={18} aria-hidden="true"/><span className="sr-only">Search theory</span><input placeholder="Search theory topics and terms" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={16}/></button>}</label>
            <div className="filter-list" role="group" aria-label="Filter chapters">
              {["All", "Saved"].map(value => <button key={value} onClick={() => setFilter(value)} className={filter === value ? "selected" : ""} aria-pressed={filter === value}>{value}{value === "Saved" && bookmarkCount > 0 ? " (" + bookmarkCount + ")" : ""}</button>)}
            </div>
          </div>
          <div className="result-summary"><span>{results.length} chapters</span><span>{results.reduce((total, ch) => total + ch.lessons.length, 0)} lessons</span></div>
          {results.length ? <div className="chapter-list">{results.map(ch => <ChapterRow key={ch.id} chapter={ch} done={done} onOpen={() => {
            const savedIndex = ch.lessons.findIndex((_, index) => !done.includes(keyFor(ch.id, index)));
            navigate("chapter", ch.id, savedIndex === -1 ? 0 : savedIndex);
          }}/>)}</div> : <div className="empty-results"><Search size={26}/><h2>No chapters found</h2><p>Try another search or view all theory chapters.</p><button className="secondary-action" onClick={() => {setFilter("All"); setSearch("");}}>Clear filters</button></div>}
        </>}

        {(route.page === "practical" || (route.page === "chapter" && chapter.unit !== "Theory")) && <section className="practical-soon">
          <div className="choice-icon"><Layers size={26} strokeWidth={1.8}/></div>
          <h1>Practical</h1>
          <p>Practical revision is coming soon. Theory lessons, questions and games are ready to use.</p>
          <button className="primary-action" onClick={() => navigate("notes")}>Go to Theory <ArrowRight size={17}/></button>
        </section>}

        {route.page === "chapter" && chapter.unit === "Theory" && <>
          <button className="back-link" onClick={() => navigate("notes")}><ArrowLeft size={16}/> Back to Theory</button>
          <div className="chapter-heading"><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
          <div className="reading-layout">
            <aside className="lesson-index" aria-label="Lessons in chapter">
              <div className="lesson-index-heading"><span>Lessons</span><span>{chapterProgress(chapter, done)}% done</span></div>
              <Progress value={chapterProgress(chapter, done)} label="Chapter completion"/>
              <nav>{chapter.lessons.map((entry, i) => <button key={entry.title} className={"lesson-link " + (i === lessonIndex ? "active" : "")} onClick={() => navigate("chapter", chapter.id, i)} aria-current={i === lessonIndex ? "page" : undefined}>
                <span>{done.includes(keyFor(chapter.id, i)) ? <Check size={15}/> : formatNumber(i + 1)}</span><span>{entry.title}</span>
              </button>)}</nav>
            </aside>
            <article className="reading-article">
              <div className="article-topline"><span className="lesson-count">{lessonIndex + 1} of {chapter.lessons.length}</span><button onClick={toggleBookmark} className="bookmark-button" aria-label={bookmarks.includes(lessonKey) ? "Remove lesson bookmark" : "Bookmark lesson"} aria-pressed={bookmarks.includes(lessonKey)}>{bookmarks.includes(lessonKey) ? <BookmarkCheck size={19}/> : <Bookmark size={19}/>}<span>{bookmarks.includes(lessonKey) ? "Saved" : "Save"}</span></button></div>
              <h2>{lesson.title}</h2>
              <div className="article-rule"/>
              <h3>Key ideas</h3>
              <ol className="concepts">{lesson.points.map((point, i) => <li key={i}><span className="concept-count">{formatNumber(i + 1)}</span><span>{point}</span></li>)}</ol>
              <section className="lesson-highlight example"><h3>Example</h3><p>{lesson.example}</p></section>
              <section className="lesson-highlight exam"><h3>Exam tip</h3><p>{lesson.tip}</p></section>
              {lesson.terms.length > 0 && <section className="definitions"><h3>Definitions to learn</h3><dl>{lesson.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></section>}
              <div className="article-actions"><button className={done.includes(lessonKey) ? "done-action" : "primary-action"} onClick={toggleDone}>{done.includes(lessonKey) ? <CheckCircle2 size={17}/> : <Check size={17}/>} {done.includes(lessonKey) ? "Completed" : "Mark as studied"}</button>
                <div className="article-next">{lessonIndex > 0 && <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex - 1)}><ArrowLeft size={16}/> Previous</button>}{lessonIndex + 1 < chapter.lessons.length ? <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex + 1)}>Next lesson <ArrowRight size={16}/></button> : <button className="secondary-action" onClick={() => {startQuiz(chapter.id); navigate("practice");}}>Test this chapter <ArrowRight size={16}/></button>}</div>
              </div>
            </article>
          </div>
        </>}

        {route.page === "practice" && <>
          <Title title="Practice questions" description="Check what you know and see the reasoning behind each answer. For longer questions, write your response before viewing the guidance." />
          <div className="mode-tabs" role="group" aria-label="Practice type">
            <button aria-pressed={practiceType === "choice"} className={practiceType === "choice" ? "active" : ""} onClick={() => setPracticeType("choice")}>Quick questions</button>
            <button aria-pressed={practiceType === "written"} className={practiceType === "written" ? "active" : ""} onClick={() => setPracticeType("written")}>Written answers</button>
          </div>
          {practiceType === "choice" ? <>
            <div className="practice-toolbar"><label>CHAPTER<select aria-label="Choose question chapter" value={quizChapter} onChange={e => startQuiz(Number(e.target.value))}><option value={0}>All chapters</option>{theoryChapters.map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{quizScore} correct · {quizIndex + (picked !== null ? 1 : 0)} answered</span></div>
            {finished ? <div className="quiz-finish"><h2>{quizScore} <span>/ {quizItems.length}</span></h2><p>{quizScore === quizItems.length ? "All correct. Try a different topic or move to written answers." : "Review the notes for any answers you missed, then try another round."}</p><div><button className="primary-action" onClick={() => startQuiz(quizChapter)}><RotateCcw size={16}/> Try again</button><button className="secondary-action" onClick={() => navigate("notes")}>Open notes <ArrowRight size={16}/></button></div></div> :
            <div className="question-paper"><div className="question-progress"><span>QUESTION {formatNumber(quizIndex + 1)} OF {formatNumber(quizItems.length)}</span><span>{chapterName(quizQuestion.chapterId)}</span></div><Progress value={(quizIndex + 1) / quizItems.length * 100} label="Question progress"/><h2>{quizQuestion.question}</h2>
              <div className="option-list">{options.map(({text, value}, i) => <button key={text} disabled={picked !== null} aria-pressed={picked === value} onClick={() => pickAnswer(value)} className={"answer-button " + (picked !== null && value === 0 ? "correct" : "") + (picked === value && value !== 0 ? " incorrect" : "")}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{picked !== null && value === 0 && <CheckCircle2 size={18}/>}</button>)}</div>
              {picked !== null && <div className="answer-explanation" role="status"><strong>{picked === 0 ? "Correct" : "Review this answer"}</strong><p>{quizQuestion.why}</p><button className="primary-action" onClick={nextQuestion}>{quizIndex + 1 === quizItems.length ? "See results" : "Next question"} <ArrowRight size={16}/></button></div>}
            </div>}
          </> : <>
            <div className="practice-toolbar"><label>QUESTION<select value={writtenIndex} aria-label="Choose written question" onChange={e => {setWrittenIndex(Number(e.target.value)); setShowMarking(false);}}>{writtenQuestions.map((q, i) => q.chapterId <= 11 ? <option key={i} value={i}>Q{formatNumber(i + 1)} / Chapter {q.chapterId}</option> : null)}</select></label><span>{writtenQuestion.marks} marks available</span></div>
            <div className="question-paper written-paper"><div className="question-progress"><span>Question {writtenIndex + 1}</span><span>CHAPTER {formatNumber(writtenQuestion.chapterId)}</span></div><h2>{writtenQuestion.prompt}</h2>
              <label htmlFor="written-response" className="text-area-label">YOUR RESPONSE</label>
              <textarea id="written-response" rows={7} placeholder="Write your answer here before revealing the suggested marking points." value={drafts[writtenIndex] || ""} onChange={e => setDrafts(old => ({...old, [writtenIndex]: e.target.value}))}/>
              <div className="draft-controls"><span>{words} words · Saved on this device</span><button className="plain-action" onClick={() => setDrafts(old => ({...old, [writtenIndex]: ""}))} disabled={!drafts[writtenIndex]}>Clear answer</button></div>
              <button className="secondary-action" onClick={() => setShowMarking(v => !v)}>{showMarking ? <EyeOff size={16}/> : <Eye size={16}/>} {showMarking ? "Hide answer guidance" : "View answer guidance"}</button>
              {showMarking && <div className="marking-guidance"><strong>Indicative points</strong><p>Original revision guidance, not an official mark scheme. Compare these points with your own response.</p><ol>{writtenQuestion.points.map((point, i) => <li key={i}>{point}</li>)}</ol></div>}
            </div>
          </>}
        </>}

        {route.page === "flashcards" && <>
          <Title title="Flashcards" description="Try to define the term yourself. Turn the card to check, then keep moving through the set."/>
          <div className="practice-toolbar"><label>CHAPTER<select aria-label="Choose flashcard chapter" value={flashChapter} onChange={e => selectFlashChapter(Number(e.target.value))}><option value={0}>All chapters</option>{theoryChapters.filter(ch => theoryFlashcards.some(card => card.chapterId === ch.id)).map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{knownInPool} of {flashPool.length} known</span></div>
          {currentFlash && <>
            <div className="flash-progress"><span>CARD {formatNumber(flashIndex % flashPool.length + 1)} / {formatNumber(flashPool.length)}</span><span>{chapterName(currentFlash.chapterId)}</span></div>
            <button className={"revision-card " + (flipped ? "is-flipped" : "")} onClick={() => setFlipped(v => !v)} aria-label={flipped ? "Show term" : "Reveal definition"}><strong>{flipped ? currentFlash.definition : currentFlash.term}</strong><span className="flash-turn"><RotateCcw size={17}/> {flipped ? "Show term" : "Reveal answer"}</span></button>
            <div className="flash-controls"><button className="secondary-action" onClick={advanceFlash}>Review later <ArrowRight size={16}/></button><button className="primary-action" onClick={() => {setKnown(prev => prev.includes(currentFlash.term) ? prev : [...prev, currentFlash.term]); advanceFlash();}}><Check size={17}/> I knew this</button></div>
            <p className="flash-caption">Cards marked as known stay recorded in this browser. Keep reviewing them for long-term recall.</p>
          </>}
        </>}

        {route.page === "games" && <>
          <Title title="Games" description="Eleven original games, each with ICT questions built into play. Scores and controls work the same way as before." action={<a className="secondary-action" href="/arcade-legacy.html" target="_blank" rel="noopener noreferrer">Play full screen <ArrowUpRight size={17}/></a>}/>
          
          <iframe key={route.game || "all"} title="ICT Arcade original games" src={route.game > 0 ? "/arcade-legacy.html?game=" + route.game : "/arcade-legacy.html"} className="arcade-frame" allow="fullscreen" loading="eager"/>
        </>}

      </main>
      <footer className="site-footer">© {new Date().getFullYear()} ICT Arcade</footer>
    </div>
  </div>;
}
export default App;
