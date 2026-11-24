import test from "node:test";
import assert from "node:assert/strict";
import {archivePastPapersUrl,officialPastPapersUrl,yearlyPastPapers,solvedPastPapers} from "../src/pastPapers.js";

test("yearly past papers have verified public sources and clear scope",()=>{
  assert.match(officialPastPapersUrl,/^https:\/\/www\.cambridgeinternational\.org\//);
  assert.match(archivePastPapersUrl,/^https:\/\/www\.papermunch\.org\//);
  assert.deepEqual(yearlyPastPapers.map(entry=>entry.year),[2026,2025,2024,2023,2022,2021,2020]);
  for(const entry of yearlyPastPapers){
    assert.match(entry.url,/^https:\/\//);
    assert.ok(entry.year>=2020&&entry.year<=2026);
    if(entry.session)assert.equal(entry.session,"May/June");
  }
});

test("solved paper registry only includes Papers 2 and 3",()=>{
  assert.deepEqual(Object.keys(solvedPastPapers).sort(),["2","3"]);
  for(const papers of Object.values(solvedPastPapers)){
    assert.ok(Array.isArray(papers));
    for(const entry of papers){
      assert.ok(typeof entry.title==="string"&&entry.title.trim());
      assert.ok(typeof entry.url==="string"&&entry.url.trim());
      assert.match(entry.url,/^\/solved-papers\//,"Solved files must be hosted under the site's solved papers directory");
    }
  }
});
