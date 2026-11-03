// Takes 1080x1920 Play Store screenshots in headless Chrome. Needs: python -m http.server 8800 --directory docs
// Reuses puppeteer-core installed in ../wall-hop/tools/shots.
const path=require("path"), fs=require("fs");
const puppeteer=require(path.resolve(__dirname,"../../wall-hop/tools/shots/node_modules/puppeteer-core"));
const out=path.resolve(__dirname,"../store/screenshots");
fs.mkdirSync(out,{recursive:true}); for(const f of fs.readdirSync(out)) if(f.endsWith(".png")) fs.rmSync(path.join(out,f));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const p=await b.newPage(); await p.setViewport({width:432,height:768,deviceScaleFactor:2.5});
  const url="http://127.0.0.1:8800/index.html";
  const tidy=()=>p.evaluate(()=>{document.querySelectorAll(".ping,.flash").forEach(e=>e.classList.remove("ping","flash"));document.getElementById("toast").style.opacity=0;
    const T=window.__tt; T.stopLoop(); T.render(); document.getElementById("pause").textContent="Pause"; T.draw(true);});
  await p.goto(url); await p.evaluate(()=>localStorage.clear()); await p.goto(url); await wait(700);
  await p.screenshot({path:out+"/1-welcome.png"});
  // holding Pizza Rocket and up
  for(let tries=0;tries<80;tries++){
    const ok=await p.evaluate(()=>{const T=window.__tt; T.stopLoop(); document.getElementById("intro").hidden=true;
      T.fresh(); T.select("PZZA"); T.s.goal={k:"wins",n:2,prog:1,done:false}; T.s.streak=1; for(let i=0;i<30;i++) T.tick(); T.act(); for(let i=0;i<60;i++) T.tick();
      return T.worth()>10250&&T.worth()<10900;});
    if(ok) break;
  }
  await tidy(); await wait(300); await p.screenshot({path:out+"/2-buy-low.png"});
  // cash out: the toast shows the profit
  await wait(1200); await p.evaluate(()=>{const T=window.__tt; T.act();}); await wait(450);
  await p.evaluate(()=>{document.querySelectorAll(".ping,.flash").forEach(e=>e.classList.remove("ping","flash")); window.__tt.draw(true); document.getElementById("pause").textContent="Pause";});
  await p.screenshot({path:out+"/3-sell-high.png"});
  // end of day
  await p.evaluate(()=>{const T=window.__tt; T.select("MOON"); while(T.s.phase==="open") T.tick();});
  await wait(300); await p.evaluate(()=>document.getElementById("toast").style.opacity=0); await wait(3500);
  await p.screenshot({path:out+"/4-day-done.png"});
  // Pro mode
  await p.click("#nextDay"); await p.click("#openSettings"); await p.click('#modeSeg button[data-m="pro"]'); await p.click("#settingsDone"); await wait(150); await p.click("#proIntroGo");
  for(let tries=0;tries<60;tries++){
    const ok=await p.evaluate(()=>{const T=window.__tt; T.stopLoop(); T.fresh(); for(let i=0;i<40;i++) T.tick(); document.getElementById("lesson").hidden=true; T.buyShares("ROBO",20); T.buyShares("GLOW",100);
      T.select("ROBO"); T.setQty(10); for(let i=0;i<50;i++) T.tick(); if(T.s.hold.ROBO) T.s.hold.ROBO.stop=5; document.getElementById("lesson").hidden=true; return !!T.s.hold.ROBO&&T.worth()>10080;});
    if(ok) break;
  }
  await tidy(); await wait(1500); await p.screenshot({path:out+"/5-pro-mode.png"});
  await b.close(); console.log(fs.readdirSync(out));
})();
