# IELTS Writing Mastery

Production-oriented Next.js 16.3 App Router starter for an IELTS Writing Task 2 learning platform based on the provided programme document.

## Included

- Modern minimal responsive UI with sticky header and footer
- Header navigation for Home, Dashboard, Lessons, Practice, Essay Analyzer, Portfolio and Teacher
- KZ / RU / EN language selector in the header (core navigation labels are localized)
- Student dashboard with progress, TR/CC/LR/GRA indicators, XP and learning path
- Course map preserving the 34-lesson structure from the source programme
- Initial lessons seeded in `lib/course.ts`; additional lessons can be added later
- Lesson detail pages with interactive practice
- Guided writing workspace: question analysis, essay plan, full essay and self-assessment
- Essay Analyzer API with a local heuristic fallback so the project works without an external AI key
- Teacher dashboard with student analytics and common-error panels
- Teacher content manager at `/teacher/content` for adding/removing lesson records in local storage
- Portfolio with first draft → feedback → rewrite → final workflow representation

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production AI integration

The current `/api/analyze` route intentionally works without an API key. To integrate a real LLM later, keep the same response contract and replace the heuristic section with your preferred provider SDK.

## Content architecture

Add or edit seed lessons in `lib/course.ts`. The course keeps the source structure:

- Unit 0 — Foundation (1–2)
- Unit 1 — Discussion Essays (3–9)
- Unit 2 — Agree / Disagree (10–16)
- Unit 3 — Advantage / Disadvantage (17–22)
- Unit 4 — Problem / Solution (23–28)
- Unit 5 — Two-Part Question (29–32)
- Exam Practice (33)
- Final Mock Test (34)

The app can later move the same data model into PostgreSQL/Supabase/another persistent database without changing the main UI flow.
