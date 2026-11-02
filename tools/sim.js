// Headless test: runs the real game script with a stubbed DOM, plays whole weeks tick by tick, and checks the trading rules.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
const els={};
function el(id){return {id,hidden:true,style:{},value:"",textContent:"",innerHTML:"",className:"",dataset:{},offsetWidth:1,
  classList:{add(){},remove(){},toggle(){}},append(){},setAttribute(){},querySelector:()=>el("q"),
  getContext:()=>ctxStub,getBoundingClientRect:()=>({width:390,height:330}),width:0,height:0,onclick:null};}
global.document={getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el("x"),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const store={}; global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};
global.window={addEventListener(){},devicePixelRatio:1}; global.navigator={};
global.requestAnimationFrame=()=>0; global.setInterval=()=>1; global.clearInterval=()=>{}; global.setTimeout=()=>0; global.clearTimeout=()=>{};
new Function("window","document",code)(window,document);
const T=window.__tt, $=id=>document.getElementById(id);
console.log("intro shown on first launch:",!$("intro").hidden);

function week(strategy){
  T.newWeek(); let checks=0;
  for(let d=1; d<=5; d++){
    if(d>1) T.openNextDay();
    while(T.s.phase==="open"){ strategy(T.s.min,d); T.tick(); checks++;
      if(!(T.worth()>0)||!isFinite(T.worth())||T.s.cash<-0.001) throw new Error("bad money at day "+d+" min "+T.s.min);
    }
  }
  return {ret:T.worth()/10000-1, phase:T.s.phase, ticks:checks};
}
const none=()=>{};
const spread=(m,d)=>{ if(m===0&&d===1) for(const x of T.STOCKS){T.select(x.t);T.setQty(Math.floor(1600/T.price(x.t)));T.buy();} };
const random=()=>{ if(Math.random()<.02){ const x=T.STOCKS[Math.floor(Math.random()*6)]; T.select(x.t); T.setQty(10); Math.random()<.5?T.buy():T.sell(); } };
// "news chaser+0.6s": buy 100 of whatever just had news and sell it 15 minutes later
let held=null;
const chaser=(m)=>{ const n=T.s.news; if(held&&m-held.m>=15){T.select(held.t);T.setQty("max");T.sell();held=null;}
  if(!held&&n.at===m-2&&n.txt){const x=T.STOCKS.find(x=>x.good.includes(n.txt)); if(x){T.select(x.t);T.setQty("max");T.buy();held={t:x.t,m};}} };
const stats=(name,f,n)=>{const r=[];for(let i=0;i<n;i++){held=null;r.push(week(f).ret);} r.sort((a,b)=>a-b);
  console.log(name.padEnd(12),"worst",(r[0]*100).toFixed(0)+"%","median",(r[n>>1]*100).toFixed(1)+"%","best",(r[n-1]*100).toFixed(0)+"%");};
const one=week(none); console.log("week ends on results screen:",one.phase==="week"&&!$("week").hidden,"ticks:",one.ticks);
stats("cash only",none,20); stats("spread",spread,200); stats("random",random,200); stats("news chaser+0.6s",chaser,200);
// rule checks
T.newWeek(); T.select("PZZA"); T.setQty(10); T.buy(); console.log("buy 10:",T.s.hold.PZZA?.sh===10);
T.setQty(100); T.sell(); console.log("sell more than owned sells what you have:",!T.s.hold.PZZA, "cash back:",Math.abs(T.s.cash-10000)<0.01);
T.setQty("max"); T.buy(); console.log("max buy leaves less than one share of cash:",T.s.cash<T.price("PZZA"));
T.setQty(1); T.select("MOON"); const c0=T.s.cash; T.sell(); console.log("selling unowned does nothing:",T.s.cash===c0);
for(let i=0;i<20;i++) T.tick(); const ns=T.s.st.PZZA.c; console.log("candles grow in 5-minute bars:",ns.filter(c=>!c.y).length===4);
console.log("save size (bytes):",store["tinytrader.v2"].length);
