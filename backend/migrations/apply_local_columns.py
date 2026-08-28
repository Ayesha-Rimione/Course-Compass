import sqlite3

con = sqlite3.connect("coursecompass.db")
cur = con.cursor()

def try_exec(sql, name):
    try:
        cur.execute(sql)
        con.commit()
        print(f"Success: {name}")
    except Exception as e:
        print(f"Info: {name} ({e})")

try_exec("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'STUDENT'", "users.role")
try_exec("ALTER TABLE student_profiles ADD COLUMN phone VARCHAR(50)", "student_profiles.phone")
try_exec("ALTER TABLE student_profiles ADD COLUMN target_role VARCHAR(255) DEFAULT 'Full-Stack Software Engineer'", "student_profiles.target_role")

con.close()
print("Local sqlite migration checked.")
