const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
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

const state = { profile: { time: '20', energy: 'medium', place: 'home', budget: '0', mood: 'creativity' }, progress: {}, reflections: [] };
activities.forEach((activity) => { state.progress[activity.id] = { status: 'Curious', percent: 0, completed: [] }; });

function score(activity, profile) {
  let value = 40;
  if (activity.energy === profile.energy) value += 24;
  if (profile.mood === 'creativity' && activity.category === 'Make & create') value += 18;
  if (profile.mood === 'movement' && activity.category === 'Movement & sport') value += 18;
  if (profile.mood === 'calm' && activity.energy === 'low') value += 18;
  if (profile.time === '5' && activity.starter.length < 80) value += 10;
  if (profile.place === 'home' && ['Archery', 'Sport climbing'].includes(activity.name)) value -= 25;
  return value + (state.progress[activity.id].status === 'Planning' ? 12 : 0);
}

app.get('/api/activities', (req, res) => res.json(activities.map((a) => ({ ...a, progress: state.progress[a.id] }))));
app.get('/api/recommendations', (req, res) => {
  const profile = { ...state.profile, ...req.query };
  const recommended = [...activities].sort((a, b) => score(b, profile) - score(a, profile)).slice(0, 3);
  res.json(recommended.map((a, index) => ({ ...a, progress: state.progress[a.id], type: ['Easy win', 'Progress move', 'Brave spark'][index] })));
});
app.post('/api/profile', (req, res) => { state.profile = { ...state.profile, ...req.body }; res.json(state.profile); });
app.post('/api/activities/:id/progress', (req, res) => {
  const current = state.progress[req.params.id];
  if (!current) return res.status(404).json({ error: 'Unknown activity' });
  state.progress[req.params.id] = { ...current, ...req.body };
  res.json(state.progress[req.params.id]);
});
app.post('/api/reflections', (req, res) => { state.reflections.unshift({ ...req.body, createdAt: new Date().toISOString() }); res.status(201).json(state.reflections[0]); });
app.listen(port, () => console.log(`Try Something running at http://localhost:${port}`));
