import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {yearlyPastPapers,solvedPastPapers} from "../src/pastPapers.js";

const publicFolder=new URL("../public/",import.meta.url);
const pdfFields=["questionPaper","markScheme","examinerReport"];
function checkFileUrl(url,folder,extensions){
  assert.equal(typeof url,"string");
  // Enforce a same-origin static file without redirects, traversal or query fragments.
  const allowed=new RegExp("^/"+folder+"/[a-zA-Z0-9_-]+(?:/[a-zA-Z0-9_.-]+)*\\.("+extensions+")$","i");
  assert.match(url,allowed,"Only local authorised documents are permitted");
  assert.doesNotMatch(url,/\.\.|\/\//);
  const path=fileURLToPath(new URL("."+url,publicFolder));
  assert.ok(existsSync(path),"Missing listed file: "+url);
  assert.ok(statSync(path).isFile(),"Not a file: "+url);
}
function checkSourceFiles(sourceFiles,folder){
  assert.ok(Array.isArray(sourceFiles),"Source files must be a list");
  const urls=new Set();
  for(const file of sourceFiles){
    assert.ok(file.title?.trim(),"Source file title required");
    checkFileUrl(file.url,folder,"zip|csv|xlsx|xls|accdb|mdb|docx|pptx|html|css|js|txt|png|jpg|jpeg|pdf");
    assert.ok(!urls.has(file.url),"Duplicate source file URL");
    urls.add(file.url);
  }
}

test("yearly papers group locally hosted PDFs with source downloads",()=>{
  assert.deepEqual(yearlyPastPapers.map(item=>item.year),[2026,2025,2024,2023,2022,2021,2020]);
  for(const group of yearlyPastPapers){
    assert.equal(group.url,undefined,"Do not link to third-party archives");
    assert.ok(Array.isArray(group.papers));
    const seen=new Set();
    for(const paper of group.papers){
      assert.match(paper.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(!seen.has(paper.id),"Duplicate paper ID");
      seen.add(paper.id);
      assert.ok(paper.title?.trim(),"Paper title required");
      let resourceCount=0;
      for(const field of pdfFields){
        if(paper[field]){
          checkFileUrl(paper[field],"yearly-papers/"+group.year,"pdf");
          resourceCount++;
        }
      }
      const sources=paper.sourceFiles||[];
      checkSourceFiles(sources,"yearly-papers/"+group.year);
      assert.ok(resourceCount+sources.length>0,"Do not list empty paper records");
    }
  }
});

test("solved papers preview locally hosted PDFs for Papers 2 and 3 only",()=>{
  assert.deepEqual(Object.keys(solvedPastPapers).sort(),["2","3"]);
  for(const papers of Object.values(solvedPastPapers)){
    assert.ok(Array.isArray(papers));
    const seen=new Set();
    for(const paper of papers){
      assert.match(paper.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(!seen.has(paper.id),"Duplicate solved paper ID");
      seen.add(paper.id);
      assert.ok(paper.title?.trim());
      checkFileUrl(paper.url,"solved-papers","pdf");
      checkSourceFiles(paper.sourceFiles||[],"solved-papers");
    }
  }
});
