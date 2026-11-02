// Takes 1080x1920 Play Store screenshots in headless Chrome. Needs: python -m http.server 8800 --directory docs
// Reuses puppeteer-core installed in ../wall-hop/tools/shots.
const path=require("path"), fs=require("fs");
const puppeteer=require(path.resolve(__dirname,"../../wall-hop/tools/shots/node_modules/puppeteer-core"));
const out=path.resolve(__dirname,"../store/screenshots"); fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const p=await b.newPage(); await p.setViewport({width:432,height:768,deviceScaleFactor:2.5});
  const url="http://127.0.0.1:8800/index.html";
  await p.goto(url); await p.evaluate(()=>localStorage.clear()); await p.goto(url); await wait(600);
  await p.screenshot({path:out+"/1-welcome.png"});
  // play a believable season: buy a few companies, advance days, keep a good-looking run
  let ok=false;
  for(let tries=0;tries<40&&!ok;tries++){
    ok=await p.evaluate(()=>{
      const T=window.__tt; T.newGame(); document.getElementById("introScrim").hidden=true;
      const buy=(i,n)=>{T.openTrade(T.STOCKS[i]);T.setQty(n);T.buy();};
      buy(0,60); buy(3,40); buy(5,20);
      for(let d=0;d<11;d++) T.nextDay();
      document.getElementById("tradeScrim").hidden=true;
      const w=T.worth(); return w>10350&&w<11800&&T.s.news.t;
    });
  }
  await p.evaluate(()=>window.scrollTo(0,0)); await wait(800);
  await p.screenshot({path:out+"/2-market.png"});
  await p.evaluate(()=>{const T=window.__tt; T.openTrade(T.STOCKS[5]); T.setQty(5); document.getElementById("msg").textContent="";}); await wait(500);
  await p.screenshot({path:out+"/3-trade.png"});
  await p.evaluate(()=>{const T=window.__tt; document.getElementById("tradeScrim").hidden=true; while(T.s.day<30) T.nextDay(); T.endSeason();}); await wait(500);
  await p.screenshot({path:out+"/4-results.png"});
  await b.close(); console.log(fs.readdirSync(out));
})();
