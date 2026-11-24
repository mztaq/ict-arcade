import test from "node:test";
import assert from "node:assert/strict";
import {chapters} from "../src/content.js";
import {examinerAdvice} from "../src/examinerAdvice.js";

test("every Theory lesson has one sourced, original exam advice entry",()=>{
  const theory=chapters.filter(ch=>ch.unit==="Theory");
  const expected=theory.flatMap(ch=>ch.lessons.map((_,index)=>ch.id+"-"+index));
  assert.equal(expected.length,35);
  assert.deepEqual(Object.keys(examinerAdvice).sort(),expected.sort());
  for(const [key,entry] of Object.entries(examinerAdvice)){
    assert.ok(entry&&typeof entry==="object",key);
    assert.ok(Array.isArray(entry.points)&&entry.points.length>=1,key);
    assert.ok(entry.points.every(tip=>typeof tip==="string"&&tip.length>40&&tip.length<260),key);
    assert.ok(typeof entry.source==="string"&&entry.source.startsWith("https://www.savemyexams.com/igcse/ict/cie/21/revision-notes/"),key);
  }
});

test("practical lessons have no fabricated advice",()=>{
  for(const chapter of chapters.filter(ch=>ch.unit==="Practical")){
    for(let i=0;i<chapter.lessons.length;i++){
      assert.equal(examinerAdvice[chapter.id+"-"+i],undefined);
    }
  }
});
