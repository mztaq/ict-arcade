import React, {useEffect, useMemo, useState} from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck,
  Check, CheckCircle2, ClipboardList, Eye, EyeOff,
  Gamepad2, Layers, FileText, Moon, RotateCcw, Search, Sun, X
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

const featuredGames = [
  {id: 1, name: "Pixel Dash", detail: "Run, jump and answer questions."},
  {id: 2, name: "Rune Dungeon", detail: "Solve ICT riddles to open doors."},
  {id: 3, name: "Snake", detail: "Collect apples and answer ICT questions."},
  {id: 4, name: "Taxi Rush", detail: "Pick up passengers and answer fares."}
];

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
        <span className="brand-grid" aria-hidden="true"><i/><i/><i/><i/></span>
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
              <span className="home-logo-mark" aria-hidden="true"><i/><i/><i/><i/></span>
              <h1>ICT Arcade<span>.</span></h1>
            </div>
            <h2>Choose what to revise</h2>
            <a className="past-papers-link" href="https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-information-and-communication-technology-0417/past-papers/" target="_blank" rel="noopener noreferrer">
              <FileText size={18} strokeWidth={1.8}/> Past papers <ArrowUpRight size={17}/>
            </a>
          </section>

          <section className="course-choices" aria-label="Revision sections">
            <button className="course-choice" onClick={() => navigate("notes")}>
              <span className="course-preview theory-preview" aria-hidden="true">
                <span className="preview-sheet">
                  <span className="preview-heading">Computer systems</span>
                  <span><b>CPU</b> Processes instructions</span>
                  <span><b>RAM</b> Stores working data</span>
                  <span><b>ROM</b> Retains start-up instructions</span>
                </span>
              </span>
              <span className="course-choice-body">
                <span className="course-title-line"><BookOpen size={20}/><strong>Theory</strong><ArrowUpRight size={17}/></span>
                <span className="course-description">Notes and examples across 11 chapters and {theoryLessons.length} lessons.</span>
              </span>
            </button>
            <button className="course-choice" onClick={() => navigate("practical")}>
              <span className="course-preview practical-preview" aria-hidden="true">
                <span className="preview-practical">
                  <span>Documents</span><span>Spreadsheets</span><span>Web pages</span>
                </span>
              </span>
              <span className="course-choice-body">
                <span className="course-title-line"><Layers size={20}/><strong>Practical</strong><span className="coming-soon">Coming soon</span></span>
                <span className="course-description">Document production, databases, spreadsheets and websites.</span>
              </span>
            </button>
          </section>

          <section className="home-games">
            <div className="home-section-heading">
              <h2>Games</h2>
              <button className="all-games-link" onClick={() => navigate("games")}>All 11 games <ArrowRight size={16}/></button>
            </div>
            <div className="featured-games">
              {featuredGames.map(game => <button key={game.id} className="featured-game" onClick={() => navigate("games", game.id)}>
                <span className="featured-game-number">{formatNumber(game.id)}</span>
                <span className="featured-game-copy"><strong>{game.name}</strong><small>{game.detail}</small></span>
                <ArrowUpRight size={19}/>
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
