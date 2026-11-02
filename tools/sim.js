// Headless test: runs the real game script with a stubbed DOM, plays many days tick by tick, and checks the rules.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
const els={};
function el(id){return {id,hidden:true,style:{},textContent:"",innerHTML:"",className:"",dataset:{},offsetWidth:1,firstChild:{nodeValue:""},
  classList:{add(){},remove(){},toggle(){}},append(){},setAttribute(){},querySelector:()=>el("q"),
  getContext:()=>ctxStub,getBoundingClientRect:()=>({width:390,height:330}),width:0,height:0,onclick:null};}
global.document={body:el('body'),getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el("x"),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const store={}; global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};
global.window={addEventListener(){},devicePixelRatio:1}; global.navigator={};
global.requestAnimationFrame=()=>0; global.setInterval=()=>1; global.clearInterval=()=>{}; global.setTimeout=()=>0; global.clearTimeout=()=>{};
new Function("window","document",code)(window,document);
const T=window.__tt, $=id=>document.getElementById(id);
console.log("intro shown on first launch:",!$("intro").hidden);

function day(strategy){
  const start=T.worth();
  while(T.s.phase==="open"){ strategy(T.s.min); T.tick();
    if(!(T.worth()>0)||!isFinite(T.worth())||T.s.cash<-0.001) throw new Error("bad money at min "+T.s.min); }
  if(T.own) throw new Error("still holding after close");
  const r=T.worth()/start-1; T.nextDay(); return r;
}
const none=()=>{};
const holdAll=m=>{ if(m===0){T.select("PZZA");T.act();} };
const random=()=>{ if(Math.random()<.02){ T.select(T.list()[Math.floor(Math.random()*3)].t); T.act(); } };
// buys a stock 2 minutes after its good news and sells 15 minutes later
let held=null, seen=null;
const chaser=m=>{ const n=T.s.news;
  if(held&&m-held>=15){(T.own&&T.act());held=null;}
  if(n!==seen){seen=n; const x=T.list().find(x=>x.good.includes(n)); if(x&&!held){held=-1; setTimeout2(()=>{T.select(x.t);T.act();held=T.s.min;},2);}} };
let pending=[]; function setTimeout2(f,ticks){pending.push({f,at:T.s.min+ticks});}
const chaserWrap=m=>{ pending=pending.filter(p=>{if(m>=p.at){p.f();return false;}return true;}); chaser(m); };
const stats=(name,f,n)=>{T.newGame(); const r=[]; for(let i=0;i<n;i++){held=null;pending=[];r.push(day(f));} r.sort((a,b)=>a-b);
  console.log(name.padEnd(14),"worst day",(r[0]*100).toFixed(0)+"%","median",(r[n>>1]*100).toFixed(1)+"%","best",(r[n-1]*100).toFixed(0)+"%");};
T.newGame(); day(none); console.log("day-end card shown:",!$("closed").hidden,"text:",$("closedT").textContent);
stats("cash only",none,20); stats("hold Pizza",holdAll,300); stats("random taps",random,300); stats("news chaser",chaserWrap,300);
// rule checks
T.newGame(); T.select("PZZA"); T.act(); const o=T.own;
console.log("BUY uses (almost) all cash:",o&&T.s.cash<T.price("PZZA"));
T.select("MOON"); console.log("button says SELL while holding:",document.getElementById("act").className.includes("sell"));
T.act(); console.log("SELL cashes out everything (even when looking at another company):",!T.own&&Math.abs(T.s.cash-10000)<0.01);
T.act(); for(let i=0;i<400;i++) T.tick(); console.log("auto-sold at 4:00:",!T.own,"note:",$("closedNote").textContent);
console.log("save size (bytes):",store["tinytrader.v4"].length);

// ---- Pro mode
T.setMode("pro"); console.log("pro mode has 6 companies:",T.list().length===6, "own money:",T.worth()===10000);
const proRandom=()=>{ if(Math.random()<.03){ const x=T.list()[Math.floor(Math.random()*6)]; T.select(x.t); T.setQty([1,10,100,"max"][Math.floor(Math.random()*4)]);
  if(Math.random()<.5) T.buyShares(x.t,[1,10,100][Math.floor(Math.random()*3)]); else if(T.s.hold[x.t]) T.sellShares(x.t,10,null);
  if(T.s.hold[x.t]&&Math.random()<.3) T.s.hold[x.t].stop=[0,3,5,10][Math.floor(Math.random()*4)]; } };
const proDay=f=>{ const start=T.worth(); while(T.s.phase==="open"){ f(); T.tick(); if(!(T.worth()>0)||!isFinite(T.worth())||T.s.cash<-0.001) throw new Error("bad pro money"); } const r=T.worth()/start-1; T.nextDay(); return r; };
{ const r=[]; for(let i=0;i<200;i++) r.push(proDay(proRandom)); r.sort((a,b)=>a-b);
  console.log("pro random    worst day",(r[0]*100).toFixed(0)+"%","median",(r[100]*100).toFixed(1)+"%","best",(r[199]*100).toFixed(0)+"%"); }
T.newGame(); T.buyShares("ROBO",10); T.buyShares("GLOW",20); console.log("pro owns several at once:",Object.keys(T.s.hold).length===2);
T.sellShares("GLOW",5,null); console.log("pro partial sell:",T.s.hold.GLOW.sh===15);
while(T.s.phase==="open") T.tick(); console.log("pro keeps shares overnight:",Object.keys(T.s.hold).length===2);
T.nextDay(); T.s.hold.ROBO.stop=5; const c=T.s.hold.ROBO.cost; T.s.st.ROBO.p=Math.round(c*0.94*100)/100; T.tick();
console.log("stop-loss sells automatically:",!T.s.hold.ROBO);
T.setMode("simple"); console.log("simple mode money kept separately:",T.list().length===3);
