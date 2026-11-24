import assert from "node:assert/strict";
import {chromium} from "playwright";

// Browser-level checks for horizontal overflow and overlapping key interface regions.
const origin="http://127.0.0.1:4173";
const sizes=[320,390,768,1280];
const routes=["home","notes","chapter/1/0","practice","flashcards","practical","games"];
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
      const findings=await page.evaluate(pairs=>{
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
        return {vw,full,overlaps};
      },pairs);
      assert.ok(findings.full<=findings.vw+2,
        width+"px / "+route+": horizontal overflow "+(findings.full-findings.vw)+"px");
      assert.deepEqual(findings.overlaps,[],width+"px / "+route+": overlapping interface");
      console.log("PASS "+width+"px / "+route);
    }
    await page.close();
  }
}finally{
  await browser.close();
}
