import test from "node:test";
import assert from "node:assert/strict";
import {notFoundJokes} from "../src/notFoundJokes.js";
import {readFileSync} from "node:fs";

test("404 library contains exactly 500 unique nonempty jokes",()=>{
  assert.equal(notFoundJokes.length,500);
  assert.equal(new Set(notFoundJokes).size,500);
  for(const joke of notFoundJokes){
    assert.equal(typeof joke,"string");
    assert.ok(joke.trim().length>10);
  }
});
test("404 screen chooses a joke from the complete library",()=>{
  const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
  assert.match(app,/import \{notFoundJokes\} from "\.\/notFoundJokes\.js"/);
  assert.match(app,/notFoundJokes\[Math\.floor\(Math\.random\(\)\*notFoundJokes\.length\)\]/);
});
