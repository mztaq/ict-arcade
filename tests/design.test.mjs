import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const arcade = readFileSync(new URL("../public/arcade-legacy.html", import.meta.url), "utf8");

test("editorial interface avoids gradient blobs and default typeface", () => {
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient\s*\(/i);
  assert.doesNotMatch(css, /backdrop-filter\s*:/i);
  assert.doesNotMatch(css, /\bInter\b/);
  assert.match(css, /Trebuchet MS/);
  assert.doesNotMatch(css, /\.site-sidebar/);
  assert.doesNotMatch(css, /\.top-nav/);
  assert.match(css, /\.past-papers-link/);
  assert.match(css, /\.featured-games/);
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
  assert.match(app, /src="\/arcade-legacy\.html"/);
  assert.match(arcade, /class="game-index"/);
  assert.doesNotMatch(arcade, /<span>\$\{g\[0\]\}<\/span>/);
  assert.doesNotMatch(arcade, /<h1>\$\{g\[0\]\}/);
  for (const game of ["plat", "dun", "snake", "taxi", "flap", "stack", "climb", "invade", "brick", "duel", "shop"]) {
    assert.match(arcade, new RegExp("function " + game + "\\("));
  }
});
