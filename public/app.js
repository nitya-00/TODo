const $ = (selector) => document.querySelector(selector);
let activities = [];
let selectedActivity;
const barriers = ['No time', 'Low energy', 'It costs too much', 'I feel bad at it', 'I need equipment', 'I am scared', 'I lost excitement', 'Other commitment'];
$('.controls').insertAdjacentHTML('afterbegin', '<label>Body<select id="body"><option value="resting">Needs rest</option><option value="normal" selected>Normal</option><option value="active">Ready to move</option></select></label><label>Commitments<select id="workload"><option value="overwhelmed">Overwhelmed</option><option value="normal" selected>Normal</option><option value="light">Light</option></select></label><label>Where<select id="place"><option value="home" selected>At home</option><option value="outside">Outside</option></select></label><label>Budget<select id="budget"><option value="0">₹0</option><option value="low">Low</option><option value="flexible">Flexible</option></select></label>');
$('#time').innerHTML = '<option value="30" selected>30 minutes</option><option value="60">1 hour</option><option value="day">1 day</option><option value="week">1 week</option><option value="15days">15 days</option>';
$('#mood').innerHTML = '<option value="creativity">Creative</option><option value="calm">Calm</option><option value="movement">Movement</option><option value="courage">Courage</option><option value="social">Social</option><option value="learning">Learning</option><option value="adventure">Adventure</option><option value="comfort">Comfort</option><option value="connection">Connection</option>';

async function request(url, options = {}) {
  const token = await window.currentAccessToken?.();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
async function loadProfile() { const profile = await request('/api/profile'); ['time','energy','body','workload','place','budget','mood'].forEach((key) => { if (profile[key] && $('#'+key)) $('#'+key).value = profile[key]; }); }
function progressText(percent) { if (percent === 0) return 'Curious'; if (percent < 35) return 'Preparing'; if (percent < 65) return 'Tried once'; if (percent < 90) return 'Returning'; return 'Explored'; }
function card(activity, recommendation) { return `<article class="card"><span class="tag">${recommendation ? activity.type.toUpperCase() : activity.category.toUpperCase()}</span><div class="activity-icon">${activity.icon}</div><h3>${activity.name}</h3><p>${activity.starter}</p><a href="/${activity.id}" class="open" style="color:inherit">Open this door →</a></article>`; }
function libraryCard(a) { const p = a.progress; return `<a href="/${a.id}" class="activity open" style="color:inherit;text-decoration:none"><span>${a.icon}</span><strong>${a.name}</strong><small>${p.status || progressText(p.percent)} · ${p.percent}%</small><div class="progress"><i style="width:${p.percent}%"></i></div></a>`; }
async function loadActivities() { activities = await request('/api/activities'); $('#library').innerHTML = activities.map(libraryCard).join(''); $('#count').textContent = `${activities.length} sparks saved`; bindOpen(); }
async function loadRecommendations() { try { const query = new URLSearchParams({time:$('#time').value,energy:$('#energy').value,body:$('#body').value,workload:$('#workload').value,place:$('#place').value,budget:$('#budget').value,mood:$('#mood').value}); const recommended = await request('/api/recommendations?'+query); if (!Array.isArray(recommended) || recommended.length !== 3) throw new Error('Three recommendations were not returned.'); $('#recommendations').innerHTML = recommended.map((a) => card(a,true)).join(''); bindOpen(); } catch (error) { $('#recommendations').innerHTML = '<article class="card"><span class="tag">RECOMMENDATIONS NEED A REFRESH</span><h3>Let’s reconnect.</h3><p>The app could not get your three doors. Restart the server, then refresh this page.</p><button onclick="location.reload()">Refresh recommendations</button></article>'; console.error(error); } }
function bindOpen() { document.querySelectorAll('.open').forEach(el => el.onclick = () => { window.location.href = `/${el.dataset.id}`; }); }
function openActivity(id) {
  selectedActivity = activities.find(a => a.id === id);
  const p = selectedActivity.progress;
  $('#activityDetail').innerHTML = `<div class="detail"><div class="detail-icon">${selectedActivity.icon}</div><p class="eyebrow">${selectedActivity.category.toUpperCase()}</p><h2>${selectedActivity.name}</h2><p>${selectedActivity.reason}</p><div class="journey"><div class="journey-head"><span>${p.status}</span><span>${p.percent}% explored</span></div><div class="journey-bar"><i style="width:${p.percent}%"></i></div><small>Curious → Research → Prepare → Try → Solve → Return → Explore</small></div><div class="prep"><strong>Prepare without pressure</strong><ul>${selectedActivity.prep.map(x=>`<li>${x}</li>`).join('')}</ul><strong>Today’s smallest move</strong><p>${selectedActivity.starter}</p></div><div class="personal-plan"><p class="eyebrow">MAKE THIS YOURS</p><label>Why do I want to try this?<textarea id="why" placeholder="I want this because…">${p.why || ''}</textarea></label><label>What must be true in real life before I can do it?<textarea id="commitmentPlan" placeholder="Time, body, money, transport, equipment, other commitments…">${p.commitmentPlan || ''}</textarea></label><label>What usually makes me leave it?<textarea id="knownBarrier" placeholder="When it gets hard, I tend to…">${p.knownBarrier || ''}</textarea></label><button id="savePlan" class="secondary">Save my real plan</button></div><div class="detail-actions"><button id="start">I did the small move ✦</button><button id="planning" class="secondary">Start preparing</button><button id="rescue" class="secondary">I want to quit / I’m stuck</button></div></div>`;
  $('#activityDialog').showModal();
  $('#start').insertAdjacentHTML('afterend', '<button id="planIt" class="secondary">Plan a real time</button>');
  $('#planIt').insertAdjacentHTML('afterend', '<button id="discoverLocal" class="secondary">Find a nearby first try</button>');
  $('.detail-actions').insertAdjacentHTML('afterend', '<div class="detail-actions" id="statusActions"><button class="secondary" data-status="Paused">Pause intentionally</button><button class="secondary" data-status="Loved">I loved this</button><button class="secondary" data-status="Not for me">Not for me</button><button class="secondary" data-status="Left it for now">Left it for now</button></div>');
  $('#savePlan').onclick = async () => {
    await updateProgress(p.status, p.percent, { why: $('#why').value.trim(), commitmentPlan: $('#commitmentPlan').value.trim(), knownBarrier: $('#knownBarrier').value.trim() });
    openActivity(selectedActivity.id);
  };
  $('#start').onclick = () => saveWin();
  $('#planIt').onclick = () => planActivity();
  $('#discoverLocal').onclick = () => discoverLocal();
  document.querySelectorAll('[data-status]').forEach(button => button.onclick = () => {
    const status = button.dataset.status;
    const percent = ['Loved', 'Not for me', 'Left it for now'].includes(status) ? 100 : p.percent;
    updateProgress(status, percent, { activeProblem: '', rescuePlan: '' });
  });
  $('#planning').onclick = () => updateProgress('Planning',Math.max(p.percent,20));
  $('#rescue').onclick = () => { $('#activityDialog').close(); openRescue(); };
}
async function updateProgress(status, percent, extra = {}) { await request(`/api/activities/${selectedActivity.id}/progress`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,percent,...extra})}); $('#activityDialog').close(); await loadActivities(); await loadRecommendations(); }
async function saveWin() {
  const text = window.prompt('What did you do? Make the win small and true.', selectedActivity.starter);
  if (text === null) return;
  await request(`/api/activities/${selectedActivity.id}/wins`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text}) });
  $('#activityDialog').close();
  await loadActivities(); await loadRecommendations(); await loadWins();
}
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
async function discoverLocal() {
  const profile = await request('/api/profile');
  const city = window.prompt('Which city or neighbourhood should we search near?', profile.city || '');
  if (!city) return;
  await request('/api/profile', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ city }) });
  const risky = /archery|climb|diving|skydiving|martial|driving|racing|hunting|airsoft/i.test(selectedActivity.name);
  const query = risky ? `certified beginner ${selectedActivity.name} instructor near ${city}` : `beginner ${selectedActivity.name} class or club near ${city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(mapsUrl, '_blank', 'noopener');
}
async function loadPlans() {
  const plans = await request('/api/plans');
  let section = $('#upcomingPlans');
  if (!section) { $('.controls').insertAdjacentHTML('afterend', '<section id="upcomingPlans"><div class="section-title"><div><p class="eyebrow">UPCOMING PROMISES</p><h2>A time you chose for yourself.</h2></div></div><div class="library" id="planCards"></div></section>'); section = $('#upcomingPlans'); }
  $('#planCards').innerHTML = plans.length ? plans.slice(0, 4).map(plan => `<article class="activity"><span>${plan.activity.icon}</span><strong>${plan.activity.name}</strong><small>${new Date(plan.when).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</small><p>${plan.action}</p><button class="donePlan" data-id="${plan.id}">I showed up ✦</button></article>`).join('') : '<p>No promises yet. Choose one activity and give it a real time.</p>';
  document.querySelectorAll('.donePlan').forEach(button => button.onclick = async () => { await request(`/api/plans/${button.dataset.id}/done`, {method:'POST'}); await loadPlans(); });
}
async function loadProblems() {
  const current = activities.filter(activity => activity.progress.status === 'Problem-solving');
  let section = $('#problemShelf');
  if (!section) { $('#upcomingPlans').insertAdjacentHTML('afterend', '<section id="problemShelf"><div class="section-title"><div><p class="eyebrow">PROBLEMS, NOT FAILURES</p><h2>One thing to solve at a time.</h2></div></div><div class="library" id="problemCards"></div></section>'); section = $('#problemShelf'); }
  $('#problemCards').innerHTML = current.length ? current.map(activity => `<article class="activity"><span>${activity.icon}</span><strong>${activity.name}</strong><small>Problem: ${activity.progress.activeProblem || 'Needs a next move'}</small><p>${activity.progress.rescuePlan || ''}</p><button class="solvedProblem" data-id="${activity.id}">I solved it / I returned ✦</button></article>`).join('') : '<p>No open problems. Rescue Mode will hold a difficult activity here instead of letting it disappear.</p>';
  document.querySelectorAll('.solvedProblem').forEach(button => button.onclick = async () => { selectedActivity = activities.find(activity => activity.id === button.dataset.id); await updateProgress('Continuing', 80, { activeProblem: '', rescuePlan: '' }); await loadProblems(); });
}
async function loadWins() {
  const wins = await request('/api/wins');
  let section = $('#winShelf');
  if (!section) { $('#problemShelf').insertAdjacentHTML('afterend', '<section id="winShelf"><div class="section-title"><div><p class="eyebrow">PRIVATE EVIDENCE</p><h2>You showed up.</h2></div></div><div class="library" id="winCards"></div></section>'); section = $('#winShelf'); }
  $('#winCards').innerHTML = wins.length ? wins.slice(0, 6).map(win => `<article class="activity"><span>${win.activity.icon}</span><strong>${win.activity.name}</strong><small>${new Date(win.createdAt).toLocaleDateString([], {month:'short', day:'numeric'})}</small><p>${win.text}</p></article>`).join('') : '<p>Your small wins will live here. Researching, preparing, and trying count.</p>';
}
function openRescue(){ $('#barriers').innerHTML=barriers.map(x=>`<button data-barrier="${x}">${x}</button>`).join(''); $('#rescuePlan').style.display='none'; $('#rescueDialog').showModal(); document.querySelectorAll('[data-barrier]').forEach(b=>b.onclick=()=>showPlan(b.dataset.barrier)); }
function showPlan(barrier){ const plans={ 'No time':'If today has no space, then choose a five-minute version now and put one exact 20-minute slot in tomorrow’s calendar.', 'Low energy':'If my body is tired, then I will choose a seated, smaller version or rest without guilt and set a return time.', 'It costs too much':'If cost blocks me, then I will research one free, borrowed, rented, or trial version before leaving it.', 'I feel bad at it':'If I feel embarrassed, then I will make an intentionally bad five-minute attempt and keep it private.', 'I need equipment':'If equipment blocks me, then I will list the minimum item, a borrow option, and one place to get it.', 'I am scared':'If fear appears, then I will make the next action safer: read, watch, ask an instructor, or bring a friend.', 'I lost excitement':'If excitement faded, then I will reconnect to why I saved this—or consciously move it to Left it for now.', 'Other commitment':'If another commitment wins today, then I will not disappear; I will pick a new specific day or pause intentionally.'}; $('#rescuePlan').innerHTML=`<strong>That is a real problem. Here is the rescue plan:</strong><br>${plans[barrier]}<br><br><button id="saveProblem">I will solve this problem</button>`; $('#rescuePlan').style.display='block'; $('#saveProblem').onclick=async()=>{ await updateProgress('Problem-solving', Math.max(selectedActivity.progress.percent,65), { activeProblem: barrier, rescuePlan: plans[barrier] }); $('#rescueDialog').close(); await loadProblems(); }; }
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#refresh').onclick=async()=>{ try { await request('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({time:$('#time').value,energy:$('#energy').value,body:$('#body').value,workload:$('#workload').value,place:$('#place').value,budget:$('#budget').value,mood:$('#mood').value})}); await loadRecommendations(); } catch (error) { $('#recommendations').innerHTML = '<p>Could not save these choices. Restart the server and try again.</p>'; console.error(error); } };
$('#openLookout').onclick=()=>$('#lookoutDialog').showModal();
$('#saveLookout').onclick=async()=>{ await request('/api/reflections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({did:$('#did').value,learned:$('#learned').value,next:$('#next').value})}); $('#lookoutDialog').close(); ['did','learned','next'].forEach(id=>$('#'+id).value=''); alert('Saved. This is evidence that you showed up. ✦'); };
function addNavigation() {
  if ($('#mainNav')) return;
  const active = window.location.pathname;
  const link = (href, label) => `<a href="${href}" style="text-decoration:none;color:${active === href ? '#fff' : '#302521'};background:${active === href ? '#302521' : '#fff'};border:1px solid #d9cdc0;border-radius:999px;padding:10px 15px;font:600 13px 'Plus Jakarta Sans',sans-serif;white-space:nowrap">${label}</a>`;
  $('header').insertAdjacentHTML('afterend', `<nav id="mainNav" aria-label="Main navigation" style="display:flex;gap:8px;overflow-x:auto;padding:16px 0 24px;border-bottom:1px solid #d9cdc0;margin-bottom:24px">${link('/', '✦ Explore')}${link('/curiosity', '☾ Activities')}${link('/recent', '▣ Recent')}${link('/add', '+ Add Activity')}</nav>`);
}
async function renderActivityPage(id) {
  let activity; try { activity = await request(`/api/activities/${id}`); } catch (_) { return; }
  document.querySelectorAll('main > section').forEach(section => section.style.display = 'none');
  $('.controls').style.display = 'none';
  $('.shell').insertAdjacentHTML('beforeend', `<section class="activity-page"><p class="eyebrow">YOUR EXPLORATION</p><a href="/curiosity">← Back to curiosity map</a><h2>${activity.icon} ${activity.name}</h2><p>${activity.reason}</p><button id="logToday">+ Log what I did today</button><div class="journey"><div class="journey-head"><span>${activity.progress.status}</span><span>${activity.progress.percent}% explored</span></div><div class="journey-bar"><i style="width:${activity.progress.percent}%"></i></div><small>Curious → Research → Prepare → Try → Solve → Return → Explore</small></div><div class="prep"><strong>Your answers</strong><p><b>Why:</b> ${activity.progress.why || 'Not answered yet.'}</p><p><b>Real-life plan:</b> ${activity.progress.commitmentPlan || 'Not answered yet.'}</p><p><b>Usual barrier:</b> ${activity.progress.knownBarrier || 'Not answered yet.'}</p></div><h3>Everything that happened</h3><div class="timeline">${(activity.progress.history || []).map(event => `<article class="activity"><small>${new Date(event.createdAt).toLocaleString()}</small><strong>${event.type}</strong><p>${event.text}</p></article>`).join('') || '<p>Your research, plans, small wins, and changes will appear here.</p>'}</div></section>`);
  $('#logToday').onclick = () => { $('#todayLog').style.display = 'block'; $('#todayLog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $('#logToday').insertAdjacentHTML('afterend', `<form id="todayLog" style="display:none;margin-top:22px;padding:24px;background:#fff;border:1px solid #d9cdc0;border-radius:18px;box-shadow:0 10px 26px #30252112"><p class="eyebrow">TODAY'S CHECK-IN</p><h3 style="font:500 28px 'Playfair Display',serif;margin:0 0 8px">What did I do today?</h3><p style="font-size:13px;line-height:1.55;color:#755f54;margin:0 0 20px">Log the truth, then place yourself in the journey. One honest action is enough.</p><div style="padding:16px;background:#eef0e8;border-radius:13px;margin-bottom:18px"><label style="display:block;font-weight:700;font-size:14px">Where are you in the journey today?<select id="pagePhase" style="display:block;width:100%;margin-top:8px;padding:12px;border:1px solid #ccd3c8;border-radius:9px;background:#fff;font:inherit"><option value="Curious">Curious — 15%</option><option value="Research">Research — 30%</option><option value="Prepare">Prepare — 50%</option><option value="Try">Try — 60%</option><option value="Solve">Solve — 80%</option><option value="Return">Return — 90%</option><option value="Explore">Explore — 100%</option></select></label><div id="phasePreview" style="margin-top:12px;color:#7c4b4e;font-weight:700">This phase sets your progress to 15%.</div></div><label style="display:block;font-weight:700;font-size:14px;margin:16px 0">What did I actually do?<textarea id="todayText" required placeholder="Research, preparation, a small try, or a return all count." style="display:block;width:100%;min-height:84px;margin-top:8px;padding:12px;border:1px solid #d9cdc0;border-radius:9px;font:inherit"></textarea></label><details style="margin:18px 0"><summary style="cursor:pointer;font-weight:700">Update my activity setup</summary><label style="display:block;margin-top:14px">Why did I choose ${activity.name}?<textarea id="pageWhy" style="display:block;width:100%;min-height:64px;margin-top:7px;padding:10px;border:1px solid #d9cdc0;border-radius:9px;font:inherit">${activity.progress.why || ''}</textarea></label><label style="display:block;margin-top:14px">What needs to be prepared?<textarea id="pagePlan" style="display:block;width:100%;min-height:64px;margin-top:7px;padding:10px;border:1px solid #d9cdc0;border-radius:9px;font:inherit">${activity.progress.commitmentPlan || ''}</textarea></label><label style="display:block;margin-top:14px">What usually makes me leave it?<textarea id="pageBarrier" style="display:block;width:100%;min-height:64px;margin-top:7px;padding:10px;border:1px solid #d9cdc0;border-radius:9px;font:inherit">${activity.progress.knownBarrier || ''}</textarea></label></details><button style="width:100%">Save today’s work ✦</button></form>`);
  const phasePercent = { Curious: 15, Research: 30, Prepare: 50, Try: 60, Solve: 80, Return: 90, Explore: 100 };
  $('#pagePhase').value = phasePercent[activity.progress.status] ? activity.progress.status : 'Curious';
  $('#phasePreview').textContent = `This phase sets your progress to ${phasePercent[$('#pagePhase').value]}%.`;
  $('#pagePhase').onchange = () => { $('#phasePreview').textContent = `This phase sets your progress to ${phasePercent[$('#pagePhase').value]}%.`; };
  $('#todayLog').onsubmit = async event => { event.preventDefault(); const phase = $('#pagePhase').value; await request(`/api/activities/${activity.id}/wins`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: $('#todayText').value.trim() }) }); await request(`/api/activities/${activity.id}/progress`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: phase, percent: phasePercent[phase], why: $('#pageWhy').value.trim(), commitmentPlan: $('#pagePlan').value.trim(), knownBarrier: $('#pageBarrier').value.trim() }) }); window.location.reload(); };
}
async function renderRecentPage() { document.querySelectorAll('main > section').forEach(section => section.style.display = 'none'); const reflections = await request('/api/reflections'); $('.shell').insertAdjacentHTML('beforeend', `<section class="activity-page"><p class="eyebrow">YOUR RECENT EVIDENCE</p><h2>Daily Lookout</h2><p>Every honest check-in you have written.</p><div class="timeline">${reflections.map(reflection => `<article class="activity"><small>${new Date(reflection.createdAt).toLocaleDateString()}</small><strong>${reflection.did || 'A quiet day'}</strong><p>${reflection.learned || ''}</p><p><b>Next:</b> ${reflection.next || ''}</p></article>`).join('') || '<p>Your Daily Lookout entries will appear here.</p>'}</div></section>`); }
function renderAddPage() { document.querySelectorAll('main > section').forEach(section => section.style.display = 'none'); $('.shell').insertAdjacentHTML('beforeend', '<section class="activity-page"><p class="eyebrow">ADD A NEW SPARK</p><h2>What do you want to try?</h2><form id="addActivityForm"><label>Name<input id="newName" required></label><label>Why does it interest you?<textarea id="newReason"></textarea></label><label>First 30-minute action<textarea id="newStarter"></textarea></label><label>Energy<select id="newEnergy"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></label><button>Add to my curiosity map</button></form></section>'); $('#addActivityForm').onsubmit = async event => { event.preventDefault(); const activity = await request('/api/activities', {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$('#newName').value,reason:$('#newReason').value,starter:$('#newStarter').value,energy:$('#newEnergy').value})}); window.location.href = `/${activity.id}`; }; }
function renderCuriosityPage() { document.querySelectorAll('main > section').forEach(section => { if (!section.querySelector('#library')) section.style.display = 'none'; }); }
(async () => {
  const auth = await window.authReady;
  if (auth && !(await window.currentAccessToken())) { window.showSignIn(); return; }
  const session = auth ? (await auth.auth.getSession()).data.session : null;
  if (session) $('#signInButton').textContent = 'Sign out';
  if (session) $('#signInButton').onclick = window.signOut;
  await loadProfile(); await loadActivities(); addNavigation();
  const id = window.location.pathname.slice(1);
  if (id === 'curiosity') return renderCuriosityPage();
  if (id === 'recent') return renderRecentPage();
  if (id === 'add') return renderAddPage();
  if (id && activities.some(activity => activity.id === id)) return renderActivityPage(id);
  await loadRecommendations(); await loadPlans(); await loadProblems(); await loadWins();
  document.querySelector('#library').closest('section').style.display = 'none';
})().catch((error) => { console.error(error); $('#recommendations').innerHTML = '<p>Could not connect to your saved data. Please sign in again or check the deployment settings.</p>'; });
