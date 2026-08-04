# Lumen

Culturally responsive STEM teaching, powered by AI.

Lumen helps high school STEM teachers generate culturally responsive, accessible, and differentiated lesson plans, activities, assessments, and feedback, with cultural responsiveness built in by default rather than bolted on. It's grounded in Culturally Responsive Pedagogy (CRP), Culturally Sustaining Pedagogy (CSP), Universal Design for Learning (UDL), and responsible GenAI use.

## Quick start

```bash
npm install
npm run dev      # → http://localhost:5173

```

No API key, database, or backend required: Lumen runs on a context-aware generation engine out of the box. A live LLM can be wired in via `callLLM()` in `src/engine/mockAI.js`.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build

```



## Deployment

Deployed via Vercel, connected to the `main` branch. Push to `main` to deploy, or run `vercel` locally to preview a build before pushing. Vercel auto-detects the Vite framework and runs `npm run build`.

Because the app is a single-page app that uses the History API for clean URLs (`/builder`, `/about`, `/method`), `vercel.json` includes a SPA rewrite that serves `index.html` for any path not matching a static file. Without it, refreshing or directly opening a deep URL returns Vercel's platform `404: NOT_FOUND`. Keep this file — it is required for client-side routing to survive a page load.

## Features

- One reusable class profile: Class Context · Cultural & Community Anchors · Accessibility Supports · Differentiation Options.
- Four generators: Lesson Plan · Activity/PBL · Assessment (quiz, exit ticket, rubric, multimodal) · Feedback (strengths, growth, reflection, family-friendly).
- Review for Bias & Fit: a CRP/UDL checklist that flags deficit language, missing accessibility, and stereotype risk.
- One-click revisions: make it more accessible, low-tech, multilingual, project-based, or strengthen cultural examples.
- Export: copy, Markdown, plain text, and print/PDF.
- Prompt Library: a shared system prompt plus 15 structured, versioned templates.
- Light & dark themes, keyboard-accessible, responsive, and reduced-motion aware.



## Why it's different

Most teacher-AI tools treat culture as optional free text and never review their own output. Lumen makes cultural responsiveness and accessibility structural: required inputs, always-visible rationale in every output, a built-in bias/fit review, and a genuine low-tech path, all while preserving rigor.

## Tech stack

React 18 + Vite. Plain CSS design system with semantic light/dark tokens (Plus Jakarta Sans · Lora · JetBrains Mono). No UI framework dependency.

## Project structure

```
src/
├── data/         content & config (personas, prompts, glossary, schema, scenarios)
├── engine/       mockAI.js: generation, revision, review, export
├── components/   Icon.jsx, DocView.jsx, ui.jsx (theme, toast, reveal)
├── pages/        Landing, Generate, Foundations, Prompts
└── styles/       theme.css (design tokens) + app.css (components)

```



## Responsible use

Review AI outputs for accuracy and cultural fit before classroom use. Never enter personally identifiable student information.

