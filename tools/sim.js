// Headless test: runs the real game script with a stubbed DOM, plays many days tick by tick, and checks the rules.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
const els={};
function el(id){return {id,hidden:true,style:{},textContent:"",innerHTML:"",className:"",dataset:{},offsetWidth:1,firstChild:{nodeValue:""},
  classList:{add(){},remove(){},toggle(){}},append(){},setAttribute(){},addEventListener(){},querySelector:()=>el("q"),
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
const holdAll=m=>{ if(m===0) T.act(); };
const random=()=>{ if(Math.random()<.02) T.act(); };
// buys a stock 2 minutes after its good news and sells 15 minutes later
let held=null, seen=null;
const chaser=m=>{ const n=T.s.news;
  if(held&&m-held>=15){(T.own&&T.act());held=null;}
  if(n!==seen){seen=n; const x=T.ALL.find(x=>x.good.includes(n)); if(x&&!held){held=-1; setTimeout2(()=>{if(!T.own)T.act();held=T.s.min;},2);}} };
let pending=[]; function setTimeout2(f,ticks){pending.push({f,at:T.s.min+ticks});}
const chaserWrap=m=>{ pending=pending.filter(p=>{if(m>=p.at){p.f();return false;}return true;}); chaser(m); };
const stats=(name,f,n)=>{T.newGame(); const r=[]; for(let i=0;i<n;i++){held=null;pending=[];r.push(day(f));} r.sort((a,b)=>a-b);
  console.log(name.padEnd(14),"worst day",(r[0]*100).toFixed(0)+"%","median",(r[n>>1]*100).toFixed(1)+"%","best",(r[n-1]*100).toFixed(0)+"%");};
T.newGame(); while(T.s.phase==="open") T.tick(); console.log("day-end card shown:",!$("closed").hidden,"text:",$("closedT").textContent,"|",$("closedGoal").innerHTML.replace(/&#\d+;/g,"*")); T.nextDay();
stats("cash only",none,20); stats("hold all day",holdAll,300); stats("random taps",random,300); stats("news chaser",chaserWrap,300);
// rule checks
T.newGame(); T.act(); const o=T.own;
console.log("Simple trades the Tiny Market:",T.list().length===1&&o&&o.t==="TINY");
console.log("BUY gets exactly 10 shares:",o&&o.sh===10&&Math.abs(T.s.cash-(10000-10*o.cost))<0.01);
console.log("button says SELL while holding:",document.getElementById("act").className.includes("sell"));
T.act(); console.log("SELL sells it all:",!T.own&&Math.abs(T.s.cash-10000)<0.01);
T.act(); for(let i=0;i<400;i++) T.tick(); console.log("auto-sold at 4:00:",!T.own,"note:",$("closedNote").textContent);
console.log("save size (bytes):",store["tinytrader.v5"].length);

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
T.setMode("simple"); console.log("simple mode has one market:",T.list().length===1);

// ---- goals, stars, streaks
T.newGame(); const st0=T.s.stars; T.s.goal={k:"wins",n:2,prog:0,done:false};
const setP=(t,m)=>{T.s.st[t].p=Math.round(T.s.st[t].p*m*100)/100;};
const win=()=>{ T.act(); setP("TINY",1.02); T.act(); };
win(); win();
console.log("two winning trades finish the goal and earn a star:",T.s.goal.done&&T.s.stars===st0+1);
console.log("streak counts wins in a row:",T.s.streak===2);
T.act(); setP("TINY",.97); T.act();
console.log("a losing trade resets the streak:",T.s.streak===0);
{const keep=T.school; T.setSchool(7); const g={mode:"simple",dayStart:10000,goal:null}; let ok=true; for(let i=0;i<60;i++){T.makeGoal(g); if(g.goal.k==="profit"&&g.goal.n!==20) ok=false;} console.log("Simple profit goal is $20 (after Trading School):",ok); T.setSchool(keep.n,keep.seen);}
T.s.goal={k:"profit",n:20,prog:0,done:false}; T.act(); for(const x of T.ALL) setP(x.t,1.05); T.tick();
console.log("profit goal fills while you hold a winner:",T.s.goal.done);
console.log("ranks: 0 stars Rookie, 3 Trader, 40 Legend:",T.rankOf(0)===0&&T.rankOf(3)===1&&T.rankOf(40)===5);
while(T.s.phase==="open") T.tick(); T.nextDay();
console.log("new day brings a new goal and keeps stars:",!T.s.goal.done&&T.s.stars===st0+2);
T.setMode("pro"); T.newGame(); T.s.goal={k:"spread",n:3,prog:0,done:false};
T.buyShares("ROBO",1); T.buyShares("GLOW",1); T.buyShares("PXLF",1);
console.log("pro goal: own 3 companies at once:",T.s.goal.done);

// ---- one shared market (same prices in both modes; shares stay in the mode that bought them)
T.setMode("simple"); T.fresh(); for(let i=0;i<20;i++) T.tick();
const pz=T.price("PZZA"), clock=T.s.min;
T.setMode("pro");
console.log("same price for Pizza Rocket in both modes:",T.price("PZZA")===pz,"same clock:",T.s.min===clock);
T.setMode("simple"); T.act(); const simpleShares=T.own.sh;
T.setMode("pro"); const proCash=T.s.cash;
console.log("Simple-mode shares are not in Pro:",!T.s.hold.TINY);
T.sellShares("TINY",100,null);
console.log("so Pro can't sell them:",T.s.cash===proCash);
for(let i=0;i<30;i++) T.tick();
T.setMode("simple");
console.log("Simple still owns them after the market moved:",T.own&&T.own.sh===simpleShares,"clock moved for both:",T.s.min===clock+30);
// crash every company: the Tiny Market is built from them, so it crashes too
const tinyBefore=T.price("TINY"); for(const x of T.ALL) setP(x.t,.7); T.tick(); T.setMode("pro");
console.log("a crash in the companies pulls the Tiny Market down:",T.price("TINY")<tinyBefore*.75);
T.setMode("simple"); const before=T.worth(); T.act();
console.log("selling after the crash gets the crashed price:",Math.abs(T.s.cash-before)<0.01&&T.s.cash<10000);
// a Pro stop-loss still works while you play Simple
T.setMode("pro"); T.buyShares("ROBO",5); T.s.hold.ROBO.stop=3; const rc=T.s.hold.ROBO.cost;
T.setMode("simple"); T.s.st.ROBO.p=Math.round(rc*90)/100; T.tick(); T.setMode("pro");
console.log("Pro stop-loss sells while you're in Simple:",!T.s.hold.ROBO);
// Simple shares are still sold at 4:00 if you're in Pro
T.setMode("simple"); if(!T.own) T.act(); T.setMode("pro");
while(T.s.phase==="open") T.tick(); T.setMode("simple");
console.log("Simple shares sold at 4:00 even while in Pro:",!T.own);

// ---- Tiny Market = average of the six companies
T.setMode("simple"); T.fresh(); for(let i=0;i<50;i++) T.tick();
{ const avg=T.ALL.reduce((a,x)=>a+T.price(x.t)/x.p,0)/6, a0=T.s.st.TINY.a0; console.log("Tiny Market follows the six companies, 3x the swing:",Math.abs(100*a0*Math.pow(avg/a0,3)-T.price("TINY"))<0.02);
  let mx=0,mn=1e9; T.fresh(); for(let d=0;d<300;d++){ while(T.s.phase==="open") T.tick(); mx=Math.max(mx,T.price("TINY")); mn=Math.min(mn,T.price("TINY")); T.nextDay(); } console.log("Tiny Market range over 300 days:",mn.toFixed(0),"to",mx.toFixed(0), mn>30&&mx<300); }
{ const k=T.ind("TINY"); console.log("chart tools work (average, floor, ceiling):",!!k&&k.sup<=k.res&&k.ma>0); }

// ---- Trading School
T.fresh(); console.log("starts on lesson 1:",T.school.n===0&&T.s.goal.k==="lesson"&&T.s.goal.i===0);
T.showSchool(0,true); T.closeSchool();
win(); console.log("winning a trade passes lesson 1:",T.school.n===1);
T.s.goal=null; T.makeGoal(T.s); console.log("next goal is lesson 2:",T.s.goal.k==="lesson"&&T.s.goal.i===1);
T.showSchool(1,true); T.closeSchool();
// lesson 2: a win only counts if you bought above the purple line
for(let i=0;i<40;i++) T.tick();
let tries=0; while(T.school.n===1&&tries++<400){ T.tick(); const k=T.ind("TINY"); if(!T.own&&k&&!k.above){ T.act(); setP("TINY",1.02); T.act(); } }
console.log("a win bought under the line does not pass lesson 2:",T.school.n===1);
tries=0; while(T.school.n===1&&tries++<400){ if(T.s.phase!=="open") T.nextDay(); T.tick(); const k=T.ind("TINY"); if(!T.own&&k&&k.above){ T.act(); setP("TINY",1.02); T.act(); } }
console.log("a win bought above the line passes lesson 2:",T.school.n===2);
// lesson 4: take-profit and stop-loss lines on every buy
T.setSchool(3,3); if(T.s.phase!=="open") T.nextDay(); T.s.goal=null; T.makeGoal(T.s);
T.tick(); T.act(); console.log("buys get a stop-loss and take-profit after lesson 4:",T.own.stop===2&&T.own.tp===3);
for(const x of T.ALL) setP(x.t,1.06); T.tick(); console.log("take-profit sells by itself and passes lesson 4:",!T.own&&T.school.n===4);
T.setSchool(4,4); T.act(); for(const x of T.ALL) setP(x.t,.97); T.tick(); console.log("stop-loss sells by itself in Simple:",!T.own);
// lesson 7: finish the day up
T.setSchool(6,6); T.s.goal=null; T.makeGoal(T.s); T.s.cash+=50; while(T.s.phase==="open") T.tick();
console.log("ending a day up passes the last lesson:",T.school.n===7);
T.nextDay(); console.log("after Trading School, normal goals come back:",T.s.goal.k!=="lesson");
console.log("save size after school (bytes):",store["tinytrader.v5"].length);

// ---- teaching: quizzes, guidance, report card
console.log("every lesson has a 2-question quiz with 3 answers:",T.LESSONS.every(l=>T.QUIZ[l.id]&&T.QUIZ[l.id].length===2&&T.QUIZ[l.id].every(q=>q.o.length===3&&q.w)));
T.fresh(); T.showSchool(0,true); T.closeSchool(); for(let i=0;i<30;i++) T.tick();
console.log("lesson 1 guides you step by step:",/Step 1/.test(T.guide().text)&&T.guide().spot===true);
win(); console.log("passing lesson 1 queues its quiz:",T.school.qp===0);
while(T.s.phase==="open") T.tick();
console.log("report card counts the day's trades:",/TRADES<b>1</.test($("closedStats").innerHTML)&&/Coach's tip/.test($("closedTip").innerHTML)&&/DID YOU KNOW/.test($("closedFact").innerHTML));

// ---- engagement: daily race with rival traders, badges, day streak
T.setMode("simple"); T.fresh(); T.setSchool(1,1); T.s.goal=null; T.makeGoal(T.s);
{ const trades={tina:0,bob:0,jay:0}, wins={you:0,tina:0,bob:0,jay:0}, tot={tina:0,bob:0,jay:0}; let shutOk=true, sorted=true;
  for(let d=0;d<150;d++){
    while(T.s.phase==="open"){ T.tick(); if(T.s.min%50===0){ const b=T.raceBoard(); for(let i=1;i<b.length;i++) if(b[i].v>b[i-1].v+0.005) sorted=false; } }
    for(const id in trades){ trades[id]+=T.rv[id].n; tot[id]+=T.rv[id].pl; if(T.rv[id].h) shutOk=false; }
    const L=T.s.raceLast; if(L) wins[L.board[0].id]++;
    T.nextDay();
  }
  console.log("rivals trade every day (avg trades/day):",Object.entries(trades).map(([k,v])=>k+" "+(v/150).toFixed(1)).join(", "),Object.values(trades).every(v=>v>150));
  console.log("rivals end the day in cash:",shutOk,"| race board is sorted best first:",sorted);
  console.log("days won over 150 (you sit out):",JSON.stringify(wins),"| rival total $:",Object.entries(tot).map(([k,v])=>k+" "+v.toFixed(0)).join(", "));
  console.log("every rival wins some days:",wins.tina>8&&wins.bob>8&&wins.jay>8);
  console.log("race record kept:",T.s.race&&Object.values(T.s.race).reduce((a,b)=>a+b,0)===150);
}
T.fresh(); T.setSchool(0,0); while(T.s.phase==="open") T.tick(); console.log("no race before lesson 1:",T.s.raceLast===null&&$("closedRace").hidden); T.nextDay();
T.setSchool(1,1); for(const k in T.badges) delete T.badges[k]; T.s.cash+=500; while(T.s.phase==="open") T.tick();
console.log("a big day wins the race and shows on the report card:",T.s.raceLast.place===1&&!$("closedRace").hidden&&/YOU FINISHED 1ST/.test($("closedRace").innerHTML)&&!!T.badges.race);
console.log("green day badge:",!!T.badges.green,"| new badges listed on the card:",/New badge/.test($("closedBadges").textContent));
T.nextDay(); T.act(); for(const x of T.ALL) T.s.st[x.t].p=Math.round(T.s.st[x.t].p*1.05*100)/100; T.tick(); T.act();
console.log("first win badge:",!!T.badges.first);
{ const n0=Object.keys(T.badges).length; T.earn("first"); console.log("a badge is only earned once:",Object.keys(T.badges).length===n0); }
T.setPlay({last:"",run:0}); const day0=new Date(2026,10,1,12);
T.dailyCheck(day0); T.dailyCheck(new Date(2026,10,2,12)); const same=T.dailyCheck(new Date(2026,10,2,20)); T.dailyCheck(new Date(2026,10,3,9));
console.log("day streak counts real days in a row:",T.play.run===3&&same===false&&!!T.badges.daily3);
T.dailyCheck(new Date(2026,10,6,9)); console.log("missing a day resets the streak:",T.play.run===1);
T.showBadges(); console.log("badge screen lists all",T.BADGES.length,"badges:",/collected/.test($("badgeSum").textContent));
T.showRace(); console.log("race card opens:",!$("race").hidden);

