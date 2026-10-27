🧭 Campus Companion — RNSIT Prototype

A campus navigation and accessibility assistance web application for students, visitors, and new campus members.

Campus Companion is a beginner-friendly full-stack web development project designed to help users discover campus locations and navigate between them through an interactive map. The prototype explores how web technologies, mapping services, backend APIs, and database management can be combined to solve a real-world campus navigation problem.

«Project status: Prototype / Work in Progress
Institution: RNS Institute of Technology (RNSIT)
Purpose: Learning, experimentation, and campus navigation research»

---

📌 Table of Contents

- "Overview" (#-overview)
- "Problem Statement" (#-problem-statement)
- "Project Objectives" (#-project-objectives)
- "Features" (#-features)
- "Technology Stack" (#-technology-stack)
- "How It Works" (#-how-it-works)
- "Project Structure" (#-project-structure)
- "Requirements" (#-requirements)
- "Installation and Setup" (#-installation-and-setup)
- "API Endpoints" (#-api-endpoints)
- "Routing Algorithm" (#-routing-algorithm)
- "Accessibility Considerations" (#-accessibility-considerations)
- "Current Limitations" (#-current-limitations)
- "Future Improvements" (#-future-improvements)
- "Contributing" (#-contributing)
- "Learning Outcomes" (#-learning-outcomes)
- "License" (#-license)

---

🌐 Overview

Finding a particular building, office, laboratory, or facility can be difficult for new students and visitors on a college campus.

Campus Companion aims to make campus navigation easier by providing a map-based interface where users can explore available locations and find routes between connected points.

The application follows a full-stack architecture:

- Frontend: Displays the map, location markers, search interface, and route information.
- Backend: Provides APIs for retrieving campus locations and calculating routes.
- Database: Stores campus location and path-network information.
- Mapping layer: Uses Leaflet and OpenStreetMap map tiles to display geographic information.

The current version is a prototype intended to demonstrate the core concept. It should not be treated as an official or fully verified RNSIT navigation system.

---

🎯 Problem Statement

Students and visitors may not always know where campus buildings, offices, laboratories, and other facilities are located. Finding the correct destination can take extra time, especially for people visiting the campus for the first time.

Accessibility introduces an additional challenge: the shortest walking route may include stairs or other obstacles that make it unsuitable for some users.

Campus Companion explores a digital solution that combines campus location discovery, route calculation, and accessibility-related information in a single web application.

💡 Project Objectives

1. Make campus locations easier to discover.
2. Display location information through an interactive map.
3. Calculate routes between connected campus locations.
4. Explore step-free route filtering using verified path attributes.
5. Provide a foundation for future indoor navigation and accessibility features.
6. Practise full-stack web development using Python, JavaScript, APIs, and a relational database.

---

✨ Features

🗺️ Interactive Campus Map

- Displays available campus locations as map markers.
- Allows users to explore locations visually.
- Uses Leaflet for map interaction and OpenStreetMap-based tiles for geographic display.

📍 Campus Location API

- Retrieves location records from an SQLite database.
- Provides structured location data to the frontend.
- Separates campus data from the user interface.

🚶 Route Finding

- Accepts a starting location and a destination.
- Uses a graph-based routing algorithm to find a path through the configured path network.
- Displays the returned route on the map.

♿ Step-Free Route Filtering — Experimental

- Includes a filter for routes whose path segments are marked as verified step-free.
- Uses a "step_free_verified" attribute on path edges.
- Does not assume that an unverified route is accessible.

Important: In the supplied sample data, all path edges have "step_free_verified = 0". Consequently, the step-free filter intentionally returns no route until the relevant paths have been surveyed and verified.

🧩 Extensible Architecture

The project is structured so that future versions can introduce additional capabilities, such as building information, an administrative interface, route feedback, and improved navigation.

---

🛠️ Technology Stack

Technology| Purpose
HTML5| Page structure and content
CSS3| Styling and responsive layouts
JavaScript| User interactions and frontend logic
Leaflet| Interactive map rendering
OpenStreetMap| Map data and tile source
Python| Backend application logic
FastAPI| HTTP API and web application framework
SQLite| Persistent relational data storage
Dijkstra's algorithm| Shortest-path calculation on the configured graph
Uvicorn| ASGI server for running the application

Why this stack?

The stack is lightweight and approachable for a student project. It allows the frontend, backend, database, and routing logic to be developed and tested independently without requiring a complex infrastructure setup.

---

⚙️ How It Works

The application follows a simple request-and-response workflow.

1. A user opens the website in a browser.
2. The frontend requests available campus locations from the backend.
3. FastAPI reads the relevant location records from SQLite.
4. The frontend displays the returned locations on the map.
5. The user selects a starting point and destination.
6. The frontend sends a route request to the backend.
7. The backend calculates a path using the configured graph and routing algorithm.
8. The route information is returned to the frontend and displayed on the map.

Architecture

User / Web Browser
        |
        v
HTML + CSS + JavaScript
        |
        +------> Leaflet Map
        |             |
        |             v
        |      OpenStreetMap Tiles
        |
        v
FastAPI Backend
        |
        +------> Location API
        |
        +------> Route API
        |             |
        |             v
        |      Dijkstra's Algorithm
        |
        v
SQLite Database
        |
        +------> Campus Locations
        |
        +------> Path Network

The diagram represents the intended architecture of the supplied prototype. Actual implementation details should be checked against the current source code.

---

📁 Project Structure

The expected project structure is:

campus_companion/
│
├── main.py
│   └── FastAPI application and backend logic
│
├── requirements.txt
│   └── Python package dependencies
│
├── README.md
│   └── Project documentation
│
├── campus.db
│   └── SQLite database, if included in the project
│
└── static/
    ├── index.html
    │   └── Main webpage
    │
    ├── style.css
    │   └── Frontend styling
    │
    └── app.js
        └── Map interaction and frontend logic

The database may be generated automatically by the application, depending on how "main.py" initializes it. Keep the existing database if it contains the location data your application needs.

---

💻 Requirements

Before running the project, make sure you have:

- Python 3.10 or newer.
- Git, if you want to clone the repository.
- A modern web browser.
- An internet connection for external map tiles and CDN-hosted libraries.
- The required Python packages listed in "requirements.txt".

---

🚀 Installation and Setup

1. Clone the repository

Replace "YOUR-USERNAME" with your GitHub username.

git clone https://github.com/YOUR-USERNAME/campus-companion.git

Enter the project folder:

cd campus-companion

If your GitHub repository contains the project inside an additional "campus_companion/" directory, enter that directory before continuing.

2. Create a virtual environment

A virtual environment keeps the project's Python dependencies separate from other Python projects.

Windows — Command Prompt:

python -m venv .venv

Activate it:

.venv\Scripts\activate

Windows — PowerShell:

.\.venv\Scripts\Activate.ps1

If PowerShell blocks activation, use Command Prompt or run the Python executable inside ".venv" directly.

3. Install dependencies

With the virtual environment activated:

python -m pip install -r requirements.txt

4. Start the application

Run:

uvicorn main:app --reload

If Uvicorn is not found, try:

python -m uvicorn main:app --reload

5. Open the website

Visit:

http://127.0.0.1:8000

The FastAPI application should serve the frontend and API endpoints, provided the project is configured accordingly.

6. Explore the API documentation

If the application exposes FastAPI's default interactive documentation, visit:

http://127.0.0.1:8000/docs

This page allows you to inspect and test available API endpoints.

---

🔌 API Endpoints

The supplied prototype describes these endpoints:

Endpoint| Purpose
"GET /api/locations"| Retrieves available campus locations
"GET /api/route"| Finds a route through the configured path network

The exact HTTP method, required query parameters, response structure, and error responses depend on the implementation in "main.py".

For example, a route endpoint may require a start location and destination identifier. Refer to the application's API documentation or source code to confirm the exact request format.

---

🧠 Routing Algorithm

The prototype uses Dijkstra's algorithm to find a shortest path through a graph of connected campus locations.

A graph consists of:

- Nodes: Locations or junctions.
- Edges: Connections between locations.
- Weights: Costs assigned to edges, such as distance.

Dijkstra's algorithm repeatedly explores the currently cheapest reachable node and updates the best known costs to its neighbours. It is suitable for shortest-path calculations when edge weights are non-negative.

The route returned by this algorithm is only as reliable as the graph and weights provided to it.

A shortest path in the sample graph does not automatically represent a real, safe, or accessible walking route on campus.

---

♿ Accessibility Considerations

Accessibility is an important part of the project's intended design.

The prototype explores filtering paths using a "step_free_verified" attribute. This creates a foundation for distinguishing surveyed step-free connections from connections whose accessibility has not been confirmed.

Before the app is used for real navigation:

- Verify entrances and walking paths on site.
- Check ramps, stairs, lifts, surface conditions, and other relevant obstacles.
- Record which routes have actually been surveyed.
- Add the date and source of verification.
- Consult users with mobility needs and relevant campus staff.
- Avoid describing unverified routes as accessible.

The current prototype does not establish that any particular route is accessible.

---

⚠️ Current Limitations

This project is a prototype, and several limitations must be addressed before real-world use.

Illustrative campus data

Coordinates, distances, path connections, walking times, and building positions in the supplied sample data are illustrative. They are not an official or surveyed RNSIT map.

Limited routing coverage

Dijkstra's algorithm can only find paths within the graph supplied to it. Missing or disconnected edges can cause a route request to fail even when a real-world walking route exists.

Accessibility verification

The step-free filter relies on verified edge attributes. Since the supplied sample edges begin with a value of "0", the filter returns no route until relevant paths are verified.

Database persistence

SQLite stores data in a local database file. When deploying the application to a hosting provider, ensure the database is initialized correctly and that persistent storage is configured if the data must survive restarts and redeployments.

External map dependencies

The map depends on internet connectivity and external map resources. Their availability, attribution requirements, and usage policies must be considered.

Not an official campus navigation service

The project is an educational prototype and is not an officially verified RNSIT navigation or accessibility service.

---

🔮 Future Improvements

Potential next steps include:

1. Administrative dashboard: Allow authorized administrators to add, update, and verify locations and paths.
2. GeoJSON support: Import surveyed path networks instead of manually entering every connection.
3. Route verification records: Store the verification date, notes, and source for each path segment.
4. Improved route guidance: Display clearer route instructions and distance information.
5. Indoor navigation: Add verified information about rooms, offices, laboratories, and building entrances.
6. Mobile-first interface: Improve responsive layouts, touch controls, and readability on phones.
7. Location search: Support searching by building name, facility type, or keyword.
8. User feedback: Let users report blocked paths, incorrect pins, or outdated information.
9. Deployment and monitoring: Add reliable database persistence, error logging, and production configuration.
10. Accessibility testing: Evaluate the application with users and revise routes based on verified observations.

These are proposed enhancements, not claims that the features are already implemented.

---

🤝 Contributing

Contributions and suggestions are welcome.

To propose an improvement:

1. Fork the repository.
2. Create a new branch for your change.
3. Make and test your changes.
4. Commit your work with a descriptive message.
5. Open a pull request explaining the change.

For campus mapping contributions, provide the source of the information and indicate whether the relevant locations or paths have been verified.

Please do not submit fabricated campus coordinates or unsupported accessibility claims.

---

📚 Learning Outcomes

This project provides an opportunity to practise:

- Building an interactive frontend with HTML, CSS, and JavaScript.
- Connecting a frontend to backend APIs.
- Creating HTTP endpoints with FastAPI.
- Storing and retrieving structured data using SQLite.
- Applying graph theory and Dijkstra's shortest-path algorithm.
- Integrating an interactive mapping library.
- Considering accessibility and data accuracy during software design.
- Managing source code and documenting a project with Git and GitHub.

---

📄 License

No license has been specified yet. If you intend to let others reuse, modify, or distribute this project, choose an appropriate open-source license and add its corresponding license file.

Check the licensing and attribution requirements of all third-party libraries and map data used by the application before distributing it.

---

Built as a student project to explore web development, mapping, routing, and accessible campus navigation.