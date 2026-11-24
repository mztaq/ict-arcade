import React, {useEffect, useMemo, useState} from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck,
  Check, CheckCircle2, Eye, EyeOff,
  Layers, FileText, Moon, RotateCcw, Search, Sun, X, Keyboard, Cpu, Monitor,
  HardDrive, Network, HeartPulse, PanelsTopLeft, Workflow, ShieldCheck, UsersRound, MessagesSquare, FolderOpen,
  MonitorSmartphone, Binary, RadioTower, Printer, Disc3, MemoryStick, Router, Cloud,
  House, CarFront, SlidersHorizontal, BrainCircuit, CalendarCheck2, Stethoscope,
  PencilRuler, ClipboardCheck, ShieldAlert, LockKeyhole, Copyright, Mail, Globe2, FileArchive
} from "lucide-react";
import {chapters, allLessons, flashcards} from "./content.js";
import {questions, writtenQuestions} from "./questions.js";
import {examinerAdvice} from "./examinerAdvice.js";
import {solvedPastPapers} from "./pastPapers.js";
import {PapaPapers} from "./PapaPapers.jsx";
import PaperViewer from "./PaperViewer.jsx";

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
  return {
    page: parts[0] || "home",
    id: Number(parts[1]) || 1,
    lesson: Number(parts[2]) || 0,
    game: parts[0] === "games" ? (Number(parts[1]) || 0) : 0,
    papersView: parts[0] === "past-papers" ? (parts[1] || "home") : "home",
    papersNumber: parts[0] === "past-papers" && parts[1] === "solved" ? Number(parts[2]) || 0 : 0,
    papersYear: parts[0] === "past-papers" && parts[1] === "yearly" ? Number(parts[2]) || 0 : 0,
    papersId: parts[0] === "past-papers" && ["yearly","solved"].includes(parts[1]) ? (parts[3] || "") : "",
    papersDocument: parts[0] === "past-papers" ? (parts[4] || "") : ""
  };
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
// One consistent Lucide outline family. Mappings follow the actual chapter/lesson topics.
const chapterIcons = {
  1: Cpu,
  2: Keyboard,
  3: HardDrive,
  4: Network,
  5: HeartPulse,
  6: PanelsTopLeft,
  7: Workflow,
  8: ShieldCheck,
  9: UsersRound,
  10: MessagesSquare,
  11: FolderOpen
};
const lessonIcons = {
  1: [PanelsTopLeft, Cpu, Binary, MonitorSmartphone],
  2: [Keyboard, RadioTower, Printer],
  3: [HardDrive, Disc3, MemoryStick],
  4: [Network, Router, Cloud],
  5: [House, CarFront, HeartPulse],
  6: [MessagesSquare, SlidersHorizontal, BrainCircuit, CalendarCheck2, Stethoscope],
  7: [Search, PencilRuler, ClipboardCheck, BookOpen],
  8: [ShieldCheck, ShieldAlert, LockKeyhole],
  9: [UsersRound, Copyright],
  10: [Mail, Globe2, RadioTower],
  11: [FolderOpen, FileArchive]
};
function ChapterRow({chapter, done, compact = false, onOpen}) {
  const ChapterIcon = chapterIcons[chapter.id] || BookOpen;
  const progress = chapterProgress(chapter, done);
  return <button className={"chapter-row " + (compact ? "is-compact" : "")} onClick={onOpen}>
    <span className="chapter-index"><ChapterIcon size={22} strokeWidth={1.8} aria-hidden="true"/></span>
    <span className="chapter-description"><strong>{chapter.title}</strong></span>
    <span className="chapter-stats">
      <span className="chapter-lessons"><strong>{chapter.lessons.length}</strong><span>lessons</span></span>
      {progress > 0 && <span className="chapter-percent">{progress}%</span>}
    </span>
    <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" />
  </button>;
}
function Title({title, description, action}) {
  return <div className="page-title">
    <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
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

function CircuitBackdrop() {
  return <div className="home-circuit-backdrop" aria-hidden="true">
    <svg viewBox="0 0 1200 610" preserveAspectRatio="xMidYMin slice" focusable="false">
      <g className="circuit-lines" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 90H95L145 140H254L297 183H378"/>
        <path d="M0 175H76L126 225H226L274 273H343"/>
        <path d="M0 300H62L114 248H189"/>
        <path d="M0 480H114L166 428H230L286 372H364"/>
        <path d="M1200 75H1100L1054 121H976L920 177H836"/>
        <path d="M1200 196H1132L1069 259H995L954 300H866"/>
        <path d="M1200 370H1140L1080 310H1010"/>
        <path d="M1200 514H1090L1040 463H978L927 412H857"/>
        <path d="M0 557H84L138 503H206"/>
        <path d="M1200 576H1125L1081 532H999"/>
      </g>
      <g className="circuit-nodes" fill="currentColor">
        <circle cx="378" cy="183" r="4"/><circle cx="343" cy="273" r="4"/>
        <circle cx="189" cy="248" r="4"/><circle cx="364" cy="372" r="4"/>
        <circle cx="836" cy="177" r="4"/><circle cx="866" cy="300" r="4"/>
        <circle cx="1010" cy="310" r="4"/><circle cx="857" cy="412" r="4"/>
        <circle cx="206" cy="503" r="4"/><circle cx="999" cy="532" r="4"/>
      </g>
      <g className="circuit-signals" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M0 90H95L145 140H254L297 183H378"/>
        <path d="M0 480H114L166 428H230L286 372H364"/>
        <path d="M1200 196H1132L1069 259H995L954 300H866"/>
        <path d="M1200 514H1090L1040 463H978L927 412H857"/>
      </g>
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

  const selectedSolvedPaper = solvedPastPapers[route.papersNumber]?.find(item=>item.id===route.papersId);
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
  const advice = examinerAdvice[lessonKey];
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
        <span className="header-brand-name">ICT Arcade</span>
      </button>}
      <button className="header-theme" type="button" onClick={toggleTheme}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        {darkMode ? <Sun size={19} strokeWidth={1.85}/> : <Moon size={19} strokeWidth={1.85}/>}
      </button>
    </header>
    <div className="site-body">
      <main id="main-content" tabIndex={-1} className="site-main">

        {route.page === "home" && <div className="home-screen">
          <CircuitBackdrop/>
          <section className="home-intro">
            <div className="home-signature">
              <img className="home-logo-mark" src="/ict-arcade-mark.svg" alt="" />
              <h1>ICT Arcade</h1>
            </div>
            <h2>Learn ICT step by step</h2>
            <a className="past-papers-link" href="#/past-papers">
              <FileText size={18}/> Try past papers <ArrowRight size={17}/>
            </a>
          </section>

          <section className="course-choices" aria-label="Revision sections">
            <a className="course-choice theory-card" href="#/notes">
              <TheoryPreview/>
              <span className="course-choice-body">
                <span className="course-title-line"><BookOpen size={20}/><strong>Theory</strong><ArrowUpRight size={19}/></span>
                <span className="course-stats"><span><strong>{theoryChapters.length}</strong><small>chapters</small></span><span><strong>{theoryLessons.length}</strong><small>lessons</small></span></span>
              </span>
            </a>
            <a className="course-choice practical-card" href="#/practical">
              <PracticalPreview/>
              <span className="course-choice-body">
                <span className="course-title-line"><Layers size={20}/><strong>Practical</strong><span className="coming-soon">Coming soon</span></span>
              </span>
            </a>
          </section>

          <a className="games-hub-card" href="#/games" aria-label="Browse all 11 ICT Arcade games">
            <span className="games-hub-info"><strong>Games</strong><span>11 games</span><ArrowUpRight size={21}/></span>
            <span className="games-hub-preview" aria-hidden="true"><ArcadeVisual id={1}/><ArcadeVisual id={3}/><ArcadeVisual id={8}/></span>
          </a>
        </div>}

        {route.page === "past-papers" && <>
          {route.papersView === "home" && <>
            <div className="papers-home">
              <Title title="Past Papers"/>
              <div className="paper-category-grid papers-home-grid">
                <a className="paper-category papers-home-card" href="#/past-papers/yearly">
                  <span className="papers-home-art" aria-hidden="true">
                    <svg viewBox="0 0 240 142" fill="none">
                      <g className="papers-art-back" transform="rotate(-12 96 70)"><rect x="51" y="14" width="90" height="113" rx="9"/><path d="M67 42h46M67 54h31M67 78h57M67 90h43"/></g>
                      <g className="papers-art-front" transform="rotate(9 145 70)"><rect x="100" y="12" width="91" height="116" rx="9"/><rect x="114" y="28" width="26" height="20" rx="4"/><path d="M115 62h60M115 73h44M115 84h60M115 106h23"/></g>
                      <g className="papers-art-badge"><rect x="159" y="88" width="45" height="42" rx="10"/><path d="M169 101h25M169 109h25M176 94v11m12-11v11M176 116h4m5 0h4"/></g>
                    </svg>
                  </span>
                  <span className="papers-home-copy"><strong>Yearly Past Papers</strong><span>Question papers, mark schemes, examiner reports and source files.</span><small>2017–2026</small></span>
                  <ArrowRight className="paper-category-arrow" size={22}/>
                </a>
                <a className="paper-category papers-home-card" href="#/past-papers/solved">
                  <span className="papers-home-art papers-solved-art" aria-hidden="true">
                    <svg viewBox="0 0 240 142" fill="none">
                      <g className="papers-art-back" transform="rotate(-10 100 70)"><rect x="55" y="13" width="94" height="116" rx="9"/><path d="M72 40h48M72 54h34M72 77h51M72 90h40"/></g>
                      <g className="papers-art-front" transform="rotate(8 142 70)"><rect x="101" y="12" width="89" height="116" rx="9"/><path d="M115 33h54M115 45h35M115 67l5 5 9-11M139 68h33M115 88l5 5 9-11M139 89h33M115 109l5 5 9-11M139 110h25"/></g>
                      <g className="papers-art-badge"><circle cx="187" cy="106" r="24"/><path d="m176 106 8 8 14-17"/></g>
                    </svg>
                  </span>
                  <span className="papers-home-copy"><strong>Solved Past Papers</strong><span>Worked practical papers and supporting files.</span><small>Paper 2 &amp; Paper 3</small></span>
                  <ArrowRight className="paper-category-arrow" size={22}/>
                </a>
              </div>
            </div>
          </>}
          {route.papersView === "yearly" && <PapaPapers year={route.papersYear} series={route.papersId} folder={route.papersDocument}/>}
          {route.papersView === "solved" && <>
            <Title title={selectedSolvedPaper ? selectedSolvedPaper.title :
                [1,2,3].includes(route.papersNumber) ? "Paper " + route.papersNumber : "Solved Past Papers"}
              action={<button type="button" className="chapter-back-button"
                onClick={()=>route.papersId ?
                  navigate("past-papers","solved",route.papersNumber) :
                  navigate("past-papers",route.papersNumber ? "solved" : undefined)}>
                <ArrowLeft size={16}/> {route.papersId ? "Paper "+route.papersNumber :
                  route.papersNumber ? "Solved Past Papers" : "Past Papers"}
              </button>}/>
            {route.papersNumber === 0 ? <>
              <div className="paper-category-grid solved-paper-options">
                <a className="paper-category" href="#/past-papers/solved/1">
                  <span className="paper-category-icon"><BookOpen size={26} strokeWidth={1.7}/></span>
                  <strong>Paper 1</strong><span>Theory</span>
                  <ArrowUpRight className="paper-category-arrow" size={20}/>
                </a>
                <a className="paper-category" href="#/past-papers/solved/2">
                  <span className="paper-category-icon"><FileText size={26} strokeWidth={1.7}/></span>
                  <strong>Paper 2</strong><span>Document Production, Databases and Presentations</span>
                  <ArrowUpRight className="paper-category-arrow" size={20}/>
                </a>
                <a className="paper-category" href="#/past-papers/solved/3">
                  <span className="paper-category-icon"><Layers size={26} strokeWidth={1.7}/></span>
                  <strong>Paper 3</strong><span>Spreadsheets and Website Authoring</span>
                  <ArrowUpRight className="paper-category-arrow" size={20}/>
                </a>
              </div>
            </> : route.papersNumber === 1 ? (
              <div className="paper-1-message" role="status">
                <HeartPulse size={39} strokeWidth={1.6} aria-hidden="true"/>
                <h2>Mustaqim hates Theory, so no solved Paper 1 papers.</h2>
              </div>
            ) : [2,3].includes(route.papersNumber) ? (
              route.papersId ?
                selectedSolvedPaper ?
                  <PaperViewer title={selectedSolvedPaper.title}
                    selectedKind={route.papersDocument}
                    routePrefix={"#/past-papers/solved/"+route.papersNumber+"/"+selectedSolvedPaper.id}
                    documents={[{key:"workedSolution",label:"Worked Solution",url:selectedSolvedPaper.url}]}
                    sourceFiles={selectedSolvedPaper.sourceFiles||[]}/> :
                  <div className="paper-empty"><p>This solution isn't available.</p></div> :
              solvedPastPapers[route.papersNumber].length ?
                <div className="paper-year-grid">
                  {solvedPastPapers[route.papersNumber].map(item=><a className="paper-year" key={item.id}
                      href={"#/past-papers/solved/"+route.papersNumber+"/"+item.id}>
                    <FileText size={20} strokeWidth={1.7} aria-hidden="true"/>
                    <strong>{item.title}</strong><ArrowRight size={18} aria-hidden="true"/>
                  </a>)}
                </div> :
                <div className="paper-empty"><FileText size={29} strokeWidth={1.6} aria-hidden="true"/>
                  <p>No solved papers uploaded yet.</p></div>
            ) : <div className="paper-empty"><p>Choose Paper 1, Paper 2 or Paper 3.</p></div>}
          </>}
          {!["home","yearly","solved"].includes(route.papersView) && <div className="paper-empty"><p>That collection isn't available.</p>
            <button className="secondary-action" onClick={()=>navigate("past-papers")}>Past Papers</button></div>}
        </>}

        {route.page === "notes" && <>
          <Title title="Theory" action={<div className="theory-title-actions">
            <span className="theory-total"><strong>{theoryLessons.length}</strong><span>lessons</span></span>
            <div className="theory-shortcuts">
              <button onClick={() => navigate("practice")}><CheckCircle2 size={17}/> Questions</button>
              <button onClick={() => navigate("flashcards")}><RotateCcw size={17}/> Flashcards</button>
            </div>
          </div>}/>
          <div className="library-toolbar">
            <label className="search-field"><Search size={18} aria-hidden="true"/><span className="sr-only">Search theory</span><input placeholder="Search theory topics and terms" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={16}/></button>}</label>
            <div className="filter-list" role="group" aria-label="Filter chapters">
              {["All", "Saved"].map(value => <button key={value} onClick={() => setFilter(value)} className={filter === value ? "selected" : ""} aria-pressed={filter === value}>{value}{value === "Saved" && bookmarkCount > 0 ? " (" + bookmarkCount + ")" : ""}</button>)}
            </div>
          </div>
          {(search.trim() || filter !== "All") && <div className="result-summary">{results.length} matching chapters</div>}
          {results.length ? <div className="chapter-list">{results.map(ch => <ChapterRow key={ch.id} chapter={ch} done={done} onOpen={() => {
            const savedIndex = ch.lessons.findIndex((_, index) => !done.includes(keyFor(ch.id, index)));
            navigate("chapter", ch.id, savedIndex === -1 ? 0 : savedIndex);
          }}/>)}</div> : <div className="empty-results"><Search size={26}/><h2>No chapters found</h2><p>Try another search or view all theory chapters.</p><button className="secondary-action" onClick={() => {setFilter("All"); setSearch("");}}>Clear filters</button></div>}
        </>}

        {(route.page === "practical" || (route.page === "chapter" && chapter.unit !== "Theory")) && <section className="practical-soon">
          <h1>Practical</h1>
          <p>Coming soon</p>
        </section>}

        {route.page === "chapter" && chapter.unit === "Theory" && <>
          <div className="chapter-heading">
            <h1>{chapter.title}</h1>
            <button type="button" className="chapter-back-button" onClick={() => navigate("notes")}>
              <ArrowLeft size={16} aria-hidden="true"/> Back to Theory
            </button>
          </div>
          <div className="reading-layout">
            <aside className="lesson-index" aria-label="Lessons in chapter">
              <div className="lesson-index-heading"><span>Contents</span><strong>{chapter.lessons.length} lessons</strong></div>
              <div className="lesson-index-progress">
                <Progress value={chapterProgress(chapter, done)} label="Chapter completion"/>
                {chapterProgress(chapter, done) > 0 && <span>{chapterProgress(chapter, done)}% complete</span>}
              </div>
              <nav>{chapter.lessons.map((entry, i) => {
                const LessonIcon = lessonIcons[chapter.id]?.[i] || BookOpen;
                const completed = done.includes(keyFor(chapter.id, i));
                return <button key={entry.title} className={"lesson-link " + (i === lessonIndex ? "active" : "")}
                  onClick={() => navigate("chapter", chapter.id, i)} aria-current={i === lessonIndex ? "page" : undefined}>
                  <span className={"lesson-icon " + (completed ? "is-complete" : "")}>
                    <LessonIcon size={21} strokeWidth={1.8} aria-hidden="true"/>
                    {completed && <Check size={11} strokeWidth={2.7} className="lesson-check" aria-hidden="true"/>}
                  </span>
                  <span>{entry.title}</span>
                  {completed && <span className="sr-only">Completed</span>}
                </button>;
              })}</nav>
            </aside>
            <article className="reading-article">
              <div className="article-topline"><span className="lesson-count">{lessonIndex + 1} of {chapter.lessons.length}</span><button onClick={toggleBookmark} className="bookmark-button" aria-label={bookmarks.includes(lessonKey) ? "Remove lesson bookmark" : "Bookmark lesson"} aria-pressed={bookmarks.includes(lessonKey)}>{bookmarks.includes(lessonKey) ? <BookmarkCheck size={19}/> : <Bookmark size={19}/>}<span>{bookmarks.includes(lessonKey) ? "Saved" : "Save"}</span></button></div>
              <h2>{lesson.title}</h2>
              <div className="article-rule"/>
              <h3>Key points</h3>
              <ol className="concepts">{lesson.points.map((point, i) => <li key={i}><span className="concept-count">{formatNumber(i + 1)}</span><span>{point}</span></li>)}</ol>
              <section className="lesson-highlight example"><h3>Example</h3><p>{lesson.example}</p></section>
              {lesson.terms.length > 0 && <section className="definitions"><h3>Definitions</h3><dl>{lesson.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></section>}
              <section className="lesson-highlight exam"><h3>Exam tip</h3><p>{lesson.tip}</p></section>
              <section className="examiner-advice" aria-label="Theory exam advice"><h3>Exam advice</h3>
                {advice ? <>
                  {advice.points.map((tip,i)=><p key={i}>{tip}</p>)}
                </> : <p>Coming soon</p>}
              </section>
              <div className="article-actions"><button className={done.includes(lessonKey) ? "done-action" : "primary-action"} onClick={toggleDone}>{done.includes(lessonKey) ? <CheckCircle2 size={17}/> : <Check size={17}/>} {done.includes(lessonKey) ? "Completed" : "Mark as studied"}</button>
                <div className="article-next">{lessonIndex > 0 && <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex - 1)}><ArrowLeft size={16}/> Previous</button>}{lessonIndex + 1 < chapter.lessons.length ? <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex + 1)}>Next lesson <ArrowRight size={16}/></button> : <button className="secondary-action" onClick={() => {startQuiz(chapter.id); navigate("practice");}}>Test this chapter <ArrowRight size={16}/></button>}</div>
              </div>
            </article>
          </div>
        </>}

        {route.page === "practice" && <>
          <Title title="Questions" />
          <div className="mode-tabs" role="group" aria-label="Practice type">
            <button aria-pressed={practiceType === "choice"} className={practiceType === "choice" ? "active" : ""} onClick={() => setPracticeType("choice")}>Quick questions</button>
            <button aria-pressed={practiceType === "written"} className={practiceType === "written" ? "active" : ""} onClick={() => setPracticeType("written")}>Written answers</button>
          </div>
          {practiceType === "choice" ? <>
            <div className="practice-toolbar"><label>Chapter<select aria-label="Choose question chapter" value={quizChapter} onChange={e => startQuiz(Number(e.target.value))}><option value={0}>All chapters</option>{theoryChapters.map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{quizScore} correct · {quizIndex + (picked !== null ? 1 : 0)} answered</span></div>
            {finished ? <div className="quiz-finish"><h2>{quizScore} <span>/ {quizItems.length}</span></h2><p>{quizScore === quizItems.length ? "All correct. Try a different topic or move to written answers." : "Review the notes for any answers you missed, then try another round."}</p><div><button className="primary-action" onClick={() => startQuiz(quizChapter)}><RotateCcw size={16}/> Try again</button><button className="secondary-action" onClick={() => navigate("notes")}>Open notes <ArrowRight size={16}/></button></div></div> :
            <div className="question-paper"><div className="question-progress"><span>Question {quizIndex + 1} of {quizItems.length}</span><span>{chapterName(quizQuestion.chapterId)}</span></div><Progress value={(quizIndex + 1) / quizItems.length * 100} label="Question progress"/><h2>{quizQuestion.question}</h2>
              <div className="option-list">{options.map(({text, value}, i) => <button key={text} disabled={picked !== null} aria-pressed={picked === value} onClick={() => pickAnswer(value)} className={"answer-button " + (picked !== null && value === 0 ? "correct" : "") + (picked === value && value !== 0 ? " incorrect" : "")}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{picked !== null && value === 0 && <CheckCircle2 size={18}/>}</button>)}</div>
              {picked !== null && <div className="answer-explanation" role="status"><strong>{picked === 0 ? "Correct" : "Review this answer"}</strong><p>{quizQuestion.why}</p><button className="primary-action" onClick={nextQuestion}>{quizIndex + 1 === quizItems.length ? "See results" : "Next question"} <ArrowRight size={16}/></button></div>}
            </div>}
          </> : <>
            <div className="practice-toolbar"><label>Question<select value={writtenIndex} aria-label="Choose written question" onChange={e => {setWrittenIndex(Number(e.target.value)); setShowMarking(false);}}>{writtenQuestions.map((q, i) => q.chapterId <= 11 ? <option key={i} value={i}>Q{formatNumber(i + 1)} / Chapter {q.chapterId}</option> : null)}</select></label><span>{writtenQuestion.marks} marks available</span></div>
            <div className="question-paper written-paper"><div className="question-progress"><span>Question {writtenIndex + 1}</span><span>CHAPTER {formatNumber(writtenQuestion.chapterId)}</span></div><h2>{writtenQuestion.prompt}</h2>
              <label htmlFor="written-response" className="text-area-label">Your answer</label>
              <textarea id="written-response" rows={7} placeholder="Write your answer here before revealing the suggested marking points." value={drafts[writtenIndex] || ""} onChange={e => setDrafts(old => ({...old, [writtenIndex]: e.target.value}))}/>
              <div className="draft-controls"><span>{words} words · Saved on this device</span><button className="plain-action" onClick={() => setDrafts(old => ({...old, [writtenIndex]: ""}))} disabled={!drafts[writtenIndex]}>Clear answer</button></div>
              <button className="secondary-action" onClick={() => setShowMarking(v => !v)}>{showMarking ? <EyeOff size={16}/> : <Eye size={16}/>} {showMarking ? "Hide answer guidance" : "View answer guidance"}</button>
              {showMarking && <div className="marking-guidance"><strong>Suggested points</strong><p>Not an official mark scheme.</p><ol>{writtenQuestion.points.map((point, i) => <li key={i}>{point}</li>)}</ol></div>}
            </div>
          </>}
        </>}

        {route.page === "flashcards" && <>
          <Title title="Flashcards" />
          <div className="practice-toolbar"><label>Chapter<select aria-label="Choose flashcard chapter" value={flashChapter} onChange={e => selectFlashChapter(Number(e.target.value))}><option value={0}>All chapters</option>{theoryChapters.filter(ch => theoryFlashcards.some(card => card.chapterId === ch.id)).map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{knownInPool} of {flashPool.length} known</span></div>
          {currentFlash && <>
            <div className="flash-progress"><span>Card {flashIndex % flashPool.length + 1} of {flashPool.length}</span><span>{chapterName(currentFlash.chapterId)}</span></div>
            <button className={"revision-card " + (flipped ? "is-flipped" : "")} onClick={() => setFlipped(v => !v)} aria-label={flipped ? "Show term" : "Reveal definition"}><strong>{flipped ? currentFlash.definition : currentFlash.term}</strong><span className="flash-turn"><RotateCcw size={17}/> {flipped ? "Show term" : "Reveal answer"}</span></button>
            <div className="flash-controls"><button className="secondary-action" onClick={advanceFlash}>Review later <ArrowRight size={16}/></button><button className="primary-action" onClick={() => {setKnown(prev => prev.includes(currentFlash.term) ? prev : [...prev, currentFlash.term]); advanceFlash();}}><Check size={17}/> I knew this</button></div>
            
          </>}
        </>}

        {route.page === "games" && <>
          <Title title={route.game > 0 ? arcadeGames.find(game=>game.id === route.game)?.name || "Games" : "Games"}
            
            action={route.game > 0 ? <button className="secondary-action" onClick={()=>navigate("games")}>All games <ArrowLeft size={17}/></button> : <a className="secondary-action" href="/arcade-legacy.html" target="_blank" rel="noopener noreferrer">Classic arcade <ArrowUpRight size={17}/></a>}/>
          {route.game > 0 ?
            <iframe key={route.game} title={arcadeGames.find(game=>game.id === route.game)?.name || "ICT Arcade game"}
              src={"/arcade-legacy.html?game="+route.game} className="arcade-frame" allow="fullscreen" loading="eager"/> :
            <div className="featured-games games-page-grid">
              {arcadeGames.map(game=><a key={game.id} href={"#/games/"+game.id} className="featured-game" aria-label={"Play "+game.name}>
                <ArcadeVisual id={game.id}/>
                <span className="featured-game-bottom">
                  <span className="featured-game-copy"><strong>{game.name}</strong><small>{game.detail}</small></span>
                  <ArrowUpRight size={19} aria-hidden="true"/>
                </span>
              </a>)}
            </div>}
        </>}

      </main>
      <footer className="site-footer">© {new Date().getFullYear()} ICT Arcade</footer>
    </div>
  </div>;
}
export default App;
