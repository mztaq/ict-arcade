import test from "node:test";
import assert from "node:assert/strict";
import {chapters,allLessons,flashcards} from "../src/content.js";
import {questions,writtenQuestions} from "../src/questions.js";

test("coursebook structure includes eleven theory and ten practical chapters",()=>{
 assert.equal(chapters.length,21);
 assert.equal(chapters.filter(ch=>ch.unit==="Theory").length,11);
 assert.equal(chapters.filter(ch=>ch.unit==="Practical").length,10);
 assert.deepEqual(chapters.map(c=>c.id),Array.from({length:21},(_,i)=>i+1));
});
test("every chapter contains original notes and examples",()=>{
 assert.ok(allLessons.length>=50);
 for(const ch of chapters){
  assert.ok(ch.lessons.length>0);
  for(const l of ch.lessons){assert.ok(l.title.length>4);assert.ok(l.points.length>=2);assert.ok(l.example.length>15);assert.ok(l.tip.length>10);assert.ok(Array.isArray(l.terms));}
 }
});
test("questions have four distinct answers and usable explanations",()=>{
 assert.ok(questions.length>=70);
 for(const q of questions){assert.ok(chapters.some(c=>c.id===q.chapterId));assert.equal(q.answers.length,4);assert.equal(new Set(q.answers).size,4);assert.ok(q.why.length>15);}
 assert.ok(chapters.every(c=>questions.some(q=>q.chapterId===c.id)));
});
test("written questions and flashcards provide revision material",()=>{
 assert.ok(writtenQuestions.length>=10);
 assert.ok(flashcards.length>=25);
 for(const q of writtenQuestions){assert.ok(q.marks>=2);assert.ok(q.points.length>=2);}
});
