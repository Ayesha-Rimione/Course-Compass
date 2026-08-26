# CourseCompass

Skills alignment tool for IUBAT students. Map coursework to real workforce skills, analyze target role skill gaps, and execute weekly learning steps.

## Tech Stack

- **Frontend**: TanStack Start & React Router, TypeScript, React 19, Tailwind CSS v4, Vanta.js
- **Backend**: FastAPI (Python), SQLAlchemy, Alembic, PostgreSQL / SQLite

---

## How to Run Locally (Side-by-Side)

To run CourseCompass locally, open **two separate terminal windows** (one for the Backend and one for the Frontend).

---

### Terminal 1: Backend (FastAPI)

1. **Navigate into the backend folder:**
   ```powershell
   cd "d:\Course Compass\backend"
   ```

2. **(First time only) Create Python Virtual Environment:**
   ```powershell
   py -m venv venv
   # or: python -m venv venv
   ```

3. **Install dependencies:**
   Using the virtual environment Python directly (prevents `pip is not recognized` errors):
   ```powershell
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

4. **Start the FastAPI Server:**
   ```powershell
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```

   - **API Server:** [http://localhost:8000](http://localhost:8000)
   - **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Terminal 2: Frontend (Vite / React)

1. **Navigate to the project root directory:**
   ```powershell
   cd "d:\Course Compass"
   ```

2. **(First time only) Install Node dependencies:**
   ```powershell
   npm install
   ```

3. **Start the Frontend Development Server:**
   ```powershell
   npm run dev
   ```

   - **Frontend Web App:** [http://localhost:8080](http://localhost:8080)

---

### Troubleshooting Common Windows Issues

- **`'pip'` or `'uvicorn'` is not recognized:**
  Windows does not have `pip` in your global PATH by default. Always prefix commands with `.\venv\Scripts\python.exe -m` from the `backend/` folder:
  ```powershell
  .\venv\Scripts\python.exe -m pip install -r requirements.txt
  .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
  ```

- **PowerShell Script Execution Policy Error (`Activate.ps1 cannot be loaded`):**
  You do not need to run `Activate.ps1`. You can call the `.\venv\Scripts\python.exe` binary directly as shown above.