# Summer Command Center

**A React dashboard for daily planning, habits, and reflection.**

A personal productivity application built with React and Vite. It organizes time blocks and habits, tracks daily completion, and synchronizes a daily objective and reflection entries through Firebase Firestore.

## Features

- Add, complete, and remove scheduled blocks and habits.
- Group time blocks by school, projects, career, health, life, and reset.
- Track overall completion and completed career/project blocks.
- Store a daily objective and short reflection.
- Animate list changes with Framer Motion.

## Local development

```bash
git clone https://github.com/Iwetter/summer-command-center.git
cd summer-command-center
npm ci
npm run dev
```

The application requires a configured Firebase project and Firestore. Review `src/firebase.js` and use your own configuration and access rules before running a connected copy. The current code stores documents by date under `days`; it does not implement a separate authenticated user namespace.

```bash
npm run build
npm run lint
```

## Source map

| File | Role |
|---|---|
| `src/App.jsx` | Dashboard, daily state, Firestore updates, and reusable UI elements |
| `src/firebase.js` | Firebase initialization |
| `src/index.css`, `src/App.css` | Styles |
| `vite.config.js` | Development and build configuration |

**Tools:** React · JavaScript · Vite · Firebase · Tailwind CSS · Framer Motion

[Ian Hall's engineering portfolio](https://github.com/Iwetter)
