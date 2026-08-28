import csv
import json
import os
import re

csv_file = "IUBAT'S Curriculamn - IUBAT CSE Curriculum (B231).csv"

def clean_str(s):
    if not s:
        return ""
    # Replace unicode replacement character with a space or appropriate punctuation
    s = s.replace("\ufffd", " ")
    # Clean multiple spaces or weird artifact characters
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()

def parse_semester(val, code):
    s = str(val).strip()
    if s.isdigit():
        return int(s)
    if "Final" in s:
        return 10
    if "Elective" in s:
        return 9
    if code == "ART 204":
        return 2
    return 8

courses = []
with open(csv_file, mode="r", encoding="utf-8-sig", errors="replace") as f:
    reader = csv.DictReader(f)
    for row in reader:
        code = row.get("Course Code")
        name = row.get("Course Name")
        if not code or not name or not str(code).strip():
            continue
        credits_raw = row.get("Credit Hours")
        try:
            credits = float(credits_raw) if credits_raw else 3.0
        except:
            credits = 3.0
        code_str = str(code).strip().upper()
        semester = parse_semester(row.get("Semester"), code_str)

        courses.append({
            "code": code_str,
            "title": clean_str(name),
            "credits": credits,
            "semester": semester,
            "description": clean_str(row.get("Description")),
            "topics": clean_str(row.get("Topics / Skills")),
            "assignments": clean_str(row.get("Projects / Assignments")),
            "co1": clean_str(row.get("CO1")),
            "co2": clean_str(row.get("CO2")),
            "co3": clean_str(row.get("CO3")),
            "co4": clean_str(row.get("CO4")),
            "co5": clean_str(row.get("CO5")),
        })

print(f"Total courses parsed from CSV: {len(courses)}")

os.makedirs("supabase", exist_ok=True)
with open("supabase/courses_dataset.json", "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=2)

with open("src/data/curriculum-dataset.ts", "w", encoding="utf-8") as f:
    f.write("/**\n * Real IUBAT CSE Curriculum Dataset (B231 Curriculum Dataset)\n */\n")
    f.write("export interface CurriculumCourseData {\n")
    f.write("  code: string;\n")
    f.write("  title: string;\n")
    f.write("  credits: number;\n")
    f.write("  semester: number;\n")
    f.write("  description: string;\n")
    f.write("  topics?: string;\n")
    f.write("  assignments?: string;\n")
    f.write("  co1?: string;\n")
    f.write("  co2?: string;\n")
    f.write("  co3?: string;\n")
    f.write("  co4?: string;\n")
    f.write("  co5?: string;\n")
    f.write("}\n\n")
    f.write("export const masterCurriculumCourses: CurriculumCourseData[] = ")
    json.dump(courses, f, indent=2)
    f.write(";\n")

with open("supabase/seed.sql", "w", encoding="utf-8") as f:
    f.write("-- Master Curriculum Seed (IUBAT CSE B231 Dataset)\n")
    f.write("INSERT INTO public.courses (course_code, course_name, credit_hours, semester, description, topics, assignments, co1, co2, co3, co4, co5)\nVALUES\n")
    lines = []
    for c in courses:
        def escape_sql(val):
            return "'" + str(val).replace("'", "''") + "'"
        line = f"({escape_sql(c['code'])}, {escape_sql(c['title'])}, {c['credits']}, {c['semester']}, {escape_sql(c['description'])}, {escape_sql(c['topics'])}, {escape_sql(c['assignments'])}, {escape_sql(c['co1'])}, {escape_sql(c['co2'])}, {escape_sql(c['co3'])}, {escape_sql(c['co4'])}, {escape_sql(c['co5'])})"
        lines.append(line)
    f.write(",\n".join(lines))
    f.write("\nON CONFLICT (course_code) DO UPDATE SET\n")
    f.write("  course_name = EXCLUDED.course_name,\n")
    f.write("  credit_hours = EXCLUDED.credit_hours,\n")
    f.write("  semester = EXCLUDED.semester,\n")
    f.write("  description = EXCLUDED.description,\n")
    f.write("  topics = EXCLUDED.topics,\n")
    f.write("  assignments = EXCLUDED.assignments,\n")
    f.write("  co1 = EXCLUDED.co1, co2 = EXCLUDED.co2, co3 = EXCLUDED.co3, co4 = EXCLUDED.co4, co5 = EXCLUDED.co5;\n")

print("Files successfully updated with clean course names and descriptions!")
