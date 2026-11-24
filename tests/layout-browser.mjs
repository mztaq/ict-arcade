import assert from "node:assert/strict";
import {chromium} from "playwright";

// Browser-level checks for horizontal overflow and overlapping key interface regions.
const origin="http://127.0.0.1:4173";
const sizes=[320,390,768,1280];
const routes=["home","notes","chapter/1/0","chapter/6/4","chapter/11/1","practice","flashcards","practical","games"];
const minimumReadableSize={
  home:[[".home-intro h2",30],[".course-title-line strong",22],[".course-stats small",15]],
  notes:[[".chapter-description strong",16],[".chapter-lessons span",14]],
  "chapter/1/0":[[".concepts li",16],[".lesson-link",16],[".definitions dd",16]],
  practice:[[".answer-button",16],[".question-paper>h2",24]],
  flashcards:[[".revision-card strong",28]],
  games:[[".featured-game-copy strong",16]]
};
const pairs=[
  [".page-title h1",".title-action"],
  [".chapter-heading h1",".chapter-back-button"],
  [".chapter-row .chapter-description",".chapter-row .chapter-stats"],
  [".reading-layout .lesson-index",".reading-layout .reading-article"],
  [".course-choice .course-title-line strong",".course-choice .coming-soon"],
  [".home-signature",".header-theme"]
];
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
  for(const width of sizes){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
    for(const route of routes){
      const url=origin+"/#/"+route;
      await page.goto(url,{waitUntil:"networkidle",timeout:30000});
      await page.locator("#main-content").waitFor({state:"visible"});
      const findings=await page.evaluate(({pairs,checks})=>{
        const vw=document.documentElement.clientWidth;
        const full=document.documentElement.scrollWidth;
        const overlaps=[];
        for(const [one,two] of pairs){
          const a=document.querySelector(one);
          const b=document.querySelector(two);
          if(!a||!b)continue;
          const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();
          const width=Math.min(p.right,q.right)-Math.max(p.left,q.left);
          const height=Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top);
          if(width>2&&height>2)overlaps.push(one+" overlaps "+two+" by "+Math.round(width)+"x"+Math.round(height));
        }
        const tooSmall=[];
        for(const [selector,minimum] of checks){
          const element=document.querySelector(selector);
          if(!element)throw new Error("Missing readable element: "+selector);
          const size=parseFloat(getComputedStyle(element).fontSize);
          if(size<minimum)tooSmall.push(selector+" rendered at "+size+"px, expected "+minimum+"px");
        }
        return {vw,full,overlaps,tooSmall};
      },{pairs,checks:minimumReadableSize[route]||[]});
      assert.ok(findings.full<=findings.vw+2,
        width+"px / "+route+": horizontal overflow "+(findings.full-findings.vw)+"px");
      assert.deepEqual(findings.overlaps,[],width+"px / "+route+": overlapping interface");
      assert.deepEqual(findings.tooSmall,[],width+"px / "+route+": text too small");
      console.log("PASS "+width+"px / "+route);
    }
    await page.close();
  }
}finally{
  await browser.close();
}
