🧭 Campus Companion — RNSIT

Campus Companion is a web-based campus navigation project designed to help students, visitors, and people with mobility needs find locations and navigate around the RNSIT campus.

The project combines frontend development, backend APIs, database management, digital maps, and route-finding algorithms.

🎯 Problem Statement

Finding buildings and navigating an unfamiliar campus can be difficult, especially for new students and visitors. People with mobility needs may also require routes that have been checked for accessibility.

Campus Companion aims to make campus navigation easier by providing a map, location information, and route suggestions.

✨ Features

- Interactive Map: Displays campus locations using Leaflet and OpenStreetMap.
- Location Information: Retrieves campus locations from a database.
- Route Finding: Uses Dijkstra's algorithm to calculate a route through the configured path network.
- Accessibility Filtering: Supports filtering routes based on recorded step-free accessibility information.
- Backend API: Uses FastAPI to serve location data and route requests.
- Database Integration: Uses SQLite to store campus locations and related data.

«Note: This is a prototype. Sample coordinates and paths are illustrative, and accessibility information must be verified on campus before routes can be relied on.»

🛠️ Technologies Used

- Frontend: HTML, CSS, JavaScript
- Map: Leaflet and OpenStreetMap
- Backend: Python and FastAPI
- Database: SQLite
- Algorithm: Dijkstra's shortest-path algorithm
- Deployment: GitHub and Render

⚙️ How It Works

1. The user opens the Campus Companion website.
2. JavaScript requests campus locations from the backend.
3. FastAPI retrieves the location data from SQLite.
4. Leaflet displays the locations on the map.
5. The user selects a starting point and destination.
6. The backend calculates a route using Dijkstra's algorithm.
7. The resulting route is displayed on the map.

📁 Project Structure

The project contains the following main files:

- "main.py" — Backend application and API endpoints.
- "requirements.txt" — Required Python packages.
- "README.md" — Project documentation.
- "campus.db" — SQLite database, if included in the repository.
- "static/index.html" — Webpage structure.
- "static/style.css" — Website styling.
- "static/app.js" — Frontend logic and map interactions.

🔄 Application Workflow

User → Frontend → FastAPI → SQLite Database

The frontend displays the map and handles user interactions. The backend provides location information and calculates routes through the configured campus path network.

🧮 Route-Finding Algorithm

Campus Companion uses Dijkstra's algorithm to find a shortest path through a graph.

- Locations act as nodes.
- Connections between locations act as edges.
- Edge distances represent the cost of travelling between connected locations.
- The algorithm finds a minimum-distance path between the selected start and destination when a valid path exists.

For accessibility filtering, the application uses the recorded step-free status of path connections. Routes should not be considered accessibility-verified until the relevant paths have been checked in person.

🚀 Getting Started

Prerequisites

Install Python 3.10 or a compatible version supported by your dependencies.

1. Clone the Repository

git clone YOUR_GITHUB_REPOSITORY_URL

Replace "YOUR_GITHUB_REPOSITORY_URL" with your repository's actual URL.

2. Open the Project Folder

cd YOUR_PROJECT_FOLDER

Run this command from the directory containing "main.py".

3. Create a Virtual Environment

python -m venv .venv

Activate it on Windows:

.venv\Scripts\activate

4. Install Dependencies

pip install -r requirements.txt

5. Start the Server

uvicorn main:app --reload

6. Open the Website

Open this address in your browser:

"http://127.0.0.1:8000/"

The API documentation, if enabled by the FastAPI application, is available at:

"http://127.0.0.1:8000/docs"

🔌 API Endpoints

The following endpoints are described by the project design. Confirm their exact paths and request formats in "main.py".

Endpoint| Purpose
"/api/locations"| Retrieves campus locations.
"/api/route"| Requests a route between selected locations.

♿ Accessibility

Accessibility is an important goal of Campus Companion.

The prototype includes a step-free route filtering concept. However, a route is only as reliable as the underlying data. Ramps, stairs, surface conditions, entrances, and other accessibility details need to be checked and recorded before the system can recommend routes as accessible.

🔮 Future Improvements

- Verify campus locations and walking paths using actual campus data.
- Add an interface for administrators to update locations.
- Add building descriptions and useful campus information.
- Record accessibility verification dates and feedback.
- Import surveyed campus paths using GeoJSON.
- Improve route selection and estimated walking times.
- Improve the mobile experience.
- Add more detailed accessibility information.

📚 Learning Outcomes

This project provides practical experience with:

- Frontend development using HTML, CSS, and JavaScript.
- Backend development using Python and FastAPI.
- Database integration using SQLite.
- Interactive maps using Leaflet and OpenStreetMap.
- Graph algorithms and shortest-path calculations.
- REST API development and deployment.

🤝 Contributing

Suggestions and improvements are welcome. Before adding campus locations or accessibility information, verify the data to avoid providing misleading directions.

⚠️ Disclaimer

Campus Companion is an educational prototype and is not an official RNSIT navigation system. Sample locations, paths, distances, and accessibility details may not reflect actual campus conditions. Always verify routes and accessibility information in person.

👨‍💻 Project Status

The project is under development. Features and campus data may change as the prototype improves.