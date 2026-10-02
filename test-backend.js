const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'try-something-test-'));
process.env.TRY_SOMETHING_STATE_PATH = path.join(tempDirectory, 'state.json');
const { app } = require('./server');

function call(method, url, body) {
  return new Promise((resolve, reject) => {
    const raw = body ? Buffer.from(JSON.stringify(body)) : null;
    const request = new Readable({ read() { this.push(raw); this.push(null); } });
    request.method = method;
    request.url = url;
    request.originalUrl = url;
    request.headers = raw ? { 'content-type': 'application/json', 'content-length': String(raw.length) } : {};

    const chunks = [];
    const response = {
      statusCode: 200,
      headers: {},
      setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
      getHeader(key) { return this.headers[key.toLowerCase()]; },
      removeHeader(key) { delete this.headers[key.toLowerCase()]; },
      write(chunk) { chunks.push(Buffer.from(chunk)); return true; },
      end(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        resolve({ status: this.statusCode, body: Buffer.concat(chunks).toString() });
      }
    };
    app.handle(request, response, reject);
  });
}

async function json(method, url, body) {
  const result = await call(method, url, body);
  if (result.status < 200 || result.status > 299) throw new Error(`${method} ${url} returned ${result.status}: ${result.body}`);
  return JSON.parse(result.body);
}

async function run() {
  const activities = await json('GET', '/api/activities');
  if (activities.length < 230) throw new Error(`Expected at least 230 activities, received ${activities.length}.`);
  const calligraphy = await json('GET', '/api/activities/calligraphy');
  if (calligraphy.name !== 'Calligraphy') throw new Error('Individual activity endpoint returned the wrong activity.');
  const created = await json('POST', '/api/activities', { name: 'Backend test activity', energy: 'low', starter: 'Write an endpoint test.' });
  if (created.id !== 'backend-test-activity') throw new Error('Add Activity endpoint did not create the activity.');

  const recommendations = await json('GET', '/api/recommendations?time=20&energy=medium&body=normal&workload=normal&place=home&budget=0&mood=creativity');
  if (recommendations.map((item) => item.type).join(',') !== 'Easy win,Progress move,Brave spark') throw new Error('Recommendation types are invalid.');
  const activeRecommendations = await json('GET', '/api/recommendations?time=60&energy=high&body=active&workload=light&place=outside&budget=flexible&mood=movement');
  if (recommendations.map((item) => item.id).join(',') === activeRecommendations.map((item) => item.id).join(',')) throw new Error('Recommendation parameters did not change the activity choices.');

  await json('POST', '/api/profile', { body: 'resting', workload: 'overwhelmed', city: 'Test City' });
  const profile = await json('GET', '/api/profile');
  if (profile.city !== 'Test City' || profile.body !== 'resting') throw new Error('Profile did not persist.');

  const plan = await json('POST', '/api/plans', { activityId: 'calligraphy', when: '2026-10-03T09:00', action: 'Trace one letter' });
  if (!(await json('GET', '/api/plans')).some((item) => item.id === plan.id)) throw new Error('Plan was not saved.');
  await json('POST', `/api/plans/${plan.id}/done`);

  await json('POST', '/api/activities/calligraphy/wins', { text: 'Test tiny win' });
  await json('POST', '/api/activities/calligraphy/wins', { text: 'Second test tiny win' });
  if (!(await json('GET', '/api/wins')).some((item) => item.text === 'Test tiny win')) throw new Error('Tiny win was not saved.');
  const afterWins = await json('GET', '/api/activities/calligraphy');
  if (afterWins.progress.percent !== 60) throw new Error('A repeated tiny win did not advance progress.');

  await json('POST', '/api/activities/calligraphy/progress', { status: 'Problem-solving', percent: 65, activeProblem: 'No time' });
  const updatedCalligraphy = (await json('GET', '/api/activities')).find((activity) => activity.id === 'calligraphy');
  if (updatedCalligraphy.progress.status !== 'Problem-solving' || updatedCalligraphy.progress.percent !== 65) throw new Error('Rescue/progress state was not saved.');
  await json('POST', '/api/reflections', { did: 'Tested every endpoint', learned: 'Tests protect real data', next: 'Run the app' });
  const reflections = await json('GET', '/api/reflections');
  if (reflections[0]?.did !== 'Tested every endpoint') throw new Error('Daily Lookout endpoint did not persist.');
}

run()
  .then(() => console.log('PASS — backend activity, recommendation, profile, plan, win, rescue, and persistence flows are working.'))
  .finally(() => fs.rmSync(tempDirectory, { recursive: true, force: true }));
