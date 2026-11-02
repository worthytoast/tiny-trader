// Browser test for the "why you lost money" card and Settings. Needs: python -m http.server 8800 --directory docs
const path=require("path");
const puppeteer=require(path.resolve(__dirname,"../../wall-hop/tools/shots/node_modules/puppeteer-core"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const check=(name,ok)=>{console.log((ok?"PASS ":"FAIL ")+name); if(!ok) fails++;};
(async()=>{
  const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const p=await b.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.setViewport({width:390,height:844});
  const url="http://127.0.0.1:8800/index.html";
  await p.goto(url); await p.evaluate(()=>localStorage.clear()); await p.goto(url); await wait(400);
  await p.click("#introGo"); await wait(300);
  const vis=id=>p.evaluate(id=>!document.getElementById(id).hidden,id);
  // force a losing trade: buy, then knock the price down 5%
  const lose=()=>p.evaluate(()=>{const T=window.__tt; if(!T.s.own) T.buy(); const o=T.s.st[T.s.own.t]; o.p=Math.round(T.s.own.cost*95)/100;});
  await lose(); await p.click("#act"); await wait(200);
  check("losing sale shows the card",await vis("lesson"));
  check("game pauses while the card is open",await p.evaluate(()=>window.__tt.isPaused()));
  const txt=await p.evaluate(()=>document.getElementById("lessonWhat").textContent+" | "+document.getElementById("lessonWhy").textContent);
  console.log("   card says:",txt);
  await p.click("#lessonAgain"); await wait(150);
  check("Remind me again closes the card",!(await vis("lesson")));
  check("Remind me again keeps tips on",await p.evaluate(()=>window.__tt.opts.explain===true));
  check("game resumes after closing",await p.evaluate(()=>!window.__tt.isPaused()));
  // profit: no card
  await p.evaluate(()=>{const T=window.__tt; T.buy(); const o=T.s.st[T.s.own.t]; o.p=Math.round(T.s.own.cost*105)/100;}); await p.click("#act"); await wait(150);
  check("profitable sale shows no card",!(await vis("lesson")));
  // dismiss turns tips off
  await lose(); await p.click("#act"); await wait(150); await p.click("#lessonDismiss"); await wait(150);
  check("Dismiss turns tips off",await p.evaluate(()=>window.__tt.opts.explain===false));
  await lose(); await p.click("#act"); await wait(150);
  check("with tips off, a loss shows no card",!(await vis("lesson")));
  // settings: turn back on, survives reload
  await p.click("#openSettings"); await wait(150);
  check("Settings opens and pauses",(await vis("settings"))&&await p.evaluate(()=>window.__tt.isPaused()));
  check("switch shows tips are off",await p.evaluate(()=>!document.getElementById("optExplain").checked));
  await p.click("#optExplain"); await p.click("#settingsDone"); await wait(150);
  check("switch turns tips back on",await p.evaluate(()=>window.__tt.opts.explain===true));
  check("Done closes Settings and resumes",!(await vis("settings"))&&await p.evaluate(()=>!window.__tt.isPaused()));
  await p.reload(); await wait(400);
  check("setting is remembered after reload",await p.evaluate(()=>window.__tt.opts.explain===true));
  // 4:00 auto-sale at a loss: card first, then the day card
  await p.evaluate(()=>{const T=window.__tt; T.setPaused(true); T.buy(); const t=T.s.own.t, c=T.s.own.cost;
    while(T.s.min<389) T.tick(); T.s.st[t].p=Math.round(c*90)/100; T.tick();});
  await wait(200);
  check("auto-sale loss shows the card first",(await vis("lesson"))&&!(await vis("closed")));
  console.log("   reason:",await p.evaluate(()=>document.getElementById("lessonWhy").textContent));
  await p.click("#lessonAgain"); await wait(150);
  check("then the day-end card appears",await vis("closed"));
  // start over needs two taps
  await p.click("#nextDay"); await wait(150); await p.click("#openSettings"); await p.click("#restart"); await wait(100);
  check("first tap on Start over only asks to confirm",await p.evaluate(()=>window.__tt.s.day>1));
  await p.click("#restart"); await wait(150);
  check("second tap starts over",await p.evaluate(()=>window.__tt.s.day===1&&window.__tt.worth()===10000));
  check("no page errors",errs.length===0); if(errs.length) console.log(errs);
  await b.close(); process.exit(fails?1:0);
})();
