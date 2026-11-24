import assert from "node:assert/strict";
import {chromium} from "playwright";

// Browser-level checks for horizontal overflow and overlapping key interface regions.
const origin="http://127.0.0.1:4173";
const sizes=[320,390,768,1280];
const routes=["home","past-papers","past-papers/yearly","past-papers/solved","past-papers/solved/2","past-papers/solved/3","notes","chapter/1/0","chapter/6/4","chapter/11/1","practice","flashcards","practical","games"];
const minimumReadableSize={
  home:[[".home-intro h2",26],[".course-title-line strong",22],[".course-stats small",15]],
  "past-papers":[[".paper-category strong",23]],
  "past-papers/yearly":[[".paper-year strong",21]],
  "past-papers/solved":[[".paper-category strong",23]],
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
      if(route==="home"){
        const hierarchy=await page.evaluate(()=>{
          const title=document.querySelector(".course-choice .course-title-line strong");
          const total=document.querySelector(".course-choice .course-stats strong");
          const heading=document.querySelector(".home-intro h2");
          const backdrop=document.querySelector(".home-circuit-backdrop");
          const brand=document.querySelector(".home-signature h1");
          return {
            titleSize:parseFloat(getComputedStyle(title).fontSize),
            totalSize:parseFloat(getComputedStyle(total).fontSize),
            headingWeight:parseFloat(getComputedStyle(heading).fontWeight),
            headingTracking:parseFloat(getComputedStyle(heading).letterSpacing),
            brandTracking:parseFloat(getComputedStyle(brand).letterSpacing),
            hasBackdrop:!!backdrop,
            boxRemoved:!document.querySelector(".hero-motion,.signal-chain")
          };
        });
        assert.ok(hierarchy.titleSize>=hierarchy.totalSize+3,
          width+"px: Theory card title must be larger than lesson totals");
        assert.ok(hierarchy.headingWeight<=650,
          width+"px: homepage headline is too bold");
        assert.ok(hierarchy.headingTracking>=0 && hierarchy.brandTracking>=0,
          width+"px: homepage letter spacing is too tight");
        assert.ok(hierarchy.hasBackdrop&&hierarchy.boxRemoved,
          width+"px: animated background should replace the boxed diagram");
      }
      if(route==="past-papers"){
        assert.equal(await page.locator(".paper-category").count(),2,"Past paper choice count");
        assert.equal(await page.locator('a[href="#/past-papers/yearly"]').count(),1);
        assert.equal(await page.locator('a[href="#/past-papers/solved"]').count(),1);
      }
      if(route==="past-papers/yearly"){
        assert.equal(await page.locator(".paper-year").count(),7,"Yearly past paper links");
      }
      if(route==="past-papers/solved"){
        assert.equal(await page.locator(".paper-category").count(),2,"Only Papers 2 and 3");
        assert.equal(await page.locator('a[href="#/past-papers/solved/1"]').count(),0);
        assert.equal(await page.locator(".paper-theory-note").count(),1);
      }
      if(route==="past-papers/solved/2"||route==="past-papers/solved/3"){
        assert.match(await page.locator(".paper-empty").innerText(),/No solved papers uploaded yet/);
      }
      console.log("PASS "+width+"px / "+route);
    }
    await page.close();
  }
}finally{
  await browser.close();
}
