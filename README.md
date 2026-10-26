# Campus Companion — RNSIT prototype

A beginner-friendly demo web app using HTML, CSS, JavaScript, Leaflet/OpenStreetMap, FastAPI and SQLite.

## 1. Requirements
- Python 3.10 or newer
- Internet connection for map tiles and Leaflet CDN

## 2. Run it on Windows
Open Command Prompt or the VS Code terminal in this project folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open http://127.0.0.1:8000

If PowerShell blocks activation, use Command Prompt, or run:
```bash
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --reload
```

## 3. What the prototype does
- `/api/locations` returns locations from SQLite.
- `/api/route` uses Dijkstra's algorithm to find a short route through the sample path network.
- The browser displays markers and the returned route on an interactive map.
- The step-free checkbox only permits edges whose `step_free_verified` value is 1. All sample edges start at 0, so the filter intentionally returns no route until paths are actually verified.

## 4. Important before presenting as a real campus app
The coordinates, distances, path connections, walking times and building positions in `main.py` are illustrative demo data, not an official RNSIT map. Verify each pin, entrance, walking segment, ramp, lift and step-free claim with RNSIT staff and users with mobility needs. Update `SEED_LOCATIONS` and `SEED_EDGES`, then delete `campus.db` and restart the app to reseed the database.

## 5. Suggested next improvements
1. Add an admin screen for updating locations and paths.
2. Import surveyed paths from GeoJSON.
3. Add feedback and a last-verified date to each route segment.
4. Consider a routing provider or a campus-surveyed pedestrian graph for accurate turn-by-turn routing.
