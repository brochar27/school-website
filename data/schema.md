# Driving Students Dataset

Fake dataset for the school driving program. **Not real student data.**

## Files

| File | Format | Records |
|------|--------|---------|
| `driving-students.json` | JSON (nested) | 5,000 |
| `driving-students.csv` | CSV (flat) | 5,000 |

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `student_id` | string | Unique ID, e.g. `DRV-00042` |
| `first_name` | string | Student first name |
| `last_name` | string | Student last name |
| `email` | string | School email |
| `phone` | string | Student phone |
| `age` | int | 15–19 |
| `grade` | int | 10–12 |
| `address` | string | Street address |
| `city` | string | City |
| `state` | string | US state code |
| `zip` | string | ZIP code |
| `parent_guardian` | string | Parent/guardian name |
| `emergency_contact` | string | Emergency phone |
| `license_type` | string | Permit / provisional / etc. |
| `permit_number` | string | Fake permit ID |
| `enrollment_date` | date | When they joined the program |
| `instructor` | string | Assigned driving instructor |
| `lessons_completed` | int | Number of lessons done |
| `hours_driven` | float | Total behind-the-wheel hours |
| `vehicle_type` | string | Training vehicle type |
| `preferred_schedule` | string | Morning / afternoon / weekend |
| `status` | string | Active, Completed, Pending Test, etc. |
| `road_test_date` | date \| null | Scheduled test date |
| `road_test_passed` | bool \| null | Pass/fail if completed |
| `payment_status` | string | Paid, Partial, Scholarship, etc. |
| `notes` | string | Instructor/admin notes |

## Regenerate

```bash
python3 scripts/generate-driving-students.py
```
