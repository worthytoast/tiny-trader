// Headless test: runs the real game script with a stubbed DOM and plays seasons with simple strategies.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
function el(id){return {id,hidden:true,style:{},value:"1",textContent:"",innerHTML:"",className:"",dataset:{},classList:{add(){},remove(){}},
  append(){},setAttribute(){},querySelector:()=>el("c"),getContext:()=>ctxStub,width:128,height:56,clientWidth:340,onclick:null};}
const els={}; global.document={getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el("x"),querySelectorAll:()=>[]};
const store={}; global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};
global.window={addEventListener(){},devicePixelRatio:1}; global.navigator={};
global.requestAnimationFrame=f=>f(); global.setTimeout=f=>f(); global.clearTimeout=()=>{};
new Function("window","document",code)(window,document);
const T=window.__tt;
console.log("intro shown on first launch:",!document.getElementById("introScrim").hidden);
function season(strategy){
  T.newGame(); document.getElementById("endScrim").hidden=true;
  for(let d=1; d<30; d++){ strategy(d); T.nextDay(); }
  const w=T.worth(); if(!(w>0)||!isFinite(w)) throw new Error("bad worth "+w);
  if(T.s.cash<-0.001) throw new Error("negative cash");
  return w;
}
// buy-and-hold everything equally on day 1
const spread=d=>{ if(d!==1) return; for(const st of T.STOCKS){ T.openTrade(st); T.setQty(Math.floor(1600/T.price(st.t))); T.buy(); } };
// put everything in Moon Mining
const yolo=d=>{ if(d!==1) return; const st=T.STOCKS[2]; T.openTrade(st); T.setQty(Math.floor(T.s.cash/T.price(st.t))); T.buy(); };
// do nothing
const none=()=>{};
const runs=n=>f=>{const r=[];for(let i=0;i<n;i++) r.push(season(f)/10000-1); r.sort((a,b)=>a-b); return r;};
const show=(name,r)=>console.log(name.padEnd(10),"worst",(r[0]*100).toFixed(0)+"%","median",(r[r.length>>1]*100).toFixed(0)+"%","best",(r[r.length-1]*100).toFixed(0)+"%");
show("cash only",runs(50)(none)); show("spread",runs(300)(spread)); show("all MOON",runs(300)(yolo));
// trade checks
T.newGame(); const st=T.STOCKS[0]; T.openTrade(st);
T.setQty(5); T.buy(); const c1=T.s.cash; T.setQty(9); T.sell(); console.log("oversell blocked:",T.s.hold.PZZA.sh===5, "msg:",document.getElementById("msg").textContent);
T.setQty(99999); T.buy(); console.log("overbuy blocked:",T.s.cash===c1,"msg:",document.getElementById("msg").textContent);
T.setQty(5); T.sell(); console.log("sold all, position removed:",!T.s.hold.PZZA, "cash back to 10000:",Math.abs(T.s.cash-10000)<0.01);
for(let d=1;d<30;d++) T.nextDay(); T.nextDay(); console.log("day capped at 30:",T.s.day===30,"end screen:",!document.getElementById("endScrim").hidden,"title:",document.getElementById("endT").textContent);
console.log("saved bytes:",store["tinytrader.v1"].length);
