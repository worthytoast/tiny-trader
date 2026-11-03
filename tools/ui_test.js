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
  const lose=()=>p.evaluate(()=>{const T=window.__tt; if(!T.own) T.act(); const o=T.s.st[T.own.t]; o.p=Math.round(T.own.cost*95)/100;});
  await lose(); await p.click("#act"); await wait(200);
  check("losing sale shows the card",await vis("lesson"));
  check("game pauses while the card is open",await p.evaluate(()=>window.__tt.isPaused()));
  const txt=await p.evaluate(()=>document.getElementById("lessonWhat").textContent+" | "+document.getElementById("lessonWhy").textContent);
  console.log("   card says:",txt);
  check("details start hidden",!(await vis("lessonDetail")));
  await p.click("#lessonMore"); await wait(100);
  const det=await p.evaluate(()=>document.getElementById("lessonDetail").textContent);
  check("plus button shows the share math (10 shares)",(await vis("lessonDetail"))&&det.includes("10 ×")&&det.includes("10 shares"));
  await p.click("#lessonMore"); await wait(100);
  check("tapping again hides the details",!(await vis("lessonDetail")));
  await p.click("#lessonAgain"); await wait(150);
  check("Remind me again closes the card",!(await vis("lesson")));
  check("Remind me again keeps tips on",await p.evaluate(()=>window.__tt.opts.explain===true));
  check("game resumes after closing",await p.evaluate(()=>!window.__tt.isPaused()));
  // profit: no card
  await p.evaluate(()=>{const T=window.__tt; T.act(); const o=T.s.st[T.own.t]; o.p=Math.round(T.own.cost*105)/100;}); await p.click("#act"); await wait(150);
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
  await p.evaluate(()=>{const T=window.__tt; T.setPaused(true); T.act(); const t=T.own.t, c=T.own.cost;
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
  // ---- Pro mode
  await p.click("#openSettings"); await p.click('#modeSeg button[data-m="pro"]'); await wait(150);
  check("switching to Pro gives its own $10,000",await p.evaluate(()=>window.__tt.mode==="pro"&&window.__tt.worth()===10000));
  await p.click("#settingsDone"); await wait(150);
  check("Pro intro shows the first time",await vis("proIntro"));
  await p.click("#proIntroGo"); await wait(150);
  check("Pro shows 6 tabs, share amounts, and two buttons",await p.evaluate(()=>document.querySelectorAll(".tab").length===6&&!document.getElementById("qtyRow").hidden&&!document.getElementById("duo").hidden&&document.getElementById("act").hidden));
  await p.click('#qtyRow button[data-q="10"]'); await p.click("#buy"); await wait(100);
  check("BUY with 10 selected buys 10 shares",await p.evaluate(()=>window.__tt.s.hold[window.__tt.s.sel]?.sh===10));
  check("stop-loss row appears once you own it",!(await p.evaluate(()=>document.getElementById("stopRow").hidden)));
  await p.click('.tab[data-t="MOON"]'); await p.click('#qtyRow button[data-q="100"]'); await p.click("#buy"); await wait(100);
  check("can own two companies at once",await p.evaluate(()=>Object.keys(window.__tt.s.hold).length===2));
  await p.click('#stopRow button[data-s="5"]'); await wait(100);
  await p.evaluate(()=>{const T=window.__tt; const h=T.s.hold.MOON; T.s.st.MOON.p=Math.round(h.cost*93)/100; T.tick();});
  await wait(200);
  check("stop-loss sold Moon Mining",await p.evaluate(()=>!window.__tt.s.hold.MOON));
  check("loss card explains the stop-loss",(await vis("lesson"))&&(await p.evaluate(()=>document.getElementById("lessonWhy").textContent.includes("stop-loss"))));
  console.log("   reason:",await p.evaluate(()=>document.getElementById("lessonWhy").textContent));
  await p.click("#lessonAgain"); await wait(100);
  await p.click("#openSettings"); await p.click('#modeSeg button[data-m="simple"]'); await p.click("#settingsDone"); await wait(150);
  check("back in Simple mode with its own money and 3 tabs",await p.evaluate(()=>window.__tt.mode==="simple"&&document.querySelectorAll(".tab").length===3));
  await p.reload(); await wait(400);
  check("mode and both games survive a reload",await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem("tinytrader.v5"));return d.mode==="simple"&&d.games.pro&&Object.keys(d.games.pro.hold).length===1;}));
  // ---- stimulation: goal strip, speed, sounds, pop-ups, rank on the day card
  check("goal strip shows a goal and stars",await p.evaluate(()=>document.getElementById("goalTxt").textContent.length>5&&document.getElementById("stars").textContent.startsWith("⭐")));
  await p.evaluate(()=>window.__tt.setPaused(false));
  const m0=await p.evaluate(()=>window.__tt.s.min); await wait(2100); const m1=await p.evaluate(()=>window.__tt.s.min);
  await p.click("#speed"); await p.click("#speed"); await wait(150);
  check("speed button goes to 3x",await p.evaluate(()=>window.__tt.opts.speed===3&&document.getElementById("speed").textContent==="3×"));
  const m2=await p.evaluate(()=>window.__tt.s.min); await wait(2100); const m3=await p.evaluate(()=>window.__tt.s.min);
  console.log(`   minutes in 2s: normal ${m1-m0}, 3x ${m3-m2}`);
  check("3x speed runs about three times faster",(m3-m2)>=2*(m1-m0));
  await p.click("#speed"); await wait(100);
  check("speed wraps back to 1x",await p.evaluate(()=>window.__tt.opts.speed===1));
  await p.evaluate(()=>{const T=window.__tt; T.setPaused(true); if(!T.own) T.act(); const o=T.s.st[T.own.t]; o.p=Math.round(T.own.cost*103)/100;}); await p.click("#act"); await wait(250);
  check("a winning sale floats the money up and counts the streak",await p.evaluate(()=>!!document.querySelector(".pop.up")&&window.__tt.s.streak>=1));
  await p.click("#openSettings"); await wait(100);
  check("Sounds switch starts on",await p.evaluate(()=>document.getElementById("optSound").checked));
  await p.click("#optSound"); await p.click("#settingsDone"); await wait(100);
  check("Sounds switch turns sounds off",await p.evaluate(()=>window.__tt.opts.sound===false));
  await p.reload(); await wait(400);
  check("speed and sound settings are remembered",await p.evaluate(()=>{const o=window.__tt.opts;return o.sound===false&&o.speed===1;}));
  await p.evaluate(()=>{const T=window.__tt; T.setPaused(true); while(T.s.phase==="open") T.tick();}); await wait(200);
  check("day-end card shows the goal and a rank",await p.evaluate(()=>/Goal (done|missed)/.test(document.getElementById("closedGoal").textContent)&&/Rookie|Trader|Hot Shot|Shark|Big Bull|Legend/.test(document.getElementById("closedRank").textContent)));
  console.log("   rank box:",await p.evaluate(()=>document.getElementById("closedRank").textContent));
  check("no page errors",errs.length===0); if(errs.length) console.log(errs);
  await b.close(); process.exit(fails?1:0);
})();
