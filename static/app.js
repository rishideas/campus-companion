
"use strict";

// ============================================================
// CAMPUS COMPANION — RNSIT
// Keeps main.py, database and existing coordinates unchanged.
// ============================================================

// Indoor room layout based on the information you provided.
const indoorRooms = [
    {
        id: "indoor:water",
        name: "Drinking Water Point",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:staff",
        name: "Staff Room",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:principal",
        name: "Principal's Office",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:admin",
        name: "Administrative Office",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:chem2",
        name: "Chemistry Lab 2",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:chem1",
        name: "Chemistry Lab 1",
        building: "Admin Block",
        type: "indoor"
    },
    {
        id: "indoor:equipment",
        name: "Chemistry Equipment Room",
        building: "Admin Block",
        type: "indoor"
    }
];

let outdoorLocations = [];
let allLocations = [...indoorRooms];

let map = null;
let AdvancedMarkerElement = null;
let Route = null;
let routePolyline = null;
let activeMarkers = [];

let selectedStart = null;
let selectedDestination = null;

let mapReady = false;
let locationsLoaded = false;

const $ = (id) => document.getElementById(id);

// ============================================================
// GENERAL HELPERS
// ============================================================

function setStatus(message) {
    const element = $("routeStatus");
    if (element) element.textContent = message;
}

function normalizeText(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function rawLocationName(location) {
    return String(
        location?.name ??
        location?.title ??
        location?.location_name ??
        location?.locationName ??
        "Unnamed location"
    ).trim();
}

// Treat Admin / Help Desk and its common naming variations
// as the Admin Block without modifying the original DB record.
function locationName(location) {
    const originalName = rawLocationName(location);
    const normalized = normalizeText(originalName);

    const aliases = [
        "admin",
        "adminblock",
        "administrationblock",
        "administrativeblock",
        "adminhelpdesk",
        "helpdesk",
        "adminandhelpdesk",
        "administrationhelpdesk",
        "adminhelpdeskblock",
        "administrativehelpdesk"
    ];

    if (aliases.includes(normalized)) {
        return "Admin Block";
    }

    return originalName;
}

function locationId(location) {
    return String(
        location?.id ??
        location?.location_id ??
        location?.locationId ??
        locationName(location)
    );
}

function isIndoor(location) {
    return location?.type === "indoor" ||
        String(location?.id ?? "").startsWith("indoor:");
}

function getLat(location) {
    const value = Number(
        location?.lat ??
        location?.latitude
    );

    return Number.isFinite(value) ? value : null;
}

function getLng(location) {
    const value = Number(
        location?.lon ??
        location?.lng ??
        location?.longitude
    );

    return Number.isFinite(value) ? value : null;
}

function hasCoordinates(location) {
    return Boolean(
        location &&
        !isIndoor(location) &&
        getLat(location) !== null &&
        getLng(location) !== null
    );
}

function getDisplayName(location) {
    if (isIndoor(location)) {
        return `${location.name} — Admin Block`;
    }

    return locationName(location);
}

// ============================================================
// FIND EXISTING ADMIN BLOCK / ADMIN / HELP DESK LOCATION
// ============================================================

function findAdminBlock() {
    const aliases = new Set([
        "admin",
        "adminblock",
        "administrationblock",
        "administrativeblock",
        "adminhelpdesk",
        "helpdesk",
        "adminandhelpdesk",
        "administrationhelpdesk",
        "adminhelpdeskblock",
        "administrativehelpdesk"
    ]);

    // Search existing outdoor records only.
    // Never generate or alter coordinates.
    return outdoorLocations.find((location) => {
        const possibleNames = [
            location?.name,
            location?.title,
            location?.location_name,
            location?.locationName,
            location?.building
        ];

        return possibleNames.some((value) =>
            aliases.has(normalizeText(value))
        );
    }) ?? null;
}

// ============================================================
// SEARCH
// ============================================================

function searchLocations(query) {
    const queryText = normalizeText(query);

    if (!queryText) return [];

    return allLocations
        .filter((location) => {
            const searchableText = [
                locationName(location),
                location?.building,
                location?.description,
                location?.type,
                isIndoor(location) ? "admin block" : ""
            ].join(" ");

            return normalizeText(searchableText)
                .includes(queryText);
        })
        .slice(0, 12);
}

function createLocationButton(location, className, onSelect) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = getDisplayName(location);

    button.addEventListener("click", () => {
        onSelect(location);
    });

    return button;
}

function renderSuggestions(which, query) {
    const hints = $(which + "Hints");
    const allList = $(which + "AllLocations");

    if (!hints || !allList) return;

    hints.replaceChildren();
    allList.replaceChildren();
    allList.hidden = true;

    if (!query.trim()) {
        hints.hidden = true;
        return;
    }

    const matches = searchLocations(query);

    if (matches.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-result";
        empty.textContent =
            "No matching location. Try another name or select View all.";

        hints.appendChild(empty);
    } else {
        matches.forEach((location) => {
            hints.appendChild(
                createLocationButton(
                    location,
                    "suggestion-item",
                    (chosen) => chooseLocation(which, chosen)
                )
            );
        });
    }

    hints.hidden = false;
}

function renderAllLocations(which) {
    const hints = $(which + "Hints");
    const allList = $(which + "AllLocations");

    hints.replaceChildren();
    hints.hidden = true;

    allList.replaceChildren();

    if (!allLocations.length) {
        const empty = document.createElement("div");
        empty.className = "empty-result";
        empty.textContent = "No locations have been loaded yet.";

        allList.appendChild(empty);
    } else {
        allLocations.forEach((location) => {
            allList.appendChild(
                createLocationButton(
                    location,
                    "location-item",
                    (chosen) => chooseLocation(which, chosen)
                )
            );
        });
    }

    allList.hidden = false;
}

function chooseLocation(which, location) {
    const input = $(which + "Search");
    const hints = $(which + "Hints");
    const allList = $(which + "AllLocations");
    const selectedLabel = $(which + "Selected");

    if (!input || !selectedLabel) return;

    if (which === "start") {
        selectedStart = location;
    } else {
        selectedDestination = location;
    }

    input.value = getDisplayName(location);

    hints.hidden = true;
    allList.hidden = true;

    selectedLabel.textContent =
        "Selected: " + getDisplayName(location);

    selectedLabel.classList.add("selected");

    if (mapReady && hasCoordinates(location)) {
        map.panTo({
            lat: getLat(location),
            lng: getLng(location)
        });

        map.setZoom(18);
    }

    if (isIndoor(location)) {
        setStatus(
            `${location.name} is inside the Admin Block. ` +
            "First go to the Admin Block entrance, then follow the indoor flowchart below the map."
        );
    } else {
        setStatus(
            `${getDisplayName(location)} selected. ` +
            "Select the other location and click Find Route."
        );
    }
}

// ============================================================
// MAP MARKERS AND ROUTE CLEANUP
// ============================================================

function clearRoute() {
    if (routePolyline) {
        routePolyline.setMap(null);
        routePolyline = null;
    }
}

function clearMarkers() {
    activeMarkers.forEach((marker) => {
        marker.map = null;
    });

    activeMarkers = [];
}

function addMarker(location) {
    if (
        !mapReady ||
        !hasCoordinates(location) ||
        !AdvancedMarkerElement
    ) {
        return;
    }

    const marker = new AdvancedMarkerElement({
        map,
        position: {
            lat: getLat(location),
            lng: getLng(location)
        },
        title: locationName(location)
    });

    activeMarkers.push(marker);
}

function drawOutdoorMarkers() {
    if (!mapReady) return;

    clearMarkers();

    outdoorLocations.forEach((location) => {
        addMarker(location);
    });
}

// ============================================================
// INDOOR FLOWCHART
// ============================================================

function showIndoorGuide(destination) {
    const section = $("indoorSection");
    const result = $("indoorGuideResult");

    if (!section || !result) return;

    section.hidden = false;
    result.replaceChildren();

    const intro = document.createElement("p");
    intro.className = "indoor-intro";

    intro.textContent =
        `${destination.name} is in the Admin Block. ` +
        "First follow the Google Maps walking route to the Admin Block entrance. " +
        "Once there, follow these indoor directions.";

    result.appendChild(intro);

    const directions = {
        "indoor:water": {
            title: "Drinking Water Point",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Drinking water point is to the left of the staircase"
            ]
        },

        "indoor:staff": {
            title: "Staff Room",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn left into the corridor",
                "Staff Room — first room on the left"
            ]
        },

        "indoor:principal": {
            title: "Principal's Office",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn left into the corridor",
                "Pass the Staff Room",
                "Principal's Office — second room on the left"
            ]
        },

        "indoor:admin": {
            title: "Administrative Office",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn left into the corridor",
                "Pass the Staff Room and Principal's Office",
                "Administrative Office — third room on the left"
            ]
        },

        "indoor:chem2": {
            title: "Chemistry Lab 2",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn right into the corridor",
                "Chemistry Lab 2 — first room on the right"
            ]
        },

        "indoor:chem1": {
            title: "Chemistry Lab 1",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn right into the corridor",
                "Pass Chemistry Lab 2",
                "Chemistry Lab 1 — second room on the right"
            ]
        },

        "indoor:equipment": {
            title: "Chemistry Equipment Room",
            steps: [
                "Admin Block entrance",
                "Go straight ahead to the staircase",
                "Turn right into the corridor",
                "Pass Chemistry Lab 2 and Chemistry Lab 1",
                "Chemistry Equipment Room — last room on the right"
            ]
        }
    };

    const route = directions[destination.id] ?? {
        title: destination.name,
        steps: [
            "Admin Block entrance",
            "Ask campus staff to confirm the room's exact location"
        ]
    };

    const heading = document.createElement("h3");
    heading.className = "flowchart-title";
    heading.textContent = "Indoor route: " + route.title;

    result.appendChild(heading);

    const flowchart = document.createElement("div");
    flowchart.className = "indoor-flowchart";
    flowchart.setAttribute("role", "list");
    flowchart.setAttribute(
        "aria-label",
        `Indoor directions to ${route.title}`
    );

    route.steps.forEach((step, index) => {
        const node = document.createElement("div");
        node.className = "flow-step";
        node.setAttribute("role", "listitem");

        const number = document.createElement("span");
        number.className = "flow-number";
        number.textContent = String(index + 1);

        const text = document.createElement("span");
        text.className = "flow-step-text";
        text.textContent = step;

        node.append(number, text);
        flowchart.appendChild(node);

        if (index < route.steps.length - 1) {
            const arrow = document.createElement("div");

            arrow.className = "flow-arrow";
            arrow.textContent = "↓";
            arrow.setAttribute("aria-hidden", "true");

            flowchart.appendChild(arrow);
        }
    });

    result.appendChild(flowchart);

    const note = document.createElement("p");
    note.className = "indoor-note";
    note.textContent =
        "These indoor directions use the layout you provided. " +
        "Confirm room signs on site.";

    result.appendChild(note);
}

function showIndoorStartNotice(start) {
    const section = $("indoorSection");
    const result = $("indoorGuideResult");

    section.hidden = false;
    result.replaceChildren();

    const card = document.createElement("div");
    card.className = "indoor-card";

    const heading = document.createElement("h3");
    heading.textContent = "Indoor starting location";

    const message = document.createElement("p");
    message.textContent =
        `Your starting point is ${start.name}. ` +
        "This version provides directions from an outdoor location to an indoor room. " +
        "Indoor room-to-room route calculation is not implemented.";

    card.append(heading, message);
    result.appendChild(card);
}

// ============================================================
// LOAD EXISTING LOCATIONS FROM YOUR UNCHANGED PYTHON API
// ============================================================

async function fetchLocations() {
    setStatus("Loading campus locations...");

    try {
        const response = await fetch("/api/locations", {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `GET /api/locations returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        const rawLocations = Array.isArray(data)
            ? data
            : (data.locations ?? data.items ?? []);

        outdoorLocations = rawLocations
            .filter((item) =>
                item && typeof item === "object"
            )
            .map((item) => ({
                ...item,
                id: locationId(item),
                // Display Admin / Help Desk as Admin Block.
                name: locationName(item),
                // Preserve the existing coordinate values.
                lat: getLat(item),
                lon: getLng(item),
                type: "outdoor"
            }));

        allLocations = [
            ...outdoorLocations,
            ...indoorRooms
        ];

        locationsLoaded = true;

        if (mapReady) {
            drawOutdoorMarkers();
        }

        const adminLocation = findAdminBlock();

        if (adminLocation) {
            setStatus(
                `Loaded ${outdoorLocations.length} outdoor locations and ` +
                `${indoorRooms.length} indoor destinations. ` +
                "Admin Block map location found."
            );
        } else {
            setStatus(
                `Loaded ${outdoorLocations.length} outdoor locations and ` +
                `${indoorRooms.length} indoor destinations. ` +
                "Admin / Help Desk was not matched to an existing location. " +
                "Check the names at /api/locations."
            );

            console.warn(
                "No Admin Block alias matched. Existing location names:",
                outdoorLocations.map(rawLocationName)
            );
        }
    } catch (error) {
        console.error("Could not load campus locations:", error);

        setStatus(
            "Could not load campus locations. Make sure FastAPI is running " +
            "and GET /api/locations returns valid JSON."
        );
    }
}

// ============================================================
// GOOGLE MAPS WALKING ROUTE
// ============================================================

async function findRoute() {
    if (!selectedStart || !selectedDestination) {
        setStatus(
            "Please select both a starting location and a destination from the suggestions."
        );
        return;
    }

    if (
        locationId(selectedStart) ===
        locationId(selectedDestination)
    ) {
        setStatus(
            "Your starting location and destination are the same."
        );
        return;
    }

    if (!mapReady || !Route) {
        setStatus(
            "Google Maps is not ready. Check your API key and reload the page."
        );
        return;
    }

    clearRoute();

    const indoorDestination = isIndoor(selectedDestination);

    if (isIndoor(selectedStart)) {
        showIndoorStartNotice(selectedStart);

        setStatus(
            "Indoor room-to-room navigation is not supported yet. " +
            "Please select an outdoor starting location."
        );

        return;
    }

    if (!hasCoordinates(selectedStart)) {
        setStatus(
            "The starting location has no valid coordinates in the existing campus data."
        );
        return;
    }

    let routeDestination = selectedDestination;

    if (indoorDestination) {
        // Use the existing outdoor Admin / Help Desk location.
        routeDestination = findAdminBlock();

        if (!routeDestination) {
            showIndoorGuide(selectedDestination);

            setStatus(
                `${selectedDestination.name} is in the Admin Block, but no matching ` +
                "Admin / Help Desk location was found in /api/locations. " +
                "The indoor flowchart is shown below. Check the existing API location name."
            );

            return;
        }
    }

    if (!hasCoordinates(routeDestination)) {
        if (indoorDestination) {
            showIndoorGuide(selectedDestination);
        }

        setStatus(
            "The destination has no valid coordinates in the existing campus data."
        );

        return;
    }

    if (
        locationId(selectedStart) ===
        locationId(routeDestination)
    ) {
        if (indoorDestination) {
            showIndoorGuide(selectedDestination);

            setStatus(
                "You are already at the Admin Block map location. " +
                "Follow the indoor flowchart below."
            );
        } else {
            setStatus(
                "Your starting location and destination are the same."
            );
        }

        return;
    }

    if (indoorDestination) {
        showIndoorGuide(selectedDestination);

        setStatus(
            `${selectedDestination.name} is in the Admin Block. ` +
            "First go to the Admin Block entrance. Calculating the outdoor walking route..."
        );
    } else {
        $("indoorSection").hidden = true;
        setStatus("Calculating a walking route...");
    }

    try {
        const { routes } = await Route.computeRoutes({
            origin: {
                lat: getLat(selectedStart),
                lng: getLng(selectedStart)
            },

            destination: {
                lat: getLat(routeDestination),
                lng: getLng(routeDestination)
            },

            travelMode: "WALKING",

            fields: [
                "path",
                "distanceMeters",
                "durationMillis"
            ]
        });

        if (!routes || routes.length === 0 || !routes[0].path) {
            throw new Error("Google Maps returned no walking route.");
        }

        const route = routes[0];

        routePolyline = new google.maps.Polyline({
            path: route.path,
            geodesic: true,
            strokeColor: "#1769d2",
            strokeOpacity: 0.9,
            strokeWeight: 6,
            map
        });

        const bounds = new google.maps.LatLngBounds();

        route.path.forEach((point) => {
            bounds.extend(point);
        });

        map.fitBounds(bounds, 60);

        let message =
            `Walking route: ${getDisplayName(selectedStart)} → ` +
            `${getDisplayName(routeDestination)}.`;

        if (Number.isFinite(route.distanceMeters)) {
            const distance = route.distanceMeters >= 1000
                ? `${(route.distanceMeters / 1000).toFixed(2)} km`
                : `${Math.round(route.distanceMeters)} m`;

            message += ` Distance: ${distance}.`;
        }

        if (Number.isFinite(route.durationMillis)) {
            const minutes = Math.round(
                route.durationMillis / 60000
            );

            message += ` Estimated walking time: ${minutes} min.`;
        }

        if (indoorDestination) {
            message +=
                ` You have reached the Admin Block map destination. ` +
                `Follow the indoor flowchart below for ${selectedDestination.name}.`;
        }

        setStatus(message);
    } catch (error) {
        console.error("Walking route calculation failed:", error);

        if (indoorDestination) {
            showIndoorGuide(selectedDestination);
        }

        setStatus(
            "Could not calculate the walking route. Check that the Routes API " +
            "is enabled, billing is configured if required, and your Google Maps API key permits the request. " +
            "Indoor directions are shown below for indoor destinations."
        );
    }
}

// ============================================================
// SEARCH INPUT EVENT HANDLERS
// ============================================================

function setupSearch(which) {
    const input = $(which + "Search");
    const viewAll = $(which + "ViewAllBtn");

    if (!input || input.tagName !== "INPUT" || input.type !== "text") {
        console.error(
            `${which}Search must be an <input type="text"> in index.html.`
        );

        setStatus(
            `Search field error: check the ${which}Search input in index.html.`
        );

        return;
    }

    input.addEventListener("input", () => {
        if (which === "start") {
            selectedStart = null;
        } else {
            selectedDestination = null;
        }

        const selectedLabel = $(which + "Selected");

        selectedLabel.textContent = "No location selected.";
        selectedLabel.classList.remove("selected");

        renderSuggestions(which, input.value);
    });

    input.addEventListener("focus", () => {
        if (input.value.trim()) {
            renderSuggestions(which, input.value);
        }
    });

    viewAll.addEventListener("click", () => {
        renderAllLocations(which);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            $(which + "Hints").hidden = true;
            $(which + "AllLocations").hidden = true;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            const matches = searchLocations(input.value);

            if (matches.length === 1) {
                chooseLocation(which, matches[0]);
            } else if (matches.length > 1) {
                renderSuggestions(which, input.value);
            } else {
                setStatus(
                    "No matching location found. Try another search or click View all."
                );
            }
        }
    });
}

// ============================================================
// INITIALIZE GOOGLE MAPS
// ============================================================

window.initMap = async function initMap() {
    try {
        const mapsLibrary =
            await google.maps.importLibrary("maps");

        const markerLibrary =
            await google.maps.importLibrary("marker");

        const routesLibrary =
            await google.maps.importLibrary("routes");

        AdvancedMarkerElement =
            markerLibrary.AdvancedMarkerElement;

        Route = routesLibrary.Route;

        map = new mapsLibrary.Map($("map"), {
            // Initial display only; actual campus markers use DB coordinates.
            center: {
                lat: 12.9416,
                lng: 77.5668
            },

            zoom: 16,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            mapId: "DEMO_MAP_ID"
        });

        mapReady = true;

        if (locationsLoaded) {
            drawOutdoorMarkers();
        }

        setStatus(
            "Google Maps loaded. Search for a location and select a suggestion."
        );
    } catch (error) {
        console.error("Google Maps initialization failed:", error);

        setStatus(
            "Google Maps could not initialize. Check the API key, enabled APIs, " +
            "billing settings, and browser console."
        );
    }
};

// ============================================================
// PAGE STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupSearch("start");
    setupSearch("destination");

    const routeButton = $("routeBtn");

    if (routeButton) {
        routeButton.addEventListener("click", findRoute);
    }

    fetchLocations();
});
