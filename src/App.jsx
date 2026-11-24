import React, {useEffect, useMemo, useState} from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck,
  Check, CheckCircle2, ChevronRight, ClipboardList, Eye, EyeOff,
  Gamepad2, Layers, Menu, Monitor, Moon, RotateCcw, Search, Sun, X
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
  return {page: parts[0] || "home", id: Number(parts[1]) || 1, lesson: Number(parts[2]) || 0};
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
function SectionHeader({tag, title, detail, action}) {
  return <div className="section-heading">
    <div>{tag && <span className="section-tag">{tag}</span>}<h2>{title}</h2>{detail && <p>{detail}</p>}</div>
    {action}
  </div>;
}
function ChapterRow({chapter, done, compact = false, onOpen}) {
  const progress = chapterProgress(chapter, done);
  return <button className={"chapter-row " + (compact ? "is-compact" : "")} onClick={onOpen}>
    <span className="chapter-index">{formatNumber(chapter.id)}</span>
    <span className="chapter-description">
      <span className="row-type">{chapter.unit} / {chapter.lessons.length} lessons</span>
      <strong>{chapter.title}</strong>
      {!compact && <span className="row-summary">{chapter.description}</span>}
    </span>
    <span className="chapter-status">
      <span>{progress === 100 ? "Complete" : progress === 0 ? "Not started" : progress + "% done"}</span>
      <span className="mini-progress"><span style={{width: progress + "%"}} /></span>
    </span>
    <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" />
  </button>;
}
function Title({eyebrow, title, description, action}) {
  return <div className="page-title">
    <div><span className="overline">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
    {action && <div className="title-action">{action}</div>}
  </div>;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useStored("ict-arcade-theme", "auto");
  const [done, setDone] = useStored("ict-arcade-lessons-done", []);
  const [bookmarks, setBookmarks] = useStored("ict-arcade-bookmarks", []);
  const [known, setKnown] = useStored("ict-arcade-mastered", []);
  const [lastRead, setLastRead] = useStored("ict-arcade-last-read", "1-0");
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

  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); setMenuOpen(false); window.scrollTo({top: 0, behavior: "smooth"}); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { if (route.page === "chapter") setLastRead(keyFor(route.id, route.lesson)); }, [route.page, route.id, route.lesson, setLastRead]);

  const chapter = chapters.find(ch => ch.id === route.id) || chapters[0];
  const lessonIndex = Math.max(0, Math.min(route.lesson, chapter.lessons.length - 1));
  const lesson = chapter.lessons[lessonIndex];
  const lessonKey = keyFor(chapter.id, lessonIndex);
  const validDone = done.filter(k => allLessons.some(l => keyFor(l.chapterId, l.index) === k));
  const overallPercent = Math.round(validDone.length / allLessons.length * 100);
  const nextLesson = allLessons.find(l => !done.includes(keyFor(l.chapterId, l.index))) || allLessons[0];
  const [lastChapterId, lastLessonIndex] = lastRead.split("-").map(Number);
  const recentChapter = chapters.find(c => c.id === lastChapterId);
  const resume = recentChapter && recentChapter.lessons[lastLessonIndex] && !done.includes(lastRead)
    ? {chapterId: lastChapterId, index: lastLessonIndex, title: recentChapter.lessons[lastLessonIndex].title}
    : {chapterId: nextLesson.chapterId, index: nextLesson.index, title: nextLesson.title};
  const bookmarkCount = bookmarks.filter(k => allLessons.some(l => keyFor(l.chapterId, l.index) === k)).length;

  const results = useMemo(() => chapters.filter(ch => {
    if (filter === "Theory" || filter === "Practical") { if (ch.unit !== filter) return false; }
    if (filter === "Saved" && !ch.lessons.some((_, i) => bookmarks.includes(keyFor(ch.id, i)))) return false;
    const searchable = [ch.title, ch.description, ...ch.lessons.flatMap(l => [l.title, ...l.points, l.example, ...l.terms.flat()])].join(" ").toLowerCase();
    return searchable.includes(search.trim().toLowerCase());
  }), [filter, search, bookmarks]);

  const quizItems = useMemo(() => quizChapter ? questions.filter(q => q.chapterId === quizChapter) : questions, [quizChapter]);
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

  const flashPool = useMemo(() => flashcards.filter(card => !flashChapter || card.chapterId === flashChapter), [flashChapter]);
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
  const nav = [
    {page: "home", label: "Overview", icon: BookOpen},
    {page: "notes", label: "Notes", icon: Layers},
    {page: "practice", label: "Questions", icon: ClipboardList},
    {page: "flashcards", label: "Flashcards", icon: RotateCcw},
    {page: "games", label: "Games", icon: Gamepad2}
  ];
  const activePage = route.page === "chapter" ? "notes" : route.page;
  const pageLabel = route.page === "chapter" ? chapter.title : nav.find(item => item.page === route.page)?.label || "Overview";

  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <aside className={"site-sidebar " + (menuOpen ? "open" : "")} aria-label="Site navigation">
      <button className="brand" onClick={() => navigate("home")} aria-label="ICT Arcade home">
        <span className="brand-grid" aria-hidden="true"><i /><i /><i /><i /></span>
        <span>ICT<span className="brand-second">ARCADE</span><small>REVISION / 0417</small></span>
      </button>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Study sections">
        {nav.map(({page, label, icon: Icon}, index) => <button key={page} className={"nav-item " + (activePage === page ? "active" : "")} aria-current={activePage === page ? "page" : undefined} onClick={() => navigate(page)}>
          <span className="nav-order">{formatNumber(index + 1)}</span><Icon size={18} strokeWidth={1.7} aria-hidden="true"/><span>{label}</span>
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-completion">
          <span className="meta-label">LESSONS FINISHED</span>
          <div className="completion-value"><strong>{validDone.length}<span> / {allLessons.length}</span></strong><span>{overallPercent}%</span></div>
          <Progress value={overallPercent} label="Overall revision progress"/>
        </div>
        <div className="appearance"><span className="meta-label">APPEARANCE</span>
          <div className="theme-options" role="group" aria-label="Colour theme">
            {[["auto", Monitor], ["light", Sun], ["dark", Moon]].map(([value, Icon]) => <button key={value} className={theme === value ? "selected" : ""} onClick={() => setTheme(value)} aria-label={value === "auto" ? "Use system theme" : "Use " + value + " theme"} aria-pressed={theme === value} title={value}><Icon size={16}/></button>)}
          </div>
        </div>
      </div>
    </aside>

    <div className="site-body">
      <header className="site-header">
        <div className="header-left"><button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21}/></button><span>ICT ARCADE</span><span className="header-divider">/</span><span className="header-location">{pageLabel}</span></div>
        <span className="header-right">CAMBRIDGE IGCSE <span>0417 / 0983</span></span>
      </header>
      <main id="main-content" className="site-main">

        {route.page === "home" && <>
          <section className="home-lead">
            <div className="home-lead-main">
              <span className="overline">CAMBRIDGE IGCSE ICT / STUDY SPACE</span>
              <h1>Understand the topic.<br/><span>Then prove it.</span></h1>
              <p>Work through Cambridge IGCSE ICT topics with clear notes and examples, then check your understanding with questions, flashcards and the original arcade games.</p>
              <button className="primary-action" onClick={() => navigate("notes")}>Explore the course <ArrowRight size={18}/></button>
            </div>
            <aside className="next-up">
              <div className="next-up-top"><span className="overline">CONTINUE READING</span><BookOpen size={20} aria-hidden="true"/></div>
              <div className="next-code">{formatNumber(resume.chapterId)}<span>.{formatNumber(resume.index + 1)}</span></div>
              <h2>{resume.title}</h2>
              <p>{chapterName(resume.chapterId)}</p>
              <button className="underlined-action" onClick={() => navigate("chapter", resume.chapterId, resume.index)}>Open lesson <ArrowRight size={17}/></button>
              <div className="next-progress"><span>{validDone.length} of {allLessons.length} lessons finished</span><Progress value={overallPercent} label="Course completion"/></div>
            </aside>
          </section>

          <div className="course-facts" aria-label="Course resources">
            <div><b>21</b><span>CHAPTERS</span></div>
            <div><b>{allLessons.length}</b><span>LESSONS</span></div>
            <div><b>{questions.length}</b><span>QUICK QUESTIONS</span></div>
            <div><b>11</b><span>ARCADE GAMES</span></div>
          </div>

          <div className="home-content">
            <section className="home-chapters">
              <SectionHeader tag="COURSE INDEX" title="Start with a chapter" action={<button className="link-action" onClick={() => navigate("notes")}>All 21 chapters <ArrowRight size={16}/></button>}/>
              <div className="chapter-list">{chapters.slice(0, 6).map(ch => <ChapterRow key={ch.id} chapter={ch} done={done} compact onOpen={() => navigate("chapter", ch.id, 0)} />)}</div>
            </section>
            <aside className="home-toolbox">
              <SectionHeader tag="STUDY TOOLS" title="Choose how to revise"/>
              <button className="study-tool" onClick={() => navigate("practice")}><span className="tool-number">01</span><span><strong>Answer questions</strong><small>{questions.length} checks with explanations and written practice</small></span><ArrowUpRight size={20}/></button>
              <button className="study-tool" onClick={() => navigate("flashcards")}><span className="tool-number">02</span><span><strong>Test definitions</strong><small>{flashcards.length} key terms to recall</small></span><ArrowUpRight size={20}/></button>
              <button className="study-tool" onClick={() => navigate("games")}><span className="tool-number">03</span><span><strong>Play the arcade</strong><small>Eleven original games with topic questions</small></span><ArrowUpRight size={20}/></button>
              <div className="study-note"><span className="meta-label">ONE USEFUL HABIT</span><p>Read a lesson, explain it in your own words, then answer questions without checking your notes.</p></div>
            </aside>
          </div>
        </>}

        {route.page === "notes" && <>
          <Title eyebrow="COURSE LIBRARY / 21 CHAPTERS" title="Revision notes" description="Follow the syllabus from computer systems to website authoring. Each chapter includes explanations, examples and the terms you need to know." />
          <div className="library-toolbar">
            <label className="search-field"><Search size={18} aria-hidden="true"/><span className="sr-only">Search topics</span><input placeholder="Search topics, terms or examples" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={16}/></button>}</label>
            <div className="filter-list" role="group" aria-label="Filter chapters">
              {["All", "Theory", "Practical", "Saved"].map(value => <button key={value} onClick={() => setFilter(value)} className={filter === value ? "selected" : ""} aria-pressed={filter === value}>{value}{value === "Saved" && bookmarkCount > 0 ? " (" + bookmarkCount + ")" : ""}</button>)}
            </div>
          </div>
          <div className="result-summary"><span>{results.length} chapters</span><span>{results.reduce((total, ch) => total + ch.lessons.length, 0)} lessons</span></div>
          {results.length ? ["Theory", "Practical"].map(unit => {
            const listing = results.filter(ch => ch.unit === unit);
            return listing.length ? <section className="library-section" key={unit}>
              <div className="library-heading"><span className="section-tag">{unit === "Theory" ? "PART ONE / 01–11" : "PART TWO / 12–21"}</span><h2>{unit}</h2></div>
              <div className="chapter-list">{listing.map(ch => <ChapterRow key={ch.id} chapter={ch} done={done} onOpen={() => {
                const savedIndex = ch.lessons.findIndex((_, index) => !done.includes(keyFor(ch.id, index)));
                navigate("chapter", ch.id, savedIndex === -1 ? 0 : savedIndex);
              }}/>)}</div>
            </section> : null;
          }) : <div className="empty-results"><Search size={26}/><h2>No chapters found</h2><p>Try another term or switch to All chapters.</p><button className="secondary-action" onClick={() => {setFilter("All"); setSearch("");}}>Clear filters</button></div>}
        </>}

        {route.page === "chapter" && <>
          <button className="back-link" onClick={() => navigate("notes")}><ArrowLeft size={16}/> Back to all chapters</button>
          <div className="chapter-heading"><span className="overline">{chapter.unit.toUpperCase()} / CHAPTER {formatNumber(chapter.id)}</span><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
          <div className="reading-layout">
            <aside className="lesson-index" aria-label="Lessons in chapter">
              <div className="lesson-index-heading"><span className="meta-label">LESSONS</span><span>{chapterProgress(chapter, done)}% done</span></div>
              <Progress value={chapterProgress(chapter, done)} label="Chapter completion"/>
              <nav>{chapter.lessons.map((entry, i) => <button key={entry.title} className={"lesson-link " + (i === lessonIndex ? "active" : "")} onClick={() => navigate("chapter", chapter.id, i)} aria-current={i === lessonIndex ? "page" : undefined}>
                <span>{done.includes(keyFor(chapter.id, i)) ? <Check size={15}/> : formatNumber(i + 1)}</span><span>{entry.title}</span>
              </button>)}</nav>
            </aside>
            <article className="reading-article">
              <div className="article-topline"><span className="meta-label">LESSON {formatNumber(lessonIndex + 1)} / {formatNumber(chapter.lessons.length)}</span><button onClick={toggleBookmark} className="bookmark-button" aria-label={bookmarks.includes(lessonKey) ? "Remove lesson bookmark" : "Bookmark lesson"} aria-pressed={bookmarks.includes(lessonKey)}>{bookmarks.includes(lessonKey) ? <BookmarkCheck size={19}/> : <Bookmark size={19}/>}<span>{bookmarks.includes(lessonKey) ? "Saved" : "Save"}</span></button></div>
              <h2>{lesson.title}</h2>
              <div className="article-rule"/>
              <h3>Key ideas</h3>
              <ol className="concepts">{lesson.points.map((point, i) => <li key={i}><span className="concept-count">{formatNumber(i + 1)}</span><span>{point}</span></li>)}</ol>
              <section className="lesson-highlight example"><span className="meta-label">IN PRACTICE</span><h3>A real example</h3><p>{lesson.example}</p></section>
              <section className="lesson-highlight exam"><span className="meta-label">EXAM TECHNIQUE</span><h3>What to remember</h3><p>{lesson.tip}</p></section>
              {lesson.terms.length > 0 && <section className="definitions"><h3>Definitions to learn</h3><dl>{lesson.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></section>}
              <div className="article-actions"><button className={done.includes(lessonKey) ? "done-action" : "primary-action"} onClick={toggleDone}>{done.includes(lessonKey) ? <CheckCircle2 size={17}/> : <Check size={17}/>} {done.includes(lessonKey) ? "Completed" : "Mark as studied"}</button>
                <div className="article-next">{lessonIndex > 0 && <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex - 1)}><ArrowLeft size={16}/> Previous</button>}{lessonIndex + 1 < chapter.lessons.length ? <button className="secondary-action" onClick={() => navigate("chapter", chapter.id, lessonIndex + 1)}>Next lesson <ArrowRight size={16}/></button> : <button className="secondary-action" onClick={() => {startQuiz(chapter.id); navigate("practice");}}>Test this chapter <ArrowRight size={16}/></button>}</div>
              </div>
            </article>
          </div>
        </>}

        {route.page === "practice" && <>
          <Title eyebrow="EXAM PREPARATION" title="Practice questions" description="Check what you know and see the reasoning behind each answer. For longer questions, write your response before viewing the guidance." />
          <div className="mode-tabs" role="tablist" aria-label="Practice type">
            <button role="tab" aria-selected={practiceType === "choice"} className={practiceType === "choice" ? "active" : ""} onClick={() => setPracticeType("choice")}>Quick questions</button>
            <button role="tab" aria-selected={practiceType === "written"} className={practiceType === "written" ? "active" : ""} onClick={() => setPracticeType("written")}>Written answers</button>
          </div>
          {practiceType === "choice" ? <>
            <div className="practice-toolbar"><label>CHAPTER<select aria-label="Choose question chapter" value={quizChapter} onChange={e => startQuiz(Number(e.target.value))}><option value={0}>All chapters</option>{chapters.map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{quizScore} correct · {quizIndex + (picked !== null ? 1 : 0)} answered</span></div>
            {finished ? <div className="quiz-finish"><span className="overline">PRACTICE COMPLETE</span><h2>{quizScore} <span>/ {quizItems.length}</span></h2><p>{quizScore === quizItems.length ? "All correct. Try a different topic or move to written answers." : "Review the notes for any answers you missed, then try another round."}</p><div><button className="primary-action" onClick={() => startQuiz(quizChapter)}><RotateCcw size={16}/> Try again</button><button className="secondary-action" onClick={() => navigate("notes")}>Open notes <ArrowRight size={16}/></button></div></div> :
            <div className="question-paper"><div className="question-progress"><span>QUESTION {formatNumber(quizIndex + 1)} OF {formatNumber(quizItems.length)}</span><span>{chapterName(quizQuestion.chapterId)}</span></div><Progress value={(quizIndex + 1) / quizItems.length * 100} label="Question progress"/><h2>{quizQuestion.question}</h2>
              <div className="option-list">{options.map(({text, value}, i) => <button key={text} disabled={picked !== null} aria-pressed={picked === value} onClick={() => pickAnswer(value)} className={"answer-button " + (picked !== null && value === 0 ? "correct" : "") + (picked === value && value !== 0 ? " incorrect" : "")}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{picked !== null && value === 0 && <CheckCircle2 size={18}/>}</button>)}</div>
              {picked !== null && <div className="answer-explanation" role="status"><strong>{picked === 0 ? "Correct" : "Review this answer"}</strong><p>{quizQuestion.why}</p><button className="primary-action" onClick={nextQuestion}>{quizIndex + 1 === quizItems.length ? "See results" : "Next question"} <ArrowRight size={16}/></button></div>}
            </div>}
          </> : <>
            <div className="practice-toolbar"><label>QUESTION<select value={writtenIndex} aria-label="Choose written question" onChange={e => {setWrittenIndex(Number(e.target.value)); setShowMarking(false);}}>{writtenQuestions.map((q, i) => <option key={i} value={i}>Q{formatNumber(i + 1)} / Chapter {q.chapterId}</option>)}</select></label><span>{writtenQuestion.marks} marks available</span></div>
            <div className="question-paper written-paper"><div className="question-progress"><span>LONG-ANSWER QUESTION {formatNumber(writtenIndex + 1)}</span><span>CHAPTER {formatNumber(writtenQuestion.chapterId)}</span></div><h2>{writtenQuestion.prompt}</h2>
              <label htmlFor="written-response" className="text-area-label">YOUR RESPONSE</label>
              <textarea id="written-response" rows={7} placeholder="Write your answer here before revealing the suggested marking points." value={drafts[writtenIndex] || ""} onChange={e => setDrafts(old => ({...old, [writtenIndex]: e.target.value}))}/>
              <div className="draft-controls"><span>{words} words · Saved on this device</span><button className="plain-action" onClick={() => setDrafts(old => ({...old, [writtenIndex]: ""}))} disabled={!drafts[writtenIndex]}>Clear answer</button></div>
              <button className="secondary-action" onClick={() => setShowMarking(v => !v)}>{showMarking ? <EyeOff size={16}/> : <Eye size={16}/>} {showMarking ? "Hide answer guidance" : "View answer guidance"}</button>
              {showMarking && <div className="marking-guidance"><strong>Indicative points</strong><p>Original revision guidance, not an official mark scheme. Compare these points with your own response.</p><ol>{writtenQuestion.points.map((point, i) => <li key={i}>{point}</li>)}</ol></div>}
            </div>
          </>}
        </>}

        {route.page === "flashcards" && <>
          <Title eyebrow="RECALL PRACTICE" title="Flashcards" description="Try to define the term yourself. Turn the card to check, then keep moving through the set."/>
          <div className="practice-toolbar"><label>CHAPTER<select aria-label="Choose flashcard chapter" value={flashChapter} onChange={e => selectFlashChapter(Number(e.target.value))}><option value={0}>All chapters</option>{chapters.map(ch => <option key={ch.id} value={ch.id}>{formatNumber(ch.id)} / {ch.title}</option>)}</select></label><span>{knownInPool} of {flashPool.length} known</span></div>
          {currentFlash && <>
            <div className="flash-progress"><span>CARD {formatNumber(flashIndex % flashPool.length + 1)} / {formatNumber(flashPool.length)}</span><span>{chapterName(currentFlash.chapterId)}</span></div>
            <button className={"revision-card " + (flipped ? "is-flipped" : "")} onClick={() => setFlipped(v => !v)} aria-label={flipped ? "Show term" : "Reveal definition"}><span className="meta-label">{flipped ? "DEFINITION" : "TERM"}</span><strong>{flipped ? currentFlash.definition : currentFlash.term}</strong><span className="flash-turn"><RotateCcw size={17}/> {flipped ? "Show term" : "Reveal answer"}</span></button>
            <div className="flash-controls"><button className="secondary-action" onClick={advanceFlash}>Review later <ArrowRight size={16}/></button><button className="primary-action" onClick={() => {setKnown(prev => prev.includes(currentFlash.term) ? prev : [...prev, currentFlash.term]); advanceFlash();}}><Check size={17}/> I knew this</button></div>
            <p className="flash-caption">Cards marked as known stay recorded in this browser. Keep reviewing them for long-term recall.</p>
          </>}
        </>}

        {route.page === "games" && <>
          <Title eyebrow="THE ORIGINAL ICT ARCADE" title="Games" description="Eleven original games, each with ICT questions built into play. Scores and controls work the same way as before." action={<a className="secondary-action" href="/arcade-legacy.html" target="_blank" rel="noopener noreferrer">Play full screen <ArrowUpRight size={17}/></a>}/>
          <div className="game-note"><Gamepad2 size={20}/><span>Choose a topic inside the arcade. Your saved game score stays in this browser.</span></div>
          <iframe title="ICT Arcade original games" src="/arcade-legacy.html" className="arcade-frame" allow="fullscreen" loading="eager"/>
        </>}

      </main>
      <footer className="site-footer"><span>ICT ARCADE © {new Date().getFullYear()}</span><span>Independent Cambridge IGCSE ICT study resource</span></footer>
    </div>
  </div>;
}
export default App;
