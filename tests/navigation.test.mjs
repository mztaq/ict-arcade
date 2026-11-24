import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chapters} from "../src/content.js";

const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");

test("homepage presents separate theory and practical routes",()=>{
  assert.match(app,/Choose what to revise/);
  assert.match(app,/ICT Arcade<span>/);
  assert.match(app,/className="course-choices"/);
  assert.match(app,/navigate\("notes"\)/);
  assert.match(app,/navigate\("practical"\)/);
  assert.match(app,/Coming soon/);
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
  assert.match(app,/className="featured-games"/);
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
  assert.match(app,/featured-game-large/);
});
