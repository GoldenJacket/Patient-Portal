# Patient Portal (Vite + React + MUI)
This repository is a small patient portal demo built with Vite, React and Material UI.
This README explains how to set up the project locally, run the dev server, build for production, format code with Prettier, and a few troubleshooting tips.

## Live Demo
[cs6440-group1.pages.dev](https://cs6440-group1.pages.dev/)

## Team
* Carmen Lam — Project Topic & Frontend
* Kumar Meenal — Technical Design
* Zachary Wallace — Implementation & FHIR Integration

## Features
* User authentication (register/login) backed by Supabase
* Personal patient profile stored per user
* Real lab results and conditions pulled from SMART on FHIR sandbox
* AI-powered plain-language explanations of lab results via Anthropic Claude
* PDF document upload and management per user

## Tech Stack
* **Frontend:** React, Vite, Material UI
* **Database & Auth:** Supabase
* **FHIR Data:** SMART Health IT sandbox (r4.smarthealthit.org)
* **AI:** Anthropic Claude API
* **Deployment:** Cloudflare

## Environment Variables
Create a `.env` file in the project root with the following:
```bash
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Prerequisites
* Node.js (v16+ recommended)
* npm (comes with Node.js)
* Recommended: VS Code with the "Prettier - Code formatter" extension by esbenp

## Install dependencies
From the project root (where `package.json` lives):
```bash
npm install
```
If you hit missing package errors for MUI icons, install them:
```bash
npm install @mui/icons-material
```
(You likely already have `@mui/material` and its peers. If not, run `npm install @mui/material @emotion/react @emotion/styled`.)

## Run the dev server
This project uses Vite. Start the dev server with:
```bash
npm run dev
```
If your `package.json` uses a different script name, check the `scripts` section and run the appropriate command (for example `npm start`).
Open the app at the address printed by Vite (usually http://localhost:5173).

## Build for production
```bash
npm run build
```
And preview the production build locally:
```bash
npm run preview
```

## Formatting with Prettier
A `.prettierrc` and `.prettierignore` are included in the repo. To install Prettier locally (dev dependency):
```bash
npm install --save-dev --save-exact prettier
```
Format the whole `src/` tree:
```bash
npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md,html}"
```
Or format a single file:
```bash
npx prettier --write src/App.jsx
```
### VS Code setup
The repo includes `.vscode/settings.json` to set Prettier as the default formatter and enable format-on-save. If you use VS Code:
1. Install the "Prettier - Code formatter" extension (esbenp.prettier-vscode).
2. Ensure the workspace settings (in `.vscode/settings.json`) contain:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

## Project structure (relevant files)
* `src/App.jsx` – top-level app, routing, and auth state
* `src/pages/Login.jsx` – Login page
* `src/pages/Register.jsx` – Registration page
* `src/pages/PatientProfile.jsx` – Patient profile UI (stored in Supabase)
* `src/pages/MedicalData.jsx` – Lab results and conditions from FHIR with AI explanations
* `src/pages/UploadReport.jsx` – PDF upload and document management
* `src/hooks/useFhir.js` – FHIR data fetching hook
* `src/utils/fhirUtils.js` – FHIR data transformation
* `src/utils/openaiService.js` – Anthropic Claude AI integration
* `src/utils/supabaseClient.js` – Supabase client
* `src/utils/auth.js` – Authentication logic

## Notes & troubleshooting
* "Identifier has already been declared" errors
  * This usually means a duplicate `import` exists in a file. Open the file reported by the error and remove the duplicated import line.
* Vite HMR parse errors after editing JSX
  * Check for valid JSX syntax (balanced tags, valid expressions inside `{}`) and valid JavaScript in `sx` props (strings for CSS units like `'24px'` or numeric values when appropriate).
* Missing icon import resolves
  * If you see an error about resolving `@mui/icons-material/Menu` or `@mui/icons-material/ExpandMore`, run:
```bash
  npm install @mui/icons-material
```
* API errors
  * Make sure your `.env` file has all three keys set correctly (VITE_ANTHROPIC_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
* If you want Prettier to run in CI, add a `format` script to `package.json`, for example:
```json
"scripts": {
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md,html}\""
}
```
Then run `npm run format`.
