let S=JSON.parse(localStorage.getItem("kmq4")||'{"xp":0,"coins":0,"discoveries":[],"q":0}');
let pos={x:50,y:74}, currentPlace=null, locked=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem("kmq4",JSON.stringify(S));stats()}
function stats(){$("#xp").textContent=S.xp;$("#coins").textContent=S.coins;$("#level").textContent=Math.floor(S.xp/100)+1;$("#discoverCount").textContent=S.discoveries.length+" / 5"}
function toast(x){let t=$("#toast");t.textContent=x;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}
function page(id){$$(".page").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");window.scrollTo(0,0);if(id==="quiz")quiz();if(id==="encyclopedia")encyclopedia();if(id==="history")history();if(id==="explore"){setTimeout(()=>renderPlayer(),0)}}
$$("[data-page]").forEach(x=>x.onclick=()=>page(x.dataset.page));

const places={
 shrine:{name:"氷川神社",hint:"川越まつりの歴史を感じる場所。祭りの始まりについて問題が出る。",q:{q:"川越まつりのはじまりとされる出来事は？",a:["慶安元年の神輿・獅子頭などの寄進","明治21年の山車新造","昭和36年の廻り舞台改造","2016年のユネスコ登録"],ok:0,e:"慶安元年（1648年）、川越藩主松平信綱が神輿・獅子頭などを寄進し、祭りの執行を促したことが始まりとされています."}},
 rokkemachi:{name:"六軒町・三番叟",hint:"六軒町の山車を調べよう。三番叟と1888年のつながりが鍵。",q:{q:"六軒町の山車の人形は？",a:["三番叟","羅陵王","山王","道灌"],ok:0,e:"六軒町の山車には、能楽『式三番』に登場する三番叟の人形が載せられています。"}},
 imafuku:{name:"今福囃子連中",hint:"今福の囃子と流派を調べよう。",q:{q:"今福囃子連中が称する囃子の流派は？",a:["芝金杉流","王蔵流","堤崎流","葛西囃子"],ok:0,e:"川越市公式情報では、今福の祭りばやしは芝金杉流とされています。"}},
 matsuri:{name:"祭り広場",hint:"山車同士が出会ったときの名場面を調べよう。",q:{q:"山車同士が出会った際に囃子を演奏し合う場面は？",a:["曳っかわせ","神幸祭","御神火","渡御"],ok:0,e:"山車同士が出会った際、山車を正面に向けて囃子を演奏し合うのが曳っかわせです。"}},
 shop:{name:"町の店",hint:"祭りの知識を集めた人には、1888年の問題が待っている。",q:{q:"1888年、六軒町が山車を新造した際に選ばれたとされる囃子は？",a:["今福の祭りばやし","中台囃子","連雀町の囃子","新富町の囃子"],ok:0,e:"明治21年（1888年）、六軒町が山車を新造した際に今福の祭りばやしが選ばれ、それ以来、六軒町の山車で演奏していると川越市が紹介しています。"}}
};

function renderPlayer(){
 const p=$("#player");p.style.left=pos.x+"%";p.style.top=pos.y+"%";
 let nearest=null, best=999;
 $$(".building").forEach(el=>{
   const r=el.getBoundingClientRect(), mr=$("#map").getBoundingClientRect();
   const bx=((r.left+r.width/2-mr.left)/mr.width)*100, by=((r.top+r.height/2-mr.top)/mr.height)*100;
   const d=Math.hypot(pos.x-bx,pos.y-by);
   if(d<best){best=d;nearest=el}
 });
 if(nearest && best<14){
   currentPlace=nearest.dataset.place;$("#inspect").disabled=false;
   $("#locationName").textContent=places[currentPlace].name;
   $("#locationHint").textContent=places[currentPlace].hint;
 }else{
   currentPlace=null;$("#inspect").disabled=true;
   $("#locationName").textContent="中央通り";$("#locationHint").textContent="建物に近づくと「調べる」が使えます。";
 }
}
function move(dx,dy){
 pos.x=Math.max(8,Math.min(92,pos.x+dx));pos.y=Math.max(8,Math.min(92,pos.y+dy));
 renderPlayer();
}
$$("[data-move]").forEach(b=>b.onclick=()=>{let d=b.dataset.move;move(d==="left"?-4:d==="right"?4:0,d==="up"?-4:d==="down"?4:0)});
document.addEventListener("keydown",e=>{
 if(!$("#explore").classList.contains("active"))return;
 const k=e.key.toLowerCase();
 if(["arrowup","w"].includes(k))move(0,-4);
 if(["arrowdown","s"].includes(k))move(0,4);
 if(["arrowleft","a"].includes(k))move(-4,0);
 if(["arrowright","d"].includes(k))move(4,0);
 if(k==="enter"&&currentPlace)openPlace(currentPlace);
});
$("#inspect").onclick=()=>{if(currentPlace)openPlace(currentPlace)};
function openPlace(id){
 const p=places[id];$("#placeQuizTitle").textContent=p.name+" クイズ";locked=false;
 $("#placeQuizBox").innerHTML=`<div class="quiz-card"><span class="tag">発見イベント</span><h3>${p.q.q}</h3><div class="answers">${p.q.a.map((x,i)=>`<button class="answer" data-i="${i}">${x}</button>`).join("")}</div><div id="explain"></div></div>`;
 $$(".answer").forEach(b=>b.onclick=()=>answerPlace(id,+b.dataset.i));
 page("placeQuiz");
}
function answerPlace(id,i){
 if(locked)return;locked=true;const q=places[id].q,bs=$$(".answer");
 bs[q.ok].classList.add("correct");
 if(i===q.ok){
   if(!S.discoveries.includes(id)){S.discoveries.push(id);S.xp+=30;S.coins+=15;toast("発見！ +30 XP +15札")}
   else toast("正解！")
 }else{bs[i].classList.add("wrong");toast("街に戻ってもう一度調べよう")}
 $("#explain").innerHTML=`<div class="explain"><b>街の記録</b><br>${q.e}<br><button class="primary" style="margin-top:10px" onclick="page('explore')">街へ戻る</button></div>`;
 save();
}
function quiz(){
 const q=QUIZ[S.q%QUIZ.length];locked=false;
 $("#quizBox").innerHTML=`<div class="quiz-card"><span class="tag">${q.cat}</span><h3>${q.q}</h3><div class="answers">${q.a.map((x,i)=>`<button class="answer" data-i="${i}">${x}</button>`).join("")}</div><div id="explain"></div></div>`;
 $$(".answer").forEach(b=>b.onclick=()=>answer(i=+b.dataset.i,q));
}
function answer(i,q){if(locked)return;locked=true;let bs=$$("#quiz .answer");bs[q.ok].classList.add("correct");if(i===q.ok){S.xp+=20;S.coins+=10;toast("正解！ +20 XP +10札")}else{bs[i].classList.add("wrong");toast("解説を確認しよう")}$("#explain").innerHTML=`<div class="explain"><b>解説</b><br>${q.e}<br><button class="primary" style="margin-top:10px" onclick="S.q++;save();quiz()">次の問題</button></div>`;save()}
function encyclopedia(){$("#encyclopediaBox").innerHTML=FLOATS.map(f=>`<article class="entry"><div class="float-entry"><div class="big">${f.icon}</div><div><span class="tag">${f.category}</span><h3>${f.name}</h3></div></div><p>${f.text}</p></article>`).join("")}
function history(){$("#historyBox").innerHTML=HISTORY.map(h=>`<article class="entry"><span class="tag">${h.year}</span><h3>${h.title}</h3><p>${h.text}</p></article>`).join("")}
$("#gear").onclick=()=>$("#modal").classList.remove("hidden");$("#close").onclick=()=>$("#modal").classList.add("hidden");$("#reset").onclick=()=>{localStorage.removeItem("kmq4");location.reload()}
stats();page("home");
