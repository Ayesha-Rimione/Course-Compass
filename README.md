# CourseCompass

Skills alignment tool for IUBAT students. Map coursework to real workforce skills, analyze target role skill gaps, and execute weekly learning steps.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
npm install
npm run dev
```

## Built with

- TanStack Start & React Router
- TypeScript & React
- Tailwind CSS
- Vanta.js (3D WebGL / Canvas backgrounds)


Whenever you develop locally, you run two terminal windows side-by-side:

Terminal 1 — Backend (FastAPI):

cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

Terminal 2 — Frontend (Vite):

npm run dev