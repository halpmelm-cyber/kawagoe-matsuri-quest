let S=JSON.parse(localStorage.getItem("kmq3")||'{"xp":0,"coins":0,"town":null,"q":0}');
let locked=false, meter=50, dir=1, meterTimer=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem("kmq3",JSON.stringify(S));stats()}
function stats(){$("#xp").textContent=S.xp;$("#coins").textContent=S.coins;$("#level").textContent=Math.floor(S.xp/100)+1}
function toast(x){let t=$("#toast");t.textContent=x;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}
function page(id){$$(".page").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");window.scrollTo(0,0);if(id==="quiz")quiz();if(id==="encyclopedia")encyclopedia();if(id==="history")history();if(id==="start")towns();if(id==="route")route()}
$$("[data-page]").forEach(x=>x.onclick=()=>page(x.dataset.page));
function towns(){$("#townPicker").innerHTML='<p>参加するコースを選んでください。</p>'+TOWNS.map(t=>`<div class="town-card" onclick="chooseTown('${t.id}')"><div><span class="tag">${t.emoji} コース</span><h3>${t.name}</h3><p>${t.description}</p></div><button class="select">出発</button></div>`).join("")}
function chooseTown(id){S.town=id;save();page("route")}
function route(){
 let t=TOWNS.find(x=>x.id===S.town)||TOWNS[0];
 $("#selectedTown").textContent=t.name+"コース";
 $("#float").textContent=t.float;
 const goals={
  imafuku:"芝金杉流の今福囃子を体験し、六軒町の山車とのつながりを知ろう。",
  rokkemachi:"三番叟の山車を知り、今福囃子との長い縁をたどろう。",
  generic:"川越まつりの山車と囃子を知ろう。"
 };
 $("#goal").textContent=goals[t.id]||goals.generic;
 $("#floatA").textContent=t.id==="rokkemachi"?"🏮":"🥁";
 $("#floatB").textContent="🏮";
}
function quiz(){let q=QUIZ[S.q%QUIZ.length];locked=false;$("#quizBox").innerHTML=`<div class="quiz-card"><span class="tag">${q.cat}</span><h3>${q.q}</h3><div class="answers">${q.a.map((x,i)=>`<button class="answer" data-i="${i}">${x}</button>`).join("")}</div><div id="explain"></div></div>`;$$(".answer").forEach(b=>b.onclick=()=>answer(+b.dataset.i,q))}
function answer(i,q){if(locked)return;locked=true;let bs=$$(".answer");bs[q.ok].classList.add("correct");if(i===q.ok){S.xp+=20;S.coins+=10;toast("正解！ +20 XP +10札")}else{bs[i].classList.add("wrong");toast("解説を確認しよう")}$("#explain").innerHTML=`<div class="explain"><b>解説</b><br>${q.e}<br><button class="primary" style="margin-top:10px" onclick="S.q++;save();quiz()">次の問題</button></div>`;save()}
function encyclopedia(){$("#encyclopediaBox").innerHTML=FLOATS.map(f=>`<article class="entry"><div class="float-entry"><div class="big">${f.icon}</div><div><span class="tag">${f.category}</span><h3>${f.name}</h3></div></div><p>${f.text}</p></article>`).join("")}
function history(){$("#historyBox").innerHTML=HISTORY.map(h=>`<article class="entry"><span class="tag">${h.year}</span><h3>${h.title}</h3><p>${h.text}</p></article>`).join("")}
$("#learnMission").onclick=()=>page("quiz");
$("#rhythmMission").onclick=()=>{page("rhythm");startRhythm()};
$("#hikkawaseMission").onclick=()=>{page("hikkawase");startMeter()};
let beatReady=false;
function startRhythm(){beatReady=false;$("#rhythmResult").textContent="3、2、1…";setTimeout(()=>{beatReady=true;$("#beat").textContent="🥁";$("#rhythmResult").textContent="今！";},900)}
$("#drum").onclick=()=>{if(beatReady){S.xp+=30;S.coins+=15;save();$("#rhythmResult").textContent="大成功！ +30 XP";toast("囃子が決まった！")}else{$("#rhythmResult").textContent="少し待とう！";}}
function startMeter(){clearInterval(meterTimer);meter=5;dir=1;meterTimer=setInterval(()=>{meter+=dir*2;if(meter>=95||meter<=5)dir*=-1;$("#meter").style.width=meter+"%"},40)}
$("#hbtn").onclick=()=>{clearInterval(meterTimer);if(meter>=35&&meter<=65){S.xp+=50;S.coins+=30;$("#hresult").textContent="曳っかわせ成功！ +50 XP";toast("最高の曳っかわせ！")}else{$("#hresult").textContent="タイミングがずれた！";toast("もう一度挑戦")}save()}
$("#gear").onclick=()=>$("#modal").classList.remove("hidden");$("#close").onclick=()=>$("#modal").classList.add("hidden");$("#reset").onclick=()=>{localStorage.removeItem("kmq3");location.reload()}
stats();page("home");
