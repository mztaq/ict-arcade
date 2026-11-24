import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chapters} from "../src/content.js";

const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");

test("homepage presents separate theory and practical routes",()=>{
  assert.match(app,/What are you revising\?/);
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
  assert.match(app,/toggleTheme/);
  assert.match(app,/<Moon size=/);
  assert.match(app,/<Sun size=/);
});
test("rounded surfaces, keyboard focus, and mobile layout are present",()=>{
  assert.match(css,/\.course-choice\s*\{/);
  assert.match(css,/border-radius:13px/);
  assert.match(css,/\.header-theme/);
  assert.match(css,/\.course-choices\{grid-template-columns:1fr\}/);
  assert.match(css,/:focus-visible/);
});
