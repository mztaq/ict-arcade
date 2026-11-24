import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chapters} from "../src/content.js";

const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");

test("homepage presents separate theory and practical routes",()=>{
  assert.match(app,/Learn ICT step by step/);
  assert.doesNotMatch(app,/Start with the basics, practise as you go/);
  assert.match(app,/function HeroMotion\(\)/);
  assert.match(app,/Input<\/span>/);
  assert.match(app,/Process<\/span>/);
  assert.match(app,/Output<\/span>/);
  assert.match(app,/<h1>ICT Arcade<\/h1>/);
  assert.match(app,/<span className="header-brand-name">ICT Arcade<\/span>/);
  assert.match(app,/className="course-choices"/);
  assert.match(app,/href="#\/notes"/);
  assert.match(app,/href="#\/practical"/);
  assert.match(app,/Coming soon/);
  assert.match(app,/<strong>Theory<\/strong>/);
  assert.match(app,/<Title title="Theory"/);
  assert.match(app,/<strong>Practical<\/strong>/);
  assert.match(app,/className="games-hub-card"/);
  assert.match(app,/Browse all 11 ICT Arcade games/);
  assert.match(app,/Try past papers/);
  assert.equal(chapters.filter(ch=>ch.unit==="Theory").length,11);
  assert.equal(chapters.filter(ch=>ch.unit==="Practical").length,10);
});
test("unreleased practical lessons do not appear in theory navigation",()=>{
  assert.match(app,/if \(ch\.unit !== "Theory"\) return false/);
  assert.match(app,/route\.page === "chapter" && chapter\.unit === "Theory"/);
  assert.match(app,/route\.page === "chapter" && chapter\.unit !== "Theory"/);
  assert.match(app,/theoryChapters\.map/);
  assert.match(app,/theoryQuestions/);
  assert.match(app,/theoryFlashcards/);
  assert.doesNotMatch(app, /New to ICT\? Start with Chapter 1/);
  assert.doesNotMatch(app, /className="start-learning"/);
});
test("interface removes redundant breadcrumb and appearance settings",()=>{
  assert.doesNotMatch(app,/header-divider/);
  assert.doesNotMatch(app,/header-location/);
  assert.doesNotMatch(app,/className="appearance"/);
  assert.doesNotMatch(app,/className="sidebar-section-label"/);
  assert.doesNotMatch(app,/className="overline"/);
  assert.match(app,/className="header-theme"/);
  assert.match(app,/className="home-intro"/);
  assert.match(app,/className="home-logo-mark"/);
  assert.match(app,/ict-arcade-mark\.svg/);
  assert.match(app,/function TheoryPreview\(\)/);
  assert.match(app,/function PracticalPreview\(\)/);
  assert.match(app,/function ArcadeVisual\(\{id\}\)/);
  assert.doesNotMatch(app,/className="top-nav"/);
  assert.match(app,/className="past-papers-link"/);
  assert.match(app,/cambridgeinternational\.org\/programmes-and-qualifications/);
  assert.match(app,/className="games-hub-card"/);
  assert.match(app,/href="#\/games"/);
  assert.match(app,/className="featured-games games-page-grid"/);
  assert.match(app,/href=\{"#\/games\/"\+game\.id\}/);
  assert.match(app,/const arcadeGames = \[/);
  assert.equal((app.match(/\{id: \d+, name:/g)||[]).length,11);
  assert.doesNotMatch(app,/site-sidebar|mobile-backdrop|menu-trigger/);
  assert.match(app,/toggleTheme/);
  assert.match(app,/<Moon size=/);
  assert.match(app,/<Sun size=/);
});
test("rounded surfaces, keyboard focus, and mobile layout are present",()=>{
  assert.match(css,/\.course-choice\s*\{/);
  assert.match(css,/border-radius:15px/);
  assert.match(css,/\.header-theme/);
  assert.match(css,/\.course-choices\{grid-template-columns:1fr/);
  assert.match(css,/:focus-visible/);
});

test("individual game links lead to the matching original game",()=>{
  const arcade=readFileSync(new URL("../public/arcade-legacy.html",import.meta.url),"utf8");
  assert.match(app,/route\.game > 0/);
  assert.match(app,/arcade-legacy\.html\?game=/);
  assert.match(arcade,/function openRequestedGame\(\)/);
  assert.match(arcade,/Number\.isInteger\(requested\)/);
  assert.match(arcade,/intro\(requested-1\)/);
  assert.match(arcade,/load\(n\);openRequestedGame\(\)/);
});

test("home previews are grounded in course material and games have unique artwork",()=>{
  assert.match(app,/const section=chapters\[3\]\.lessons\[1\]/);
  assert.match(app,/section\.terms\.slice\(0,2\)/);
  assert.match(app,/=SUM\(D2:D4\)/);
  assert.match(app,/const backgrounds = \[/);
  for(let i=1;i<=11;i++)assert.match(app,new RegExp("id==="+i+"&&"));
  assert.match(app,/games-hub-preview/);
  assert.match(app,/games-page-grid/);
});

test("notes layout includes a clean contents list and author-controlled examiner advice",()=>{
  const adviceSource=readFileSync(new URL("../src/examinerAdvice.js",import.meta.url),"utf8");
  assert.match(app,/className="reading-layout"/);
  assert.match(app,/Contents/);
  assert.match(app,/Key points/);
  assert.match(app,/Exam tip/);
  assert.match(app,/Exam advice/);
  assert.match(app,/examinerAdvice\[lessonKey\]/);
  assert.match(app,/advice\.points\.map/);
  assert.doesNotMatch(app,/Reference notes/);
  assert.doesNotMatch(app,/className="advice-source"/);
  assert.doesNotMatch(app,/Based on Save My Exams/);
  assert.match(adviceSource,/export const examinerAdvice = \{/);
  assert.doesNotMatch(app,/New to ICT\? Start here/);
});

test("lesson counts have clear visual hierarchy",()=>{
  assert.match(app,/className="course-stats"/);
  assert.match(app,/className="chapter-stats"/);
  assert.match(app,/className="chapter-lessons"/);
  assert.match(app,/className="theory-total"/);
  assert.match(css,/\.course-stats strong\{font-size:30px/);
  assert.match(css,/\.chapter-lessons strong\{font-size:29px/);
  assert.doesNotMatch(css,/\.chapter-status\{|\.mini-progress\{/);
  assert.match(css,/\.practice-toolbar\{[^}]*flex-wrap:wrap/);
});

test("lesson back button sits beside the chapter heading and contents items use no dividers",()=>{
  assert.match(app,/<div className="chapter-heading">\s*<h1>\{chapter\.title\}<\/h1>\s*<button type="button" className="chapter-back-button"/);
  assert.match(css,/\.chapter-back-button\{/);
  assert.match(css,/\.chapter-heading\{display:flex;align-items:center;justify-content:space-between/);
  assert.match(css,/\.lesson-index nav\{display:flex;flex-direction:column;gap:4px;border:0\}/);
  assert.match(css,/\.lesson-link\{[^}]*border:0;[^}]*border-radius:8px/);
  assert.doesNotMatch(app,/className="back-link"/);
});

test("every Theory lesson has a distinct topic-specific outline icon",()=>{
  assert.match(app,/const chapterIcons = \{/);
  assert.match(app,/className="chapter-index"><ChapterIcon/);
  assert.match(app,/const LessonIcon = lessonIcons\[chapter\.id\]\?\.\[i\]/);
  assert.match(app,/className=\{"lesson-icon "/);
  assert.match(app,/className="lesson-check"/);
  const block=app.match(/const lessonIcons = \{([\s\S]*?)\n\};/);
  assert.ok(block,"Topic icon configuration must exist");
  const mapping=new Map([...block[1].matchAll(/^\s*(\d+):\s*\[([^\]]+)\]/gm)].map(match=>
    [Number(match[1]),match[2].split(",").map(name=>name.trim()).filter(Boolean)]
  ));
  const theory=chapters.filter(ch=>ch.unit==="Theory");
  assert.equal(mapping.size,theory.length);
  for(const chapter of theory){
    const icons=mapping.get(chapter.id);
    assert.ok(icons,"Missing icons for chapter "+chapter.id);
    assert.equal(icons.length,chapter.lessons.length,chapter.title);
    assert.equal(new Set(icons).size,icons.length,"Repeated icon in "+chapter.title);
  }
  assert.doesNotMatch(app,/className="chapter-index">\{formatNumber\(chapter\.id\)\}/);
  assert.doesNotMatch(app,/formatNumber\(i \+ 1\)\}<\/span><span>\{entry\.title\}/);
  assert.match(css,/\.lesson-icon\{/);
  assert.match(css,/\.lesson-link\.active \.lesson-icon\{/);
});
