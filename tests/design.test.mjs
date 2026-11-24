import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const arcade = readFileSync(new URL("../public/arcade-legacy.html", import.meta.url), "utf8");

test("readable study typography avoids decoration and external font dependencies", () => {
  // Decorative illustrations are allowed to use theme-token gradients, not study surfaces.
  const studyCss = css.replace(/\.papers-home-card \.papers-(?:home|solved)-art\{[^}]*\}/g, "");
  assert.doesNotMatch(studyCss, /(?:linear|radial|conic)-gradient\s*\(/i);
  assert.doesNotMatch(css, /backdrop-filter\s*:/i);
  assert.doesNotMatch(css, /\bInter\b/);
  assert.match(css, /font-family:system-ui/);
  assert.match(css, /"Segoe UI"/);
  assert.doesNotMatch(css, /Trebuchet MS/);
  assert.match(css, /body\{[^}]*font-size:17px/);
  assert.match(css, /\.concepts li\{[^}]*font-size:17px/);
  assert.match(css, /\.lesson-link\{[^}]*font-size:16px/);
  assert.match(css, /\.answer-button\{[^}]*font-size:17px/);
  assert.doesNotMatch(css, /\.site-sidebar/);
  assert.doesNotMatch(css, /\.top-nav/);
  assert.match(css, /\.past-papers-link/);
  assert.match(css, /\.featured-games/);
  assert.match(css, /\.games-hub-card/);
  assert.match(css, /\.home-circuit-backdrop/);
  assert.match(css, /\.circuit-signals/);
  assert.doesNotMatch(css, /\.hero-motion/);
  assert.match(css, /\.examiner-advice/);
  assert.doesNotMatch(css, /\.advice-source/);
  assert.match(css, /\.lesson-icon/);
  assert.match(css, /\.chapter-stats/);
  assert.match(css, /\.chapter-back-button/);
  assert.doesNotMatch(css, /\.lesson-link\{[^}]*border-bottom/);
  assert.match(css, /--space-4:24px/);
  assert.doesNotMatch(css, /\.start-learning/);
  assert.doesNotMatch(app, /home-intro-detail/);
  assert.match(css, /--accent:#315db3/);
  assert.match(css, /--canvas:#f7f9fc/);
  assert.doesNotMatch(css,/--hero-bg:|\.preview-sheet/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-color-scheme/);
  assert.match(css, /:focus-visible/);
});
test("study interface includes real navigation, results, and persisted drafts", () => {
  assert.match(app, /getElementById\("main-content"\)\?\.focus\(\)/);
  assert.match(app, /tabIndex=\{-1\}/);
  assert.match(app, /setDrafts/);
  assert.match(app, /role="status"/);
  assert.match(app, /className="quiz-finish"/);
  assert.match(app, /quizScore/);
  assert.match(app, /BookmarkCheck/);
  assert.match(app, /aria-label="Filter chapters"/);
});
test("legacy arcade game entry stays reachable without decorative emoji icons", () => {
  assert.match(app, /arcade-legacy\.html/);
  assert.match(app, /route\.game > 0/);
  assert.match(app, /arcade-legacy\.html\?game=/);
  assert.match(arcade, /class="game-index"/);
  assert.doesNotMatch(arcade, /<span>\$\{g\[0\]\}<\/span>/);
  assert.doesNotMatch(arcade, /<h1>\$\{g\[0\]\}/);
  for (const game of ["plat", "dun", "snake", "taxi", "flap", "stack", "climb", "invade", "brick", "duel", "shop"]) {
    assert.match(arcade, new RegExp("function " + game + "\\("));
  }
});

test("brand symbol has no letter shapes or embedded text",()=>{
  const svg=readFileSync(new URL("../public/ict-arcade-mark.svg", import.meta.url),"utf8");
  assert.doesNotMatch(svg,/<text[\s>]/i);
  assert.doesNotMatch(svg,/<path\s/i);
  assert.doesNotMatch(svg,/<circle\s/i);
  assert.equal((svg.match(/<rect\s/g)||[]).length,5);
  assert.match(svg,/fill="#A7CAFF"/);
  assert.doesNotMatch(app, /ICT Arcade<span>\.<\/span>/);
});
