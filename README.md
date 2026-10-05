# Try Something

A private exploration studio for turning a long list of activities into small, realistic next steps. It is designed to help you prepare for an activity, return when it gets difficult, and count research and tiny attempts as progress.

## What it does

- Keeps a library of 230+ activities from your supplied lists, images, and a curated expansion of broad hobby catalogues
- Recommends an easy win, a progress move, and a brave spark based on your available time, energy, body needs, commitments, location, budget, and mood
- Shows a preparation checklist and a five-minute starter action
- Finds beginner classes, clubs, and certified instructors near a city you choose
- Saves your personal reason, real-life constraints, and usual barriers for every activity
- Uses Rescue Mode to turn a practical problem into a smaller next step
- Records your end-of-day Lookout reflection
- Stores your progress locally, so it remains after restarting the app

## Run it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
cd /Users/apple/Downloads/TODo
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

`npm start` runs both the Express backend and the frontend served by that backend on port `3000`.

If you see `npm ERR! Missing script: start`, first check that your terminal is
in the folder containing this project's `package.json`:

```bash
cd /Users/apple/Downloads/TODo
npm run
```

It should list `start`. If it does not, you are in a different project folder.
Use `npm install` once after pulling these changes, then run `npm start`.

## Run with Docker and PostgreSQL

Docker starts the app and a private PostgreSQL container together:

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000). The development PostgreSQL username is `try_something`, the database is `try_something`, and the development password is `try_something_dev_password`. Change both the password and `SESSION_SECRET` before deploying publicly.

Stop the containers with:

```bash
docker compose down
```

To stop the app, return to the terminal and press `Ctrl+C`.

## Test the backend

```bash
npm test
```

The test exercises the complete API using temporary data, so it never changes your saved activities, reflections, or plans.

## How to use it

1. Select your available time, energy, and mood, then choose **Find my three**.
2. Open one activity card.
3. Save why it matters to you, what needs preparing, and the thing that usually makes you leave it.
4. Choose **Start preparing** or complete the five-minute starter action.
5. If you feel stuck, choose **I want to quit / I’m stuck**. Rescue Mode helps you name the barrier and choose a realistic next move.
6. End the day with **Daily Lookout**. Research and preparation count as evidence that you showed up.

## Data and privacy

Without Supabase configured, the app stores selections, progress, plans, and
reflections in `data/state.json` on your own computer. That file is excluded
from Git, so it is not meant to be committed or shared. This is why the data
you can currently see is not visible in a hosted backend.

## Deploy with Vercel + Supabase

This project does not need Render. Vercel hosts the Express app as a serverless
function and Supabase supplies both sign-in and the durable database.

1. Create a new Supabase project. In **SQL Editor**, run the complete contents
   of [`supabase/schema.sql`](supabase/schema.sql). It creates the
   RLS-protected `app_states` table.
2. In Supabase **Authentication → Providers**, keep Email enabled. For the
   simplest first test, you can turn off **Confirm email**; otherwise a new
   user must confirm their Gmail before signing in. Add your Vercel URL to
   **Authentication → URL Configuration → Site URL** after the first deploy.
3. In Supabase **Settings → API**, copy the Project URL and the *publishable*
   (or legacy `anon`) key. Never use the `service_role` key in Vercel or the
   browser.
4. Push this repository to GitHub and import it in Vercel. Before deploying,
   add these Vercel environment variables for Production, Preview, and
   Development:

   ```text
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
   ```

5. Deploy. The sign-in page asks only for a name, Gmail, and password. It signs
   in an existing person or creates a new Supabase Auth account. Once signed
   in, all existing `/api` calls load and save that person’s state in Supabase.

To verify a save, sign in, add a tiny win or Daily Lookout entry, then open
Supabase **Table Editor → app_states**. A row should appear for the signed-in
user and its `updated_at` timestamp should change. The JSON in `state` is the
complete app state for that user.

## Supabase data model

The deployed data model is in `supabase/schema.sql`. It intentionally stores
one JSON state document per authenticated user so the current API can remain
small while every profile setting, activity progress, plan, win, and reflection
is persisted. Row Level Security ensures a user can only read or change their
own row.

To start fresh, stop the app and delete only this file:

```bash
rm data/state.json
```

The next launch will recreate it with every activity set to **Curious**.

## Project structure

```text
server.js           Express API and recommendation logic
public/index.html   App structure
public/app.js       Browser interactions and Rescue Mode
public/styles.css   Visual design
data/state.json     Your local progress (created automatically)
```
