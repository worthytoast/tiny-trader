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
  await p.goto(url); await p.evaluate(()=>localStorage.clear()); await p.goto(url); await wait(700);
  await p.screenshot({path:out+"/1-welcome.png"});
  // A believable mid-morning: bought PXLF early, it's up, and fresh news just hit.
  for(let tries=0;tries<60;tries++){
    const ok=await p.evaluate(()=>{
      const T=window.__tt; T.stopLoop(); document.getElementById("intro").hidden=true;
      T.newWeek(); T.select("PXLF"); T.setQty(40);
      for(let i=0;i<20;i++) T.tick(); T.buy();
      for(let i=0;i<70;i++) T.tick();
      const s=T.s, n=s.news; const h=s.hold.PXLF;
      return T.price("PXLF")>h.cost*1.03 && n.at>=s.min-8;
    });
    if(ok) break;
  }
  await p.evaluate(()=>{const T=window.__tt; T.setPaused(true); T.setPaused(false); T.stopLoop(); T.draw(true); document.querySelector('#qtyRow button[data-q="10"]').click(); document.querySelectorAll(".ping").forEach(e=>e.classList.remove("ping"));});
  await p.evaluate(()=>{document.getElementById("live").className="live";document.getElementById("liveTxt").textContent="LIVE";document.getElementById("pause").textContent="Pause";});
  await p.evaluate(()=>document.getElementById("toast").style.opacity=0); await wait(400); await p.screenshot({path:out+"/2-live-chart.png"});
  // a wild stock later in the day
  await p.evaluate(()=>{const T=window.__tt; for(let i=0;i<110;i++) T.tick(); T.select("MOON"); T.setQty(100); T.buy(); for(let i=0;i<25;i++) T.tick();
    document.querySelector('.chip[data-t="MOON"]').click(); T.draw(true); document.querySelectorAll(".ping").forEach(e=>e.classList.remove("ping"));
    document.getElementById("live").className="live";document.getElementById("liveTxt").textContent="LIVE";document.getElementById("pause").textContent="Pause";});
  await p.evaluate(()=>document.getElementById("toast").style.opacity=0); await wait(400); await p.screenshot({path:out+"/3-wild-stock.png"});
  await p.evaluate(()=>{const T=window.__tt; while(T.s.phase==="open") T.tick();});
  await p.evaluate(()=>document.getElementById("toast").style.opacity=0); await wait(400); await p.screenshot({path:out+"/4-market-closed.png"});
  await b.close(); console.log(fs.readdirSync(out));
})();
