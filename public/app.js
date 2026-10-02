const $ = (selector) => document.querySelector(selector);
let activities = [];
let selectedActivity;
const barriers = ['No time', 'Low energy', 'It costs too much', 'I feel bad at it', 'I need equipment', 'I am scared', 'I lost excitement', 'Other commitment'];

async function request(url, options) { const res = await fetch(url, options); return res.json(); }
function progressText(percent) { if (percent === 0) return 'Curious'; if (percent < 35) return 'Preparing'; if (percent < 65) return 'Tried once'; if (percent < 90) return 'Returning'; return 'Explored'; }
function card(activity, recommendation) { return `<article class="card"><span class="tag">${recommendation ? activity.type.toUpperCase() : activity.category.toUpperCase()}</span><div class="activity-icon">${activity.icon}</div><h3>${activity.name}</h3><p>${activity.starter}</p><button data-id="${activity.id}" class="open">Open this door →</button></article>`; }
function libraryCard(a) { const p = a.progress.percent; return `<article class="activity open" data-id="${a.id}"><span>${a.icon}</span><strong>${a.name}</strong><small>${progressText(p)} · ${p}%</small><div class="progress"><i style="width:${p}%"></i></div></article>`; }
async function loadActivities() { activities = await request('/api/activities'); $('#library').innerHTML = activities.map(libraryCard).join(''); $('#count').textContent = `${activities.length} sparks saved`; bindOpen(); }
async function loadRecommendations() { const query = new URLSearchParams({time:$('#time').value,energy:$('#energy').value,mood:$('#mood').value}); const recommended = await request('/api/recommendations?'+query); $('#recommendations').innerHTML = recommended.map((a) => card(a,true)).join(''); bindOpen(); }
function bindOpen() { document.querySelectorAll('.open').forEach(el => el.onclick = () => openActivity(el.dataset.id)); }
function openActivity(id) {
  selectedActivity = activities.find(a => a.id === id);
  const p = selectedActivity.progress;
  $('#activityDetail').innerHTML = `<div class="detail"><div class="detail-icon">${selectedActivity.icon}</div><p class="eyebrow">${selectedActivity.category.toUpperCase()}</p><h2>${selectedActivity.name}</h2><p>${selectedActivity.reason}</p><div class="journey"><div class="journey-head"><span>${p.status}</span><span>${p.percent}% explored</span></div><div class="journey-bar"><i style="width:${p.percent}%"></i></div><small>Curious → Research → Prepare → Try → Solve → Return → Explore</small></div><div class="prep"><strong>Prepare without pressure</strong><ul>${selectedActivity.prep.map(x=>`<li>${x}</li>`).join('')}</ul><strong>Today’s smallest move</strong><p>${selectedActivity.starter}</p></div><div class="personal-plan"><p class="eyebrow">MAKE THIS YOURS</p><label>Why do I want to try this?<textarea id="why" placeholder="I want this because…">${p.why || ''}</textarea></label><label>What must be true in real life before I can do it?<textarea id="commitmentPlan" placeholder="Time, body, money, transport, equipment, other commitments…">${p.commitmentPlan || ''}</textarea></label><label>What usually makes me leave it?<textarea id="knownBarrier" placeholder="When it gets hard, I tend to…">${p.knownBarrier || ''}</textarea></label><button id="savePlan" class="secondary">Save my real plan</button></div><div class="detail-actions"><button id="start">I did the small move ✦</button><button id="planning" class="secondary">Start preparing</button><button id="rescue" class="secondary">I want to quit / I’m stuck</button></div></div>`;
  $('#activityDialog').showModal();
  $('#start').insertAdjacentHTML('afterend', '<button id="planIt" class="secondary">Plan a real time</button>');
  $('#savePlan').onclick = async () => {
    await updateProgress(p.status, p.percent, { why: $('#why').value.trim(), commitmentPlan: $('#commitmentPlan').value.trim(), knownBarrier: $('#knownBarrier').value.trim() });
    openActivity(selectedActivity.id);
  };
  $('#start').onclick = () => updateProgress('Tried once', Math.max(p.percent,50));
  $('#planIt').onclick = () => planActivity();
  $('#planning').onclick = () => updateProgress('Planning',Math.max(p.percent,20));
  $('#rescue').onclick = () => { $('#activityDialog').close(); openRescue(); };
}
async function updateProgress(status, percent, extra = {}) { await request(`/api/activities/${selectedActivity.id}/progress`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,percent,...extra})}); $('#activityDialog').close(); await loadActivities(); await loadRecommendations(); }
async function planActivity() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const when = window.prompt('When will you do this? Choose a real date and time.', now.toISOString().slice(0, 16));
  if (!when) return;
  const action = window.prompt('What is the smallest realistic action for that time?', selectedActivity.starter);
  if (!action) return;
  await request('/api/plans', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ activityId: selectedActivity.id, when, action }) });
  $('#activityDialog').close();
  await loadActivities(); await loadRecommendations(); await loadPlans();
}
async function loadPlans() {
  const plans = await request('/api/plans');
  let section = $('#upcomingPlans');
  if (!section) { $('.controls').insertAdjacentHTML('afterend', '<section id="upcomingPlans"><div class="section-title"><div><p class="eyebrow">UPCOMING PROMISES</p><h2>A time you chose for yourself.</h2></div></div><div class="library" id="planCards"></div></section>'); section = $('#upcomingPlans'); }
  $('#planCards').innerHTML = plans.length ? plans.slice(0, 4).map(plan => `<article class="activity"><span>${plan.activity.icon}</span><strong>${plan.activity.name}</strong><small>${new Date(plan.when).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</small><p>${plan.action}</p><button class="donePlan" data-id="${plan.id}">I showed up ✦</button></article>`).join('') : '<p>No promises yet. Choose one activity and give it a real time.</p>';
  document.querySelectorAll('.donePlan').forEach(button => button.onclick = async () => { await request(`/api/plans/${button.dataset.id}/done`, {method:'POST'}); await loadPlans(); });
}
function openRescue(){ $('#barriers').innerHTML=barriers.map(x=>`<button data-barrier="${x}">${x}</button>`).join(''); $('#rescuePlan').style.display='none'; $('#rescueDialog').showModal(); document.querySelectorAll('[data-barrier]').forEach(b=>b.onclick=()=>showPlan(b.dataset.barrier)); }
function showPlan(barrier){ const plans={ 'No time':'If today has no space, then choose a five-minute version now and put one exact 20-minute slot in tomorrow’s calendar.', 'Low energy':'If my body is tired, then I will choose a seated, smaller version or rest without guilt and set a return time.', 'It costs too much':'If cost blocks me, then I will research one free, borrowed, rented, or trial version before leaving it.', 'I feel bad at it':'If I feel embarrassed, then I will make an intentionally bad five-minute attempt and keep it private.', 'I need equipment':'If equipment blocks me, then I will list the minimum item, a borrow option, and one place to get it.', 'I am scared':'If fear appears, then I will make the next action safer: read, watch, ask an instructor, or bring a friend.', 'I lost excitement':'If excitement faded, then I will reconnect to why I saved this—or consciously move it to Left it for now.', 'Other commitment':'If another commitment wins today, then I will not disappear; I will pick a new specific day or pause intentionally.'}; $('#rescuePlan').innerHTML=`<strong>That is a real problem. Here is the rescue plan:</strong><br>${plans[barrier]}<br><br><button id="later">Did it later / set next move</button>`; $('#rescuePlan').style.display='block'; $('#later').onclick=()=>{ $('#rescueDialog').close(); openActivity(selectedActivity.id); }; }
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#refresh').onclick=async()=>{ await request('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({time:$('#time').value,energy:$('#energy').value,mood:$('#mood').value})}); loadRecommendations(); };
$('#openLookout').onclick=()=>$('#lookoutDialog').showModal();
$('#saveLookout').onclick=async()=>{ await request('/api/reflections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({did:$('#did').value,learned:$('#learned').value,next:$('#next').value})}); $('#lookoutDialog').close(); ['did','learned','next'].forEach(id=>$('#'+id).value=''); alert('Saved. This is evidence that you showed up. ✦'); };
loadActivities().then(async () => { await loadRecommendations(); await loadPlans(); });
