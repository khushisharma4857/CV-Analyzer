# Smartiff CV Analyser

An AI-powered CV analysis tool that extracts skills, analyses experience, scores profiles, and suggests career opportunities.

## Architecture

- **Frontend**: React + Vite (TypeScript) on port 5000
- **Backend**: Express.js (TypeScript) on port 3001
- **AI**: OpenAI GPT-4o-mini for CV analysis

## Setup

### Environment Variables

Add `OPENAI_API_KEY` to your Replit Secrets for AI analysis to work.

### Running the App

The app uses a single workflow (`Start application`) that runs both the frontend and backend using `concurrently`.

```
npm run dev
```

- Frontend: http://localhost:5000
- Backend API: http://localhost:3001

## Features

- Upload CV as PDF, DOC, DOCX, or TXT
- Or paste CV text directly
- AI-powered analysis:
  - Overall score (0–100)
  - Skills extraction (technical, soft, languages)
  - Experience summary
  - Education
  - Strengths and improvement areas
  - Recommended roles with match %
  - Actionable recommendations

## User Preferences

- Keep the UI clean and professional
