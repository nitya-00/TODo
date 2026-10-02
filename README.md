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

The app stores your selections, progress, personal plans, and reflections in `data/state.json` on your own computer. That file is excluded from Git, so it is not meant to be committed or shared.

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
