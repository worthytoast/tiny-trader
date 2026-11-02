// Headless test: runs the real game script with a stubbed DOM, plays many days tick by tick, and checks the rules.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
const els={};
function el(id){return {id,hidden:true,style:{},textContent:"",innerHTML:"",className:"",dataset:{},offsetWidth:1,firstChild:{nodeValue:""},
  classList:{add(){},remove(){},toggle(){}},append(){},setAttribute(){},querySelector:()=>el("q"),
  getContext:()=>ctxStub,getBoundingClientRect:()=>({width:390,height:330}),width:0,height:0,onclick:null};}
global.document={getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el("x"),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
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
  if(T.s.own) throw new Error("still holding after close");
  const r=T.worth()/start-1; T.nextDay(); return r;
}
const none=()=>{};
const holdAll=m=>{ if(m===0){T.select("PZZA");T.buy();} };
const random=()=>{ if(Math.random()<.02){ T.select(T.STOCKS[Math.floor(Math.random()*3)].t); T.act(); } };
// buys a stock 2 minutes after its good news and sells 15 minutes later
let held=null, seen=null;
const chaser=m=>{ const n=T.s.news;
  if(held&&m-held>=15){T.sell(false);held=null;}
  if(n!==seen){seen=n; const x=T.STOCKS.find(x=>x.good.includes(n)); if(x&&!held){held=-1; setTimeout2(()=>{T.select(x.t);T.buy();held=T.s.min;},2);}} };
let pending=[]; function setTimeout2(f,ticks){pending.push({f,at:T.s.min+ticks});}
const chaserWrap=m=>{ pending=pending.filter(p=>{if(m>=p.at){p.f();return false;}return true;}); chaser(m); };
const stats=(name,f,n)=>{T.newGame(); const r=[]; for(let i=0;i<n;i++){held=null;pending=[];r.push(day(f));} r.sort((a,b)=>a-b);
  console.log(name.padEnd(14),"worst day",(r[0]*100).toFixed(0)+"%","median",(r[n>>1]*100).toFixed(1)+"%","best",(r[n-1]*100).toFixed(0)+"%");};
T.newGame(); day(none); console.log("day-end card shown:",!$("closed").hidden,"text:",$("closedT").textContent);
stats("cash only",none,20); stats("hold Pizza",holdAll,300); stats("random taps",random,300); stats("news chaser",chaserWrap,300);
// rule checks
T.newGame(); T.select("PZZA"); T.buy(); const o=T.s.own;
console.log("BUY uses (almost) all cash:",o&&T.s.cash<T.price("PZZA"));
T.select("MOON"); T.buy(); console.log("second BUY while holding does nothing:",T.s.own.t==="PZZA");
T.sell(false); console.log("SELL cashes out everything:",!T.s.own&&Math.abs(T.s.cash-10000)<0.01);
T.buy(); for(let i=0;i<400;i++) T.tick(); console.log("auto-sold at 4:00:",!T.s.own,"note:",$("closedNote").textContent);
console.log("save size (bytes):",store["tinytrader.v3"].length);
