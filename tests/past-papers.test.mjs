import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {yearlyPastPapers,solvedPastPapers} from "../src/pastPapers.js";

const publicFolder=new URL("../public/",import.meta.url);
function validateFile(entry,folder){
  assert.equal(typeof entry.title,"string");
  assert.ok(entry.title.trim(),"Paper title cannot be empty");
  assert.equal(typeof entry.url,"string");
  // Enforce same-origin paths and prevent directory traversal / external redirects.
  assert.match(entry.url,new RegExp("^/"+folder+"/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_.-]+)*\\.pdf$"));
  assert.doesNotMatch(entry.url,/\.\.|\/\//);
  const path=fileURLToPath(new URL("."+entry.url,publicFolder));
  assert.ok(existsSync(path),"Missing local paper PDF: "+entry.url);
  assert.ok(statSync(path).isFile(),"Paper must be a local file: "+entry.url);
}

test("yearly collection is local-only with no external archives",()=>{
  assert.deepEqual(yearlyPastPapers.map(item=>item.year),[2026,2025,2024,2023,2022,2021,2020]);
  for(const item of yearlyPastPapers){
    assert.equal(typeof item.url,"undefined","Year entries must not link externally");
    assert.ok(Array.isArray(item.papers));
    for(const paper of item.papers)validateFile(paper,"yearly-papers/"+item.year);
  }
});

test("solved collections allow only local author-supplied Papers 2 and 3",()=>{
  assert.deepEqual(Object.keys(solvedPastPapers).sort(),["2","3"]);
  for(const papers of Object.values(solvedPastPapers)){
    assert.ok(Array.isArray(papers));
    for(const paper of papers)validateFile(paper,"solved-papers");
  }
});
