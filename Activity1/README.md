# Activity 1: To-Do List (NestJS + React)

This project contains a backend API built with NestJS, TypeORM (SQLite), and Swagger docs, and a frontend built with React (Vite + TypeScript).

## Run locally

Backend:
- Open a terminal:
```
cd "backend/todo-api"
npm install
npm run start:dev
```
- API runs on `http://localhost:3001`
- Swagger docs at `http://localhost:3001/api`

Frontend:
- Open another terminal:
```
cd "frontend/todo-ui"
npm install
npm run dev
```
- UI runs at the printed Vite URL (typically `http://localhost:5173`)

## Features
- CRUD endpoints for tasks: create, list, get by id, update, delete
- Validation via `class-validator`
- SQLite database auto-synced via TypeORM
- CORS enabled for local dev
- Simple React UI to add/edit/delete/toggle tasks

## API Endpoints
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`


