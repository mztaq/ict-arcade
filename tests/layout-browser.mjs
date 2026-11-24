import assert from "node:assert/strict";
import {chromium} from "playwright";
import {yearlyPastPapers,solvedPastPapers} from "../src/pastPapers.js";

// Browser-level checks for horizontal overflow and overlapping key interface regions.
const origin="http://127.0.0.1:4173";
const sizes=[320,390,768,1280];
const routes=["home","past-papers","past-papers/yearly","past-papers/yearly/2026","past-papers/yearly/2020","past-papers/solved","past-papers/solved/1","past-papers/solved/2","past-papers/solved/3","notes","chapter/1/0","chapter/6/4","chapter/11/1","practice","flashcards","practical","games"];
routes.push("past-papers/yearly/2026/s","past-papers/yearly/2026/s/qp","past-papers/yearly/2026/s/sf");
routes.push("does-not-exist","notes/invalid","games/99","past-papers/yearly/2026/s/invalid");
const previews=[];
for(const group of yearlyPastPapers){
  for(const paper of group.papers){
    const resource=["questionPaper","markScheme","examinerReport"].find(type=>Boolean(paper[type]));
    if(resource){
      const route="past-papers/yearly/"+group.year+"/"+paper.id+"/"+resource;
      routes.push(route);
      previews.push({route,url:paper[resource],sourceCount:(paper.sourceFiles||[]).length});
    }
  }
}
for(const [number,papers] of Object.entries(solvedPastPapers)){
  for(const paper of papers){
    const route="past-papers/solved/"+number+"/"+paper.id+"/workedSolution";
    routes.push(route);
    previews.push({route,url:paper.url,sourceCount:(paper.sourceFiles||[]).length});
  }
}
const minimumReadableSize={
  home:[[".home-intro h2",21],[".course-title-line strong",22],[".course-stats small",14]],
  "past-papers":[[".paper-category strong",23]],
  "past-papers/yearly":[[".papa-year-group-heading h2",21],[".papa-series-link",15]],
  "past-papers/solved":[[".paper-category strong",23]],
  notes:[[".chapter-description strong",16],[".chapter-lessons span",14]],
  "chapter/1/0":[[".concepts li",16],[".lesson-link",16],[".definitions-table tbody td",16]],
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
      const url=origin+"/"+route;
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
      if(["does-not-exist","notes/invalid","games/99","past-papers/yearly/2026/s/invalid"].includes(route)){
        assert.equal(await page.locator(".not-found p").innerText(),"Page not found.");
        assert.equal(await page.locator(".site-header").count(),0);
        assert.equal(await page.locator(".not-found[data-layout]").count(),1);
        assert.equal(await page.locator('.not-found a[href="/"]').count(),1);
      }
      if(route==="chapter/1/0"){
        assert.equal(await page.locator(".definitions-table thead th").allTextContents().then(x=>x.join("|")),"Term|Definition");
        assert.ok(await page.locator(".definitions-table tbody tr").count()>0);
        assert.equal(await page.locator("ul.concepts").first().evaluate(el=>getComputedStyle(el).listStyleType),"disc");
      }
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
        assert.equal(await page.locator('a[href="/past-papers/yearly"]').count(),1);
        assert.equal(await page.locator('a[href="/past-papers/solved"]').count(),1);
      }
      if(["past-papers/yearly","past-papers/yearly/2026","past-papers/yearly/2020"].includes(route)){
        assert.equal(await page.locator(".papa-year-group").count(),10);
        assert.equal(await page.locator(".papa-series-link").count(),29);
        assert.equal(await page.locator('#main-content a[href^="http"]').count(),0);
        assert.equal(await page.locator('.papa-series-link[href="/past-papers/yearly/2026/s"]').count(),1);
      }
      if(route==="past-papers/yearly/2026/s")assert.equal(await page.locator(".paper-year").count(),4);
      if(route==="past-papers/yearly/2026/s/qp"||route==="past-papers/yearly/2026/s/sf"){
        assert.equal(await page.locator(".papa-file").count(),route.endsWith("/qp")?7:4);
        assert.equal(await page.locator("iframe").count(),0);
      }
      if(route==="past-papers/solved"){
        assert.equal(await page.locator(".paper-category").count(),3,"Papers 1, 2 and 3");
        assert.equal(await page.locator('a[href="/past-papers/solved/1"]').count(),1);
        assert.equal(await page.locator(".paper-theory-note").count(),0);
      }
      if(route==="past-papers/solved/1"){
        assert.match(await page.locator(".paper-1-message h2").innerText(),/Mustaqim hates Theory, so no solved Paper 1 papers/);
        assert.equal(await page.locator(".paper-year").count(),0);
      }
      if(route==="past-papers/solved/2"||route==="past-papers/solved/3"){
        assert.match(await page.locator(".paper-empty").innerText(),/No solved papers uploaded yet/);
      }
      const preview=previews.find(item=>item.route===route);
      if(preview){
        assert.equal(await page.locator(".paper-pdf-frame").count(),1);
        assert.equal(await page.locator(".paper-pdf-frame").getAttribute("src"),preview.url);
        assert.equal(await page.locator('.paper-preview-actions a[download]').count(),1);
        assert.equal(await page.locator('.paper-preview-actions a[download]').getAttribute("href"),preview.url);
        assert.equal(await page.locator('.paper-source-file[download]').count(),preview.sourceCount);
        assert.equal(await page.locator('iframe[src^="http"]').count(),0);
      }
      console.log("PASS "+width+"px / "+route);
    }
    await page.goto(origin+"/");
    await page.locator('a[href="/notes"]').click();
    await page.waitForURL(origin+"/notes");
    await page.goBack();
    await page.waitForURL(origin+"/");
    await page.goto(origin+"/#/notes");
    await page.waitForURL(origin+"/notes");
    await page.close();
  }
}finally{
  await browser.close();
}
