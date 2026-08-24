import os
import sys
import openpyxl
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Course, CourseTopic, CourseOutcome


def seed_curriculum(excel_path: str):
    if not os.path.exists(excel_path):
        print(f"Error: Dataset file not found at {excel_path}")
        sys.exit(1)

    print(f"Loading Excel file: {excel_path}")
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb.active

    # Read header row
    headers = [cell.value for cell in next(sheet.iter_rows(min_row=1, max_row=1))]
    headers_clean = [str(h).strip() if h is not None else "" for h in headers]

    print(f"Header columns found: {headers_clean}")

    col_map = {h: idx for idx, h in enumerate(headers_clean)}

    required_cols = ["Course Code", "Course Name"]
    for req in required_cols:
        if req not in col_map:
            print(f"Error: Missing required column '{req}' in Excel file.")
            sys.exit(1)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    courses_inserted = 0
    topics_inserted = 0
    outcomes_inserted = 0
    skipped_rows = 0
    errors_count = 0

    try:
        # Iterate data rows starting from row 2
        for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            if not row or all(v is None for v in row):
                skipped_rows += 1
                continue

            raw_code = row[col_map["Course Code"]] if "Course Code" in col_map else None
            raw_name = row[col_map["Course Name"]] if "Course Name" in col_map else None

            if not raw_code or not raw_name or str(raw_code).strip() == "":
                skipped_rows += 1
                continue

            try:
                # 1. Normalize course code
                course_code = str(raw_code).strip().upper()
                course_name = str(raw_name).strip()

                # 2. Extract Credit Hours & Semester
                credit_hours = 3.0
                if "Credit Hours" in col_map and row[col_map["Credit Hours"]] is not None:
                    try:
                        credit_hours = float(row[col_map["Credit Hours"]])
                    except (ValueError, TypeError):
                        pass

                semester = 1
                if "Semester" in col_map and row[col_map["Semester"]] is not None:
                    try:
                        semester = int(row[col_map["Semester"]])
                    except (ValueError, TypeError):
                        pass

                description = ""
                if "Description" in col_map and row[col_map["Description"]] is not None:
                    description = str(row[col_map["Description"]]).strip()

                # 3. Check or insert Course
                course = db.query(Course).filter(Course.course_code == course_code).first()
                if not course:
                    course = Course(
                        course_code=course_code,
                        course_name=course_name,
                        credit_hours=credit_hours,
                        semester=semester,
                        description=description,
                        department="Department of Computer Science & Engineering",
                        program="B.Sc. in Computer Science & Engineering"
                    )
                    db.add(course)
                    db.flush()
                    courses_inserted += 1
                else:
                    # Update existing record
                    course.course_name = course_name
                    course.credit_hours = credit_hours
                    course.semester = semester
                    if description:
                        course.description = description
                    db.flush()

                # 4. Extract & insert Topics
                raw_topics = row[col_map["Topics / Skills"]] if "Topics / Skills" in col_map else None
                if raw_topics and str(raw_topics).strip():
                    topic_lines = str(raw_topics).split("\n")
                    for line in topic_lines:
                        clean_topic = line.strip().lstrip("•").lstrip("-").lstrip("*").strip()
                        if clean_topic:
                            existing_topic = (
                                db.query(CourseTopic)
                                .filter(CourseTopic.course_id == course.id, CourseTopic.topic_name == clean_topic)
                                .first()
                            )
                            if not existing_topic:
                                topic_obj = CourseTopic(course_id=course.id, topic_name=clean_topic)
                                db.add(topic_obj)
                                topics_inserted += 1

                # 5. Extract & insert Course Outcomes (CO1..CO5)
                for co_code in ["CO1", "CO2", "CO3", "CO4", "CO5"]:
                    if co_code in col_map and row[col_map[co_code]] is not None:
                        co_desc = str(row[col_map[co_code]]).strip()
                        if co_desc:
                            existing_co = (
                                db.query(CourseOutcome)
                                .filter(CourseOutcome.course_id == course.id, CourseOutcome.outcome_code == co_code)
                                .first()
                            )
                            if not existing_co:
                                co_obj = CourseOutcome(course_id=course.id, outcome_code=co_code, description=co_desc)
                                db.add(co_obj)
                                outcomes_inserted += 1

            except Exception as e:
                print(f"Row {row_idx} Error: {str(e)}")
                errors_count += 1

        db.commit()
    except Exception as outer_e:
        db.rollback()
        print(f"Dataset Seeding Failed: {str(outer_e)}")
        sys.exit(1)
    finally:
        db.close()

    print("\n================ SEED SUMMARY ================")
    print(f"Courses inserted / updated : {courses_inserted}")
    print(f"Topics inserted            : {topics_inserted}")
    print(f"Course outcomes inserted   : {outcomes_inserted}")
    print(f"Skipped empty rows         : {skipped_rows}")
    print(f"Errors encountered         : {errors_count}")
    print("==============================================\n")


if __name__ == "__main__":
    dataset_file = os.path.join(os.path.dirname(__file__), "curriculum_dataset.xlsx")
    seed_curriculum(dataset_file)
