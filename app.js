const KEY="kawagoeQuestV5";
let S=JSON.parse(localStorage.getItem(KEY)||'{"xp":0,"coins":0,"found":[],"met":[],"q":0}');
let pos={x:50,y:72}, nearSpot=null, nearNpc=null, eventData=null, answered=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(KEY,JSON.stringify(S));renderStats()}
function renderStats(){
 $("#xp").textContent=S.xp; $("#coins").textContent=S.coins; $("#lv").textContent=Math.floor(S.xp/100)+1;
 $("#found").textContent=S.found.length+" / 5"; $("#met").textContent=S.met.length+" / 3";
}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1500)}
function show(id){
 $$(".page").forEach(x=>x.classList.remove("active")); $("#"+id).classList.add("active"); window.scrollTo(0,0);
 if(id==="world") setTimeout(updateWorld,0);
 if(id==="quests") renderQuests();
 if(id==="book") renderBook();
 if(id==="history") renderHistory();
 if(id==="freequiz") renderFreeQuiz();
}
$$("[data-page]").forEach(b=>b.onclick=()=>show(b.dataset.page));
function distance(el){
 let r=el.getBoundingClientRect(),m=$("#map").getBoundingClientRect();
 let x=(r.left+r.width/2-m.left)/m.width*100, y=(r.top+r.height/2-m.top)/m.height*100;
 return Math.hypot(pos.x-x,pos.y-y);
}
function updateWorld(){
 $("#player").style.left=pos.x+"%"; $("#player").style.top=pos.y+"%";
 let sd=999,nd=999; nearSpot=null; nearNpc=null;
 $$(".spot").forEach(e=>{let d=distance(e);if(d<sd){sd=d;nearSpot=e.dataset.spot}});
 $$(".npc").forEach(e=>{let d=distance(e);if(d<nd){nd=d;nearNpc=e.dataset.npc}});
 $("#talk").disabled=nd>=13; $("#inspect").disabled=sd>=13;
 if(nd<13){$("#nearName").textContent=NPCS[nearNpc].name;$("#nearDesc").textContent="近くに人がいる。話しかけてみよう。"}
 else if(sd<13){$("#nearName").textContent=SPOTS[nearSpot].name;$("#nearDesc").textContent=SPOTS[nearSpot].desc}
 else{$("#nearName").textContent="中央通り";$("#nearDesc").textContent="街を歩いて次の場所を探そう。"}
}
function move(dx,dy){pos.x=Math.max(5,Math.min(95,pos.x+dx));pos.y=Math.max(5,Math.min(95,pos.y+dy));updateWorld()}
$$("[data-move]").forEach(b=>b.onclick=()=>{let d=b.dataset.move;move(d==="left"?-4:d==="right"?4:0,d==="up"?-4:d==="down"?4:0)});
document.addEventListener("keydown",e=>{
 if(!$("#world").classList.contains("active"))return;
 let k=e.key.toLowerCase();
 if(k==="w"||k==="arrowup")move(0,-4); if(k==="s"||k==="arrowdown")move(0,4);
 if(k==="a"||k==="arrowleft")move(-4,0); if(k==="d"||k==="arrowright")move(4,0);
});
$("#talk").onclick=()=>{if(nearNpc)talk(nearNpc)};
$("#inspect").onclick=()=>{if(nearSpot)inspectSpot(nearSpot)};
function talk(id){
 let n=NPCS[id];
 if(!S.met.includes(id)){S.met.push(id);S.xp+=10;save();toast("新しい出会い！ +10 XP")}
 $("#dialogBox").innerHTML=`<div class="dialog"><div class="portrait">${n.emoji}</div><h2>${n.name}</h2><p>${n.lines[0]}</p><p>${n.lines[1]}</p><button class="primary" id="npcQuiz">🎴 クイズに挑戦</button><button class="secondary" data-page="world">街へ戻る</button></div>`;
 $("#npcQuiz").onclick=()=>openEvent(SPOTS[n.spot],n.name);
 $("#dialogBox [data-page]").onclick=()=>show("world"); show("dialog");
}
function inspectSpot(id){
 if(!S.found.includes(id)){S.found.push(id);S.xp+=15;save();toast("場所を発見！ +15 XP")}
 openEvent(SPOTS[id],SPOTS[id].name);
}
function openEvent(q,title){
 eventData=q;answered=false;$("#eventTitle").textContent=title;
 $("#eventBox").innerHTML=`<div class="quiz"><span class="tag">発見クイズ</span><h3>${q.q}</h3><div class="answers">${q.answers.map((a,i)=>`<button data-answer="${i}">${a}</button>`).join("")}</div><div id="explain"></div></div>`;
 $$("#eventBox [data-answer]").forEach(b=>b.onclick=()=>check(+b.dataset.answer));
 show("event");
}
function check(i){
 if(answered)return;answered=true;let bs=$$("#eventBox [data-answer]");
 bs[eventData.ok].classList.add("correct");
 if(i===eventData.ok){S.xp+=30;S.coins+=15;toast("正解！ +30 XP / +15札")}
 else{bs[i].classList.add("wrong");toast("解説を読んで覚えよう")}
 $("#explain").innerHTML=`<div class="explain"><b>解説</b><p>${eventData.ex}</p><button class="primary" data-page="world">街へ戻る</button></div>`;
 $("#explain [data-page]").onclick=()=>show("world");save();
}
function renderQuests(){
 let q=[["🏮 六軒町を発見","rokken"],["🥁 今福囃子を発見","imafuku"],["⛩️ 氷川神社を発見","shrine"]];
 $("#questBox").innerHTML=q.map(x=>`<article><h3>${x[0]}</h3><b>${S.found.includes(x[1])?"✅ 達成":"⬜ 未達成"}</b></article>`).join("")+
 `<article><h3>👥 街の3人と話す</h3><b>${S.met.length} / 3</b></article><article><h3>⭐ 全5か所を探索</h3><b>${S.found.length} / 5</b></article>`;
}
function renderBook(){
 let ids=["rokken","imafuku","plaza","shrine","shop"];
 $("#bookBox").innerHTML=ids.map(id=>{let q=SPOTS[id],open=S.found.includes(id);return `<article><h3>${open?"📖":"🔒"} ${open?q.name:"？？？"}</h3><p>${open?q.ex:"街を探索すると情報が解放されます。"}</p></article>`}).join("");
}
function renderHistory(){$("#historyBox").innerHTML=HISTORY.map(h=>`<article><span class="tag">${h[0]}</span><h3>${h[1]}</h3><p>${h[2]}</p></article>`).join("")}
function renderFreeQuiz(){let arr=Object.values(SPOTS),q=arr[S.q%arr.length];eventData=q;$("#freeQuizBox").innerHTML=`<div class="quiz"><h3>${q.q}</h3><div class="answers">${q.answers.map((a,i)=>`<button data-fq="${i}">${a}</button>`).join("")}</div><div id="fqex"></div></div>`;$$("[data-fq]").forEach(b=>b.onclick=()=>{let i=+b.dataset.fq;if(i===q.ok){S.xp+=20;S.coins+=10;toast("正解！ +20 XP")}else toast("惜しい！");S.q++;save();setTimeout(renderFreeQuiz,700)})}
$("#settings").onclick=()=>$("#modal").classList.remove("hidden");$("#close").onclick=()=>$("#modal").classList.add("hidden");
$("#reset").onclick=()=>{localStorage.removeItem(KEY);location.reload()};
renderStats();