# CourseCompass Backend Service

CourseCompass is an academic and career guidance platform designed specifically for **IUBAT Computer Science & Engineering (CSE) students**.

This repository contains the core FastAPI REST API backend service, SQLAlchemy database models, Alembic database migrations, dataset seeding pipeline, OTP authentication, and student progress tracking system.

---

## 1. Requirements

- **Python**: Version 3.11 or higher
- **Database**: PostgreSQL (Neon PostgreSQL recommended) or SQLite for local offline testing
- **Tools**: `pip`, `venv`

---

## 2. Installation

1. Open your terminal in the `backend/` folder.
2. Create and activate a Python virtual environment:

```bash
# On Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

3. Install required packages:

```bash
pip install -r requirements.txt
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Open `.env` and set your Neon PostgreSQL connection string:

```ini
# PostgreSQL Connection (Neon)
DATABASE_URL=postgresql+psycopg2://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your_custom_secure_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OTP Configuration
OTP_EXPIRE_MINUTES=10
ALLOWED_EMAIL_DOMAINS=iubat.edu,gmail.com
```

> **Note**: Never commit `.env` to Git. It is automatically ignored in `.gitignore`.

---

## 4. Database Setup & Migration

To run database migrations with Alembic:

```bash
# Generate initial migration (if modifying models)
alembic revision --autogenerate -m "Initial schema migration"

# Apply migrations to database
alembic upgrade head
```

---

## 5. Dataset Seeding

Populate the IUBAT CSE curriculum database from the Excel dataset:

```bash
python -m seed.seed_curriculum
```

**Expected Seed Output:**
```text
================ SEED SUMMARY ================
Courses inserted / updated : 30
Topics inserted            : 120
Course outcomes inserted   : 140
Skipped empty rows         : 0
Errors encountered         : 0
==============================================
```

---

## 6. Running the Server

Start the development FastAPI server with Uvicorn:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The backend server will run at: `http://localhost:8000`

---

## 7. Interactive API Documentation

Once the server is running, explore and test endpoints in your browser:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 8. Running Automated Tests

Run the complete backend unit test suite using Pytest:

```bash
pytest
```

---

## 9. Core API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check (`{"status": "ok"}`) |
| `POST` | `/auth/request-otp` | Request 6-digit OTP code (`student@iubat.edu`) |
| `POST` | `/auth/verify-otp` | Verify OTP code and obtain JWT access token |
| `GET` | `/students/me` | Retrieve authenticated student academic profile |
| `PUT` | `/students/me` | Update student profile (CGPA, semester, batch, name) |
| `GET` | `/curriculum/me` | Retrieve student's academic curriculum & progress overlay |
| `GET` | `/courses` | List all available curriculum courses (supports filtering) |
| `GET` | `/courses/{course_code}` | Detailed course view with topics & course outcomes |
| `GET` | `/students/me/courses` | List student tracked course progress records |
| `POST` | `/students/me/courses` | Add new course progress record |
| `PUT` | `/students/me/courses/{course_code}` | Update course status (`COMPLETED`, `IN_PROGRESS`), grade, or rating |
