# SmartApply AI – Frontend (React + Vite)

Modern SaaS UI built with React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, and Lucide icons. The frontend is aligned with the UML use‑case/class/sequence specs and is ready for backend integration.

## Stack
- React 19, Vite
- Tailwind CSS (Stripe/Linear-inspired design system)
- Framer Motion (page + hover + loading animations)
- React Router (nested dashboard layout)
- Axios (API calls, auth logout)
- Lucide React Icons

## Project structure
```
src/
  components/ Sidebar.jsx, Navbar.jsx, Card.jsx, FormInput.jsx
  layouts/   DashboardLayout.jsx
  pages/
    Login.jsx, Register.jsx
    Dashboard.jsx
    Profile.jsx
    Experiences.jsx
    Jobs.jsx
    GenerateCV.jsx
    Documents.jsx
```

## Key features by page
- **Auth (Login/Register):** Split layout, animated gradient hero, form validation states, navigation to dashboard.  
- **Dashboard:** SaaS cards, pipeline widgets, recent activity, hover/slide animations.  
- **Profile:** Account form + avatar card; added Education, Skills, Languages sections with add forms/lists; save button with loading/success feedback.  
- **Experiences:** CRUD via modal; cards show role, company, dates, summary, and skills pills. Extra sections for Formations, Skills, Languages with add forms and empty states.  
- **Jobs:** Job list with status pills; add-job modal; highlighted selection; Apply and Save buttons.  
- **Generate CV (AI):** Action selector (Generate CV, Motivation Letter, Email, Improve Content, Adapt to Job Offer); inputs for JD + notes; loading overlay, disabled button during generation, success hint; copy/download enabled after result; template picker with selection highlight.  
- **Documents:** Cards for CV/Letter/Email/Portfolio; preview/download UI, empty state, mock upload/add.  
- **CV Templates:** Included in GenerateCV template picker (Aurora, Minimal, Gradient, Slate).  
- **Global layout:** Sticky navbar, sticky/animated sidebar, scrollable content, min-h-screen pages, consistent spacing (`p-6`, `gap-6`, `rounded-xl`, `shadow-md`).

## UX & interactions
- Page fade/slide transitions via Framer Motion.
- Card hover lift/shadow, button hover scale, focus glows on inputs.
- Loading states for generation and logout; success toasts/text for saves.
- Empty states on lists (experiences, documents, jobs).

## Auth logout flow
- Logout button in `Navbar` sends `POST /auth/logout` with Bearer token (if present), clears `access_token` / `refresh_token` / `token` from `localStorage`, then navigates to `/login` with loading spinner/disabled state.

## Scripts
- `npm run dev` – start dev server  
- `npm run build` – production build  
- `npm run preview` – preview build  
- `npm run lint` – lint with ESLint

## Setup
```bash
cd frontend
npm install
npm run dev
```

Backend endpoints are not wired beyond the logout call; plug your API base URL and endpoints as needed. The UI is ready for professor validation and further integration.
