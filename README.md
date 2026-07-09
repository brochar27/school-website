# DriveForward Academy — School Website

Modern driving program website with a live-searchable registry of 5,000 fake student records.

## Run locally

The site loads `data/driving-students.json` via fetch, so open it through a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Structure

- `index.html` — landing page + student registry UI
- `styles.css` — modern dark driving theme
- `app.js` — loads dataset, search/filter/sort, pagination, detail modal
- `data/driving-students.json` — 5,000 fake driving student records (JSON)
- `data/driving-students.csv` — same dataset in CSV
- `data/schema.md` — field definitions
- `scripts/generate-driving-students.py` — regenerate the dataset
