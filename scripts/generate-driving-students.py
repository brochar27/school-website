#!/usr/bin/env python3
"""Generate a large fake driving students dataset."""

import csv
import json
import random
from datetime import date, timedelta
from pathlib import Path

COUNT = 5000
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data"

FIRST_NAMES = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "Lucas", "Mia", "Oliver", "Charlotte", "Elijah", "Amelia",
    "James", "Harper", "Benjamin", "Evelyn", "Henry", "Abigail", "Alexander",
    "Emily", "Sebastian", "Elizabeth", "Jack", "Sofia", "Aiden", "Avery",
    "Owen", "Ella", "Samuel", "Scarlett", "Matthew", "Grace", "Joseph",
    "Chloe", "Levi", "Victoria", "Mateo", "Riley", "David", "Aria", "John",
    "Lily", "Wyatt", "Aurora", "Carter", "Zoey", "Julian", "Hannah", "Luke",
    "Layla", "Grayson", "Camila", "Isaac", "Penelope", "Jayden", "Luna",
    "Gabriel", "Nora", "Anthony", "Mila", "Dylan", "Addison", "Leo", "Elena",
    "Carlos", "Maria", "Diego", "Sofia", "Juan", "Ana", "Miguel", "Lucia",
    "Andre", "Jasmine", "Marcus", "Destiny", "Tyler", "Brooklyn", "Jordan",
    "Taylor", "Casey", "Riley", "Morgan", "Alex", "Jamie", "Quinn", "Skyler",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
    "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
    "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
    "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos",
    "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez",
    "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
    "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long",
]

STREETS = [
    "Oak St", "Maple Ave", "Pine Rd", "Cedar Ln", "Elm Dr", "Birch Way",
    "Willow Ct", "Sunset Blvd", "Park Ave", "Lakeview Dr", "Highland Rd",
    "Meadow Ln", "River Rd", "Valley View", "Mountain Pass", "School St",
    "Main St", "Washington Ave", "Lincoln Way", "Jefferson Dr", "Adams St",
]

CITIES = [
    ("Springfield", "IL"), ("Riverside", "CA"), ("Fairview", "TX"),
    ("Greenville", "NC"), ("Madison", "WI"), ("Franklin", "TN"),
    ("Clinton", "NY"), ("Salem", "OR"), ("Georgetown", "KY"),
    ("Arlington", "VA"), ("Bristol", "CT"), ("Oxford", "MS"),
    ("Lakewood", "CO"), ("Redwood", "CA"), ("Clearwater", "FL"),
    ("Brookfield", "WI"), ("Westfield", "NJ"), ("Northgate", "WA"),
]

INSTRUCTORS = [
    "Mr. Patterson", "Ms. Nguyen", "Coach Rivera", "Mrs. Thompson",
    "Mr. Brooks", "Ms. Chen", "Mr. Okafor", "Mrs. Sullivan",
    "Mr. Martinez", "Ms. Foster", "Coach Williams", "Mr. Kim",
    "Mrs. Anderson", "Mr. Delgado", "Ms. Wright", "Mr. Harrison",
]

LICENSE_TYPES = ["Learner Permit", "Provisional", "Full License Pending", "Restricted"]
STATUSES = ["Active", "Active", "Active", "Completed", "Pending Test", "On Hold", "Waitlisted"]
VEHICLE_TYPES = ["Sedan", "SUV", "Compact", "Hybrid", "Manual Sedan"]
SCHEDULES = ["Morning", "Afternoon", "Evening", "Weekend AM", "Weekend PM"]
PAYMENT_STATUSES = ["Paid", "Paid", "Paid", "Partial", "Scholarship", "Pending"]


def random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def make_student(student_id: int) -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    age = random.randint(15, 19)
    grade = {15: 10, 16: 11, 17: 12, 18: 12, 19: 12}[age]
    city, state = random.choice(CITIES)
    enrollment = random_date(date(2023, 8, 1), date(2026, 6, 1))
    lessons = random.randint(0, 30)
    hours = round(lessons * random.uniform(0.8, 1.2) + random.uniform(0, 5), 1)
    status = random.choice(STATUSES)
    test_date = None
    if status in ("Pending Test", "Completed"):
        test_date = random_date(enrollment + timedelta(days=30), date(2026, 12, 31))
    passed = status == "Completed" and random.random() > 0.08

    return {
        "student_id": f"DRV-{student_id:05d}",
        "first_name": first,
        "last_name": last,
        "email": f"{first.lower()}.{last.lower()}{random.randint(1, 99)}@student.school.edu",
        "phone": f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}",
        "age": age,
        "grade": grade,
        "address": f"{random.randint(100, 9999)} {random.choice(STREETS)}",
        "city": city,
        "state": state,
        "zip": f"{random.randint(10000, 99999)}",
        "parent_guardian": f"{random.choice(FIRST_NAMES)} {last}",
        "emergency_contact": f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}",
        "license_type": random.choice(LICENSE_TYPES),
        "permit_number": f"PM-{random.randint(100000, 999999)}",
        "enrollment_date": enrollment.isoformat(),
        "instructor": random.choice(INSTRUCTORS),
        "lessons_completed": lessons,
        "hours_driven": hours,
        "vehicle_type": random.choice(VEHICLE_TYPES),
        "preferred_schedule": random.choice(SCHEDULES),
        "status": status,
        "road_test_date": test_date.isoformat() if test_date else None,
        "road_test_passed": passed if status == "Completed" else None,
        "payment_status": random.choice(PAYMENT_STATUSES),
        "notes": random.choice([
            "Needs extra parallel parking practice",
            "Excellent highway awareness",
            "Parent requested evening slots only",
            "Transferred from another district",
            "Requires glasses while driving",
            "Completed classroom portion early",
            "Scheduled for DMV appointment",
            "Missed two lessons — rescheduling",
            "Ready for final evaluation",
            "",
            "",
            "",
        ]),
    }


def main() -> None:
    random.seed(42)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    students = [make_student(i + 1) for i in range(COUNT)]

    json_path = OUTPUT_DIR / "driving-students.json"
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(
            {
                "dataset": "driving_students",
                "description": "Fake driving program student records for school website demo",
                "generated_on": date.today().isoformat(),
                "total_records": COUNT,
                "students": students,
            },
            f,
            indent=2,
        )

    csv_path = OUTPUT_DIR / "driving-students.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=students[0].keys())
        writer.writeheader()
        writer.writerows(students)

    print(f"Generated {COUNT} students")
    print(f"  JSON: {json_path} ({json_path.stat().st_size / 1024 / 1024:.1f} MB)")
    print(f"  CSV:  {csv_path} ({csv_path.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
