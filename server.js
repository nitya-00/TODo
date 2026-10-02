const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use((req, res, next) => { if (req.path === '/app.js') res.set('Cache-Control', 'no-store'); next(); });
app.use(express.static(path.join(__dirname, 'public')));

const activities = [
  { id: 'calligraphy', name: 'Calligraphy', icon: '✒️', category: 'Make & create', energy: 'low', starter: 'Trace one letter slowly for five minutes.', prep: ['A pen or pencil', 'One sheet of paper', 'A quiet corner'], reason: 'Make something beautiful with your hands.' },
  { id: 'guitar', name: 'Learn guitar', icon: '🎸', category: 'Music & performance', energy: 'medium', starter: 'Listen to one guitar song and save one beginner lesson.', prep: ['Borrow, rent, or find a guitar', 'Tune it with a free app', 'Choose one 15-minute slot'], reason: 'Learn to make sound you are proud of.' },
  { id: 'painting', name: 'Acrylic painting', icon: '🎨', category: 'Make & create', energy: 'medium', starter: 'Choose three colours and paint one small shape.', prep: ['Paper or canvas', 'Three colours and a brush', 'Clothes you can make messy'], reason: 'Give your imagination a physical shape.' },
  { id: 'writing', name: 'Fiction writing', icon: '✍️', category: 'Words & ideas', energy: 'low', starter: 'Write a deliberately imperfect 100-word scene.', prep: ['Notes app or notebook', 'A timer for 10 minutes', 'One prompt'], reason: 'Let your inner worlds exist outside your head.' },
  { id: 'gardening', name: 'Gardening', icon: '🌱', category: 'Outdoors & nature', energy: 'low', starter: 'Find one plant near you and learn its name.', prep: ['A small pot or existing plant', 'Soil and seeds if planting', 'A light schedule'], reason: 'Care for something that grows slowly.' },
  { id: 'archery', name: 'Archery', icon: '🏹', category: 'Movement & sport', energy: 'medium', starter: 'Find one certified beginner session within your travel radius.', prep: ['Certified instructor only', 'Check age and safety rules', 'Book a beginner slot'], reason: 'Practise focus, calm, and courage.' },
  { id: 'dance', name: 'Dance', icon: '💃', category: 'Music & performance', energy: 'high', starter: 'Play one favourite song and move for its first minute.', prep: ['A clear 2×2 metre space', 'Comfortable clothes', 'One beginner video or class'], reason: 'Feel at home in your body.' },
  { id: 'photography', name: 'Nature photography', icon: '📷', category: 'Outdoors & nature', energy: 'medium', starter: 'Take five photos of one colour you notice today.', prep: ['Phone camera is enough', 'A walking route', 'Choose one theme'], reason: 'Learn to notice the world closely.' },
  { id: 'cooking', name: 'Cook a new meal', icon: '🍳', category: 'Food & life', energy: 'medium', starter: 'Save one recipe with five ingredients or fewer.', prep: ['Recipe and shopping list', '45–60 minute time block', 'Kitchen basics'], reason: 'Make care visible and edible.' },
  { id: 'journaling', name: 'Journaling', icon: '📓', category: 'Words & ideas', energy: 'low', starter: 'Write: “Today I need…” and finish the sentence three times.', prep: ['Notebook or notes app', 'Five calm minutes'], reason: 'Hear yourself clearly.' },
  { id: 'climbing', name: 'Sport climbing', icon: '🧗', category: 'Movement & sport', energy: 'high', starter: 'Compare two supervised beginner climbing sessions.', prep: ['Indoor gym or certified guide', 'Check safety briefing', 'Wear flexible clothes'], reason: 'Meet a challenge with your whole self.' },
  { id: 'language', name: 'Learn a language', icon: '🗣️', category: 'Learning', energy: 'low', starter: 'Learn and say five useful phrases aloud.', prep: ['Choose one language only', 'One beginner source', 'A repeatable daily cue'], reason: 'Open another way of seeing people and places.' }
];

// Everything transcribed from the handwritten lists and hobby screenshots.
// The first set above has hand-written starter plans; these are ready to personalise in the app.
const importedNames = [
  'Acting','Canoeing','Hiking','Hunting','Rafting','Aikido','Airsoft','Skiing','Animation','Art','Gymnastics','Astrology','Astrophotography','Badminton','Baking','Basket weaving','Bhangra','Belly dance','Blogging','Jiu-jitsu','Breakdancing','Camping','DIY','Driving','Drumming','Horror makeup','Fiction story writing','Flute','Folk dance','Sewing','Hip-hop dancing','Horseback riding','Comedy','Interior design','Investments','Judo','Kite flying','Knitting','Juggling','Learn Arabic','Learn Bengali','Learn Dutch','Learn French','Learn German','Learn Punjabi','Learn British English','Thai cooking','Italian cooking','Roller skating','Magic tricks','Makeup artist','Martial arts','Meditating','Memes','Paintball','Paper crafting','Poetry writing','Puzzles','Robotics','Read fingerprinting','Scrapbooking','Scuba diving','Sightseeing','Skydiving','Soap making','Sumo','VR','Vlogging','Yoga','Wrestling','Kung fu','Video editing','Coding','Mehndi','Rangoli','Watercolour painting','West African dancing','Whale watching','Whittling','Wildlife photography','Windsurfing','Wood burning','Woodworking','Athletics','Attend concerts','Audio mastering','Audio production','BASE jumping','BMX','Bachata dancing','Backpacking','Ballet','Ballooning','Ballroom dancing','Leathercraft','Letterboxing','Line dancing','Listening to music','Locking dance','Longboarding','Luge','Lyrical dancing','Machine embroidery','Macro photography','Maculele','Motorcycle road racing','Mountain biking','Mountain climbing','Mountaineering','Muay Thai','Music festivals','Musical theatre','Musical performance','Mycology and lichens','Nail art','Nature photography','Needlepoint','Netball','Nightclubs and clubbing','Nordic skiing','Obstacle racing','Off-road racing','Open water swimming','Opera','Orienteering','Origami','Outrigger canoeing','Paddleboarding','Songwriting','Sourdough','Speed skating','Spelunking and cave diving','Spinning','Spinning yarn','Spoken word','Snorkelling','Snowboarding','Snowmobile racing','Softball'
];
// Additional broad exploration ideas curated from large public hobby catalogues.
const discoveryNames = ['Beekeeping','Birdwatching','Blacksmithing','Bookbinding','Candle making','Ceramics','Chess','Crochet','Cross-stitch','Cycling','DJing','Digital illustration','Dollhouse making','Embroidery','Fencing','Film making','Flower arranging','Foraging','Geocaching','Glass blowing','Go-karting','Graphic design','Ice skating','Improv theatre','Jewellery making','Kayaking','Lego building','Metal detecting','Model building','Mosaic art','Museum hopping','Paper quilling','Parkour','Pilates','Podcasting','Pottery','Public speaking','Rock balancing','Salsa dancing','Screen printing','Sketching','Stand-up comedy','Star gazing','Surfing','Table tennis','Taekwondo','Terrarium making','Theatre','Travel writing','Ukulele','Urban sketching','Volunteering','Watercolour illustration','Web design','Weight training','Wood carving','Board games','Card games','Dungeons and Dragons','Escape rooms','Piano','Violin','Harmonica','Beatboxing','Bonsai','Aquascaping','Fermenting','Kombucha brewing','Coffee tasting','Tea tasting','Bread making','Cake decorating','Sculpting','Clay modelling','3D printing','Electronics','Arduino','Game development','Cybersecurity','Data visualisation','Leatherworking','Upcycling','Furniture restoration','Thrifting','Antiquing','Collecting vinyl','Stamp collecting','Coin collecting','Astronomy','Meteorology','Botany','Herbalism','Fishing','Trail running','Walking tours','Picnicking','Beach combing','Yoga nidra','Breathwork'];
const categoryFor = (name) => /dance|acting|sing|music|drum|guitar|flute|comedy|opera|theatre|spoken/i.test(name) ? 'Music & performance' : /ski|sport|judo|kung|aikido|martial|wrest|climb|bike|swim|race|badminton|gym|yoga|hike|raft|canoe|dive|skate|bmx|netball|softball|archery/i.test(name) ? 'Movement & sport' : /paint|art|craft|makeup|sew|knit|weav|origami|wood|paper|mehndi|rangoli|interior|animation|edit/i.test(name) ? 'Make & create' : /cook|baking|sourdough/i.test(name) ? 'Food & life' : /photo|garden|astro|whale|mycology|camp|sight|outdoor/i.test(name) ? 'Outdoors & nature' : /write|read|blog|journal|language|coding|robot|invest|astrology/i.test(name) ? 'Words & ideas' : 'Exploration';
const iconFor = (category) => ({ 'Music & performance': '🎭', 'Movement & sport': '🏃', 'Make & create': '🧶', 'Food & life': '🍋', 'Outdoors & nature': '🌿', 'Words & ideas': '📚', Exploration: '✦' }[category]);
importedNames.forEach((name) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!activities.some((a) => a.id === id || a.name.toLowerCase() === name.toLowerCase())) {
    const category = categoryFor(name);
    activities.push({ id, name, icon: iconFor(category), category, energy: category === 'Movement & sport' ? 'high' : 'medium', starter: `Spend five minutes finding your personal first step for ${name}.`, prep: ['Decide what a first try looks like', 'Check the time, cost, place, and equipment', 'Choose one exact next action'], reason: `Explore what ${name} feels like in your own life.` });
  }
});
discoveryNames.forEach((name) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!activities.some((a) => a.id === id || a.name.toLowerCase() === name.toLowerCase())) {
    const category = categoryFor(name);
    activities.push({ id, name, icon: iconFor(category), category, energy: category === 'Movement & sport' ? 'high' : 'medium', starter: `Spend five minutes discovering a gentle first step for ${name}.`, prep: ['Check the time, cost, place, and equipment', 'Choose a small first attempt', 'Set one realistic time'], reason: `See whether ${name} adds something new to your life.` });
  }
});

const statePath = process.env.TRY_SOMETHING_STATE_PATH || path.join(__dirname, 'data', 'state.json');
const freshState = () => ({ profile: { time: '20', energy: 'medium', body: 'normal', workload: 'normal', place: 'home', budget: '0', mood: 'creativity' }, progress: {}, reflections: [], plans: [] });
let state = freshState();
try { state = { ...state, ...JSON.parse(fs.readFileSync(statePath, 'utf8')) }; } catch (_) { /* First run: state is created below. */ }
state.progress = state.progress || {};
state.reflections = state.reflections || [];
state.plans = state.plans || [];
state.profile = { ...freshState().profile, ...(state.profile || {}) };
activities.forEach((activity) => { state.progress[activity.id] = { status: 'Curious', percent: 0, completed: [], history: [], ...state.progress[activity.id] }; });
// Preserve entries saved before timelines were introduced.
activities.forEach((activity) => {
  const progress = state.progress[activity.id];
  const known = new Set((progress.history || []).map((event) => `${event.type}:${event.text}:${event.createdAt}`));
  (progress.completed || []).forEach((win) => {
    const key = `Tiny win:${win.text}:${win.createdAt}`;
    if (!known.has(key)) progress.history.push({ type: 'Tiny win', text: win.text, createdAt: win.createdAt });
  });
  progress.history.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
});
function saveState() {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
saveState();

function score(activity, profile) {
  let value = 40;
  const personal = state.progress[activity.id];
  if (personal?.why) value += 10;
  if (personal?.commitmentPlan) value += 8;
  if (personal?.status === 'Problem-solving') value += 12;
  if (activity.energy === profile.energy) value += 24;
  if (profile.mood === 'creativity' && activity.category === 'Make & create') value += 18;
  if (profile.mood === 'movement' && activity.category === 'Movement & sport') value += 32;
  if (profile.mood === 'calm' && activity.energy === 'low') value += 18;
  if (profile.mood === 'learning' && ['Words & ideas', 'Tech & building'].includes(activity.category)) value += 30;
  if (profile.mood === 'social' && ['Music & performance', 'Movement & sport'].includes(activity.category)) value += 26;
  if (profile.mood === 'adventure' && ['Outdoors & nature', 'Movement & sport'].includes(activity.category)) value += 32;
  if (profile.mood === 'comfort' && ['Food & life', 'Make & create'].includes(activity.category)) value += 28;
  if (profile.mood === 'connection' && ['Music & performance', 'Food & life'].includes(activity.category)) value += 26;
  if (profile.mood === 'courage' && activity.energy === 'high') value += 24;
  if (profile.time === '30' && ['Make & create', 'Words & ideas', 'Food & life'].includes(activity.category)) value += 16;
  if (profile.time === '60' && ['Movement & sport', 'Outdoors & nature'].includes(activity.category)) value += 14;
  if (profile.time === 'day' && ['Outdoors & nature', 'Food & life'].includes(activity.category)) value += 20;
  if (profile.time === 'week' && ['Words & ideas', 'Make & create', 'Learning'].includes(activity.category)) value += 18;
  if (profile.time === '15days' && ['Movement & sport', 'Outdoors & nature', 'Music & performance'].includes(activity.category)) value += 18;
  if (profile.body === 'resting' && activity.energy === 'low') value += 22;
  if (profile.body === 'resting' && activity.energy === 'high') value -= 40;
  if (profile.workload === 'overwhelmed' && activity.energy === 'low') value += 18;
  if (profile.workload === 'overwhelmed' && activity.energy === 'high') value -= 24;
  if (profile.place === 'home' && ['Make & create', 'Words & ideas', 'Food & life'].includes(activity.category)) value += 15;
  if (profile.place === 'home' && ['Movement & sport', 'Outdoors & nature'].includes(activity.category)) value -= 12;
  if (profile.place === 'outside' && ['Movement & sport', 'Outdoors & nature'].includes(activity.category)) value += 18;
  if (profile.budget === '0' && ['Make & create', 'Words & ideas', 'Outdoors & nature'].includes(activity.category)) value += 10;
  if (profile.budget === '0' && activity.category === 'Movement & sport') value -= 8;
  return value + (personal.status === 'Planning' ? 12 : 0);
}

app.get('/api/activities', (req, res) => res.json(activities.map((a) => ({ ...a, progress: state.progress[a.id] }))));
app.get('/api/activities/:id', (req, res) => { const activity = activities.find((item) => item.id === req.params.id); if (!activity) return res.status(404).json({ error: 'Activity not found.' }); res.json({ ...activity, progress: state.progress[activity.id] }); });
app.post('/api/activities', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Activity name is required.' });
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (activities.some((activity) => activity.id === id)) return res.status(409).json({ error: 'That activity already exists.' });
  const category = req.body.category || 'Exploration';
  const activity = { id, name, icon: iconFor(category), category, energy: req.body.energy || 'medium', starter: req.body.starter || `Spend 30 minutes finding your first step for ${name}.`, prep: req.body.prep || ['Choose one realistic first action'], reason: req.body.reason || `Explore whether ${name} belongs in your life.` };
  activities.push(activity);
  state.progress[id] = { status: 'Curious', percent: 0, completed: [], history: [] };
  saveState();
  res.status(201).json({ ...activity, progress: state.progress[id] });
});
app.get('/api/profile', (req, res) => res.json(state.profile));
app.get('/api/recommendations', (req, res) => {
  const profile = { ...state.profile, ...req.query };
  const candidates = activities.filter((activity) => !['Loved', 'Not for me', 'Left it for now'].includes(state.progress[activity.id].status)).sort((a, b) => score(b, profile) - score(a, profile));
  const choose = (predicate, selected) => candidates.find((activity) => !selected.includes(activity) && predicate(activity)) || candidates.find((activity) => !selected.includes(activity));
  const selected = [];
  const gentleDay = profile.body === 'resting' || profile.workload === 'overwhelmed' || profile.time === '30';
  selected.push(choose((activity) => gentleDay ? activity.energy === 'low' : (profile.mood === 'movement' ? activity.category === 'Movement & sport' : activity.category === 'Make & create'), selected));
  selected.push(choose((activity) => state.progress[activity.id].percent > 0, selected));
  selected.push(choose((activity) => activity.category !== selected[0]?.category && activity.category !== selected[1]?.category, selected));
  res.json(selected.filter(Boolean).map((a, index) => ({ ...a, progress: state.progress[a.id], type: ['Easy win', 'Progress move', 'Brave spark'][index] })));
});
app.post('/api/profile', (req, res) => { state.profile = { ...state.profile, ...req.body }; saveState(); res.json(state.profile); });
app.post('/api/activities/:id/progress', (req, res) => {
  const current = state.progress[req.params.id];
  if (!current) return res.status(404).json({ error: 'Unknown activity' });
  state.progress[req.params.id] = { ...current, ...req.body };
  state.progress[req.params.id].history.unshift({ type: 'Status update', text: `Moved to ${req.body.status || current.status}`, createdAt: new Date().toISOString() });
  saveState();
  res.json(state.progress[req.params.id]);
});
app.post('/api/activities/:id/wins', (req, res) => {
  const current = state.progress[req.params.id];
  if (!current) return res.status(404).json({ error: 'Unknown activity' });
  const win = { text: String(req.body.text || 'I showed up.').slice(0, 280), createdAt: new Date().toISOString() };
  const previousWins = (current.completed || []).length;
  current.completed = [win, ...(current.completed || [])];
  current.history = [{ type: 'Tiny win', text: win.text, createdAt: win.createdAt }, ...(current.history || [])];
  current.status = 'Tried once';
  current.percent = previousWins === 0 ? Math.max(current.percent || 0, 50) : Math.min(90, Math.max(current.percent || 50, 50) + 10);
  saveState();
  res.status(201).json(win);
});
app.get('/api/wins', (req, res) => {
  const wins = activities.flatMap((activity) => (state.progress[activity.id].completed || []).map((win) => ({ ...win, activity: { id: activity.id, name: activity.name, icon: activity.icon } }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(wins);
});
app.post('/api/reflections', (req, res) => { state.reflections.unshift({ ...req.body, createdAt: new Date().toISOString() }); saveState(); res.status(201).json(state.reflections[0]); });
app.get('/api/reflections', (req, res) => res.json(state.reflections));
app.get('/api/plans', (req, res) => {
  const plans = state.plans.filter((plan) => !plan.done).sort((a, b) => a.when.localeCompare(b.when));
  res.json(plans.map((plan) => ({ ...plan, activity: activities.find((activity) => activity.id === plan.activityId) })));
});
app.post('/api/plans', (req, res) => {
  const { activityId, when, action } = req.body;
  if (!activities.some((activity) => activity.id === activityId) || !when || !action) return res.status(400).json({ error: 'Activity, time, and action are required.' });
  const plan = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, activityId, when, action, done: false, createdAt: new Date().toISOString() };
  state.plans.push(plan);
  state.progress[activityId] = { ...state.progress[activityId], status: 'Planning', percent: Math.max(state.progress[activityId].percent, 35) };
  state.progress[activityId].history = [{ type: 'Plan', text: `${action} — ${when}`, createdAt: new Date().toISOString() }, ...(state.progress[activityId].history || [])];
  saveState();
  res.status(201).json(plan);
});
app.post('/api/plans/:id/done', (req, res) => {
  const plan = state.plans.find((item) => item.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });
  plan.done = true;
  saveState();
  res.json(plan);
});
app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
if (require.main === module) app.listen(port, () => console.log(`Try Something running at http://localhost:${port}`));
module.exports = { app };
