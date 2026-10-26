from pathlib import Path
import sqlite3
from heapq import heappush, heappop
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

ROOT = Path(__file__).parent
DB_PATH = ROOT / "campus.db"
app = FastAPI(title="Campus Companion API", version="1.0")

# Demo data only. Replace coordinates and paths with campus-surveyed information.
SEED_LOCATIONS = [
    ("gate", "Main Gate", "Entrance", 12.902585060768827, 77.51919084093743, "Main campus entrance; verify exact pin."),
    ("help", "Admin / Help Desk", "Administration", 12.90236896487, 77.51864616910976, "Demo location; verify entrance."),
    ("blocks", "Academic Blocks", "Academic", 12.901838059225517, 77.51789019277182, "Demo location; verify building and entrance."),
    ("library", "Library", "Study", 12.900868966678384, 77.51780497850234, "Demo location; verify building entrance."),
    ("canteen", "Canteen", "Food", 12.900786646179558, 77.5181435310747, "Demo location; verify opening and access details."),
    ("auditorium", "Auditorium", "Events", 12.9004620129505, 77.51822718864943, "Demo location; verify entrance."),
    ("sports", "Sports / Hostel", "Sports & Hostel", 12.901963254291315, 77.51712554088559, "Illustrative placeholder; verify facility."),
]
# Distances are illustrative, in metres. step_free_verified is FALSE until verified by RNSIT.
SEED_EDGES = [
    ("gate", "help", 55, 4, 0, 0),
    ("help", "blocks", 75, 5, 0, 0),
    ("blocks", "library", 60, 4, 0, 0),
    ("library", "canteen", 65, 4, 0, 0),
    ("blocks", "auditorium", 90, 6, 0, 0),
    ("help", "sports", 100, 7, 0, 0),
    ("sports", "canteen", 85, 6, 0, 0),
    ("auditorium", "canteen", 80, 6, 0, 0),
]

def connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect() as con:
        con.execute("""CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
            lat REAL NOT NULL, lon REAL NOT NULL, notes TEXT NOT NULL)""")
        con.execute("""CREATE TABLE IF NOT EXISTS paths (
            id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT NOT NULL,
            target_id TEXT NOT NULL, distance_m INTEGER NOT NULL,
            walking_minutes INTEGER NOT NULL, step_free_verified INTEGER NOT NULL DEFAULT 0,
            stairs INTEGER NOT NULL DEFAULT 0, notes TEXT DEFAULT '')""")
        if con.execute("SELECT COUNT(*) FROM locations").fetchone()[0] == 0:
            con.executemany("INSERT INTO locations VALUES (?, ?, ?, ?, ?, ?)", SEED_LOCATIONS)
            con.executemany(
                "INSERT INTO paths (source_id,target_id,distance_m,walking_minutes,step_free_verified,stairs) VALUES (?,?,?,?,?,?)",
                SEED_EDGES
            )

init_db()

class RouteRequest(BaseModel):
    start_id: str
    destination_id: str
    step_free_only: bool = False

@app.get("/api/locations")
def locations():
    with connect() as con:
        rows = con.execute("SELECT * FROM locations ORDER BY name").fetchall()
        return [dict(r) for r in rows]

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Campus Companion API is running"}

@app.post("/api/route")
def route(req: RouteRequest):
    with connect() as con:
        loc_rows = con.execute("SELECT * FROM locations").fetchall()
        locs = {r["id"]: dict(r) for r in loc_rows}
        if req.start_id not in locs or req.destination_id not in locs:
            raise HTTPException(404, "Choose valid start and destination locations.")
        if req.start_id == req.destination_id:
            return {"locations": [locs[req.start_id]], "distance_m": 0, "walking_minutes": 0,
                    "message": "You are already at your destination.", "accessibility_verified": False}

        rows = con.execute("SELECT * FROM paths").fetchall()
        graph = {key: [] for key in locs}
        for edge in rows:
            e = dict(edge)
            if req.step_free_only and not e["step_free_verified"]:
                continue
            graph[e["source_id"]].append((e["target_id"], e))
            graph[e["target_id"]].append((e["source_id"], e))

        # Dijkstra: choose the path with the smallest total walking distance.
        queue = [(0, req.start_id)]
        distances = {req.start_id: 0}
        previous = {}
        while queue:
            cost, node = heappop(queue)
            if cost != distances.get(node):
                continue
            if node == req.destination_id:
                break
            for nxt, edge in graph[node]:
                new_cost = cost + edge["distance_m"]
                if new_cost < distances.get(nxt, float("inf")):
                    distances[nxt] = new_cost
                    previous[nxt] = (node, edge)
                    heappush(queue, (new_cost, nxt))

        if req.destination_id not in previous:
            raise HTTPException(404, "No route found with the selected filter. Try disabling the step-free filter or ask campus staff for a verified route.")

        ids = [req.destination_id]
        edges_used = []
        cur = req.destination_id
        while cur != req.start_id:
            prev, edge = previous[cur]
            edges_used.append(edge)
            ids.append(prev)
            cur = prev
        ids.reverse()
        edges_used.reverse()
        total_distance = sum(e["distance_m"] for e in edges_used)
        total_minutes = sum(e["walking_minutes"] for e in edges_used)
        verified = all(e["step_free_verified"] == 1 for e in edges_used)
        return {
            "locations": [locs[i] for i in ids],
            "distance_m": total_distance,
            "walking_minutes": total_minutes,
            "accessibility_verified": verified,
            "message": "Demo route only. Internal paths, distances and accessibility must be verified on campus."
        }

app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")

@app.get("/")
def home():
    return FileResponse(ROOT / "static" / "index.html")
