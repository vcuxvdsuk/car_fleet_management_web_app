# Vehicle CRUD App (TypeScript, React, MongoDB)

A full-stack Vehicle Management Application featuring a modern React frontend and a TypeScript/Express backend powered by Prisma and MongoDB.
Includes Docker support for quick, consistent setup across environments.

---

## Features

-   **CRUD operations**: List, create, edit, delete vehicles.
-   **Vehicle status management**: `Available`, `InUse`, `Maintenance`.
-   **Validation rules**:
    -   Only certain status transitions are allowed.
    -   Vehicles in `InUse` or `Maintenance` cannot be deleted.
    -   Maximum 5% of vehicles can be in `Maintenance`.
    -   License plates must be unique and ≤ 20 characters.
-   **Seed data**: Populate the database automatically if empty.
-   **Frontend**: Vite + React + TailwindCSS for a responsive, modern UI.
-   **Backend**: Express API with Prisma ORM connecting to MongoDB.
-   **Docker support**: Fully containerized environment for easy setup and consistent local or production deployment.

## Future Improvements (skipped due to time constraints)

-   Refactor the backend into a layered architecture (controller, service, repository, CRUD separation).
-   optimization.
-   Expand and improve automated test coverage (unit, integration, and end-to-end).
-   Introduce reactive design patterns (the main reason MongoDB was chosen).
-   Refine and polish the frontend UI for a smoother user experience.
-   Add sorting, filtering, and more detailed error handling.
-   Integrate Swagger/OpenAPI documentation for better API visibility.

---

## Getting Started

This project can be run either **locally** or **via Docker**. Docker is recommended for consistent development and deployment environments.

# Docker (Recommended)

# Prerequisites

Before running the project with Docker, make sure the following are installed on your system:

-   Node.js
-   npm
-   Docker
-   Docker Compose

# Run the Project

Open a terminal in the project root directory and run the following commands:

## Stop & remove old containers, volumes, or orphans

docker compose down --volumes --remove-orphans

## Build images from scratch

docker compose build --no-cache

## Start services

docker compose up

The backend will automatically seed the database if it’s empty. Seeded vehicles are located in backend/prisma/vehicles.json.

# Access the App

Once the services are running, open your browser and go to: http://localhost:5173/ in your broweser

# ports

MongoDB: port 27017
Backend API: port 4000
Frontend: port 5173
