# 🗂️ Nx Task Manager – RBAC Enabled (Angular + NestJS)

A full-stack **Task Management System** built using an **Nx monorepo**, featuring **JWT authentication**, **role-based access control (RBAC)**

This project is designed to demonstrate **real-world full-stack engineering practices** including authorization, modular architecture, secure APIs, and scalable monorepo structure.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login
- Role-based access control (**Owner / Admin / Viewer**)
- Backend-enforced permissions using guards

### 👥 User Roles

| Role | Permissions |
|-----|------------|
| **Owner** | Full access (create, update, delete, view all tasks) |
| **Admin** | Create, update, delete, view all tasks |
| **Viewer** | Read-only access (cannot create, update, or delete) |

### 📋 Task Management
- Create, edit, delete tasks
- Task categories: **Work / Personal**
- Task statuses:
  - To Do
  - In Progress
  - Done

### 🧲 Drag & Drop Board
- Kanban board using **Angular CDK DragDrop**
- Drag tasks between columns
- Task status updates persist to backend
- Works even when target column is empty

### 🧱 Backend
- NestJS REST API
- TypeORM + SQLite
- Organization-scoped task access
- Clean service-controller architecture

### 🧱 Monorepo Architecture (Nx)
- `apps/api` → NestJS backend
- `apps/dashboard` → Angular frontend
- `libs/auth` → Auth guards & decorators
- `libs/data` → Shared entities & DTOs

---

## 🛠 Tech Stack

**Frontend**
- Angular (Standalone Components)
- Angular CDK (Drag & Drop)
- Tailwind CSS

**Backend**
- NestJS
- TypeORM
- SQLite
- JWT Authentication

**Tooling**
- Nx Monorepo
- TypeScript
- Git & GitHub

---

## 📂 Project Structure

```
apps/
 ├── api/                # NestJS backend
 └── dashboard/          # Angular frontend

libs/
 ├── auth/               # Auth guards & decorators
 └── data/               # Entities, DTOs, enums

database.sqlite          # SQLite database
```

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Prerequisites

Install the following:

- **Node.js** (v18+ recommended)
- **npm**
- **Nx CLI**

```bash
npm install -g nx
```

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Seed the Database (Users & Roles)

```bash
node seed-now.js
```

This creates test users:

| Email | Role | Password |
|------|------|---------|
| owner@example.com | owner | password |
| admin@example.com | admin | password |
| viewer@example.com | viewer | password |

---
## **Environment Setup**

Create a `.env` file with:

```env
JWT_SECRET=task-management-assessment-secret-key-2024
JWT_EXPIRATION=1h
DATABASE_TYPE=sqlite
DATABASE_NAME=database.sqlite
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
### 5️⃣ Run Backend API

```bash
npx nx serve api
```

Backend runs at:
```
http://localhost:3000/api
```

---

### 6️⃣ Run Frontend Dashboard

Open a new terminal:

```bash
npx nx serve dashboard
```

Frontend runs at:
```
http://localhost:4200
```

---

## 🔑 Role Behavior Summary

- **Owner / Admin**
  - Create, edit, delete tasks
  - Drag tasks across columns

- **Viewer**
  - View tasks only
  - Cannot create, update, delete, or move tasks

RBAC is enforced **on the backend**, not just the UI.

---

## 🧪 Example Workflow

1. Login as **owner@example.com**
2. Create tasks in **To Do**
3. Drag tasks to **In Progress** or **Done**
4. Login as **viewer@example.com**
5. Verify read-only access

---

## 🧠 Engineering Highlights

- Nx monorepo with shared libraries
- Secure backend authorization
- Clean separation of concerns
- Production-style RBAC implementation
- Drag & drop with persistent backend state

---

## 📹 Demo Video

A 7-minute walkthrough video demonstrates:
- Architecture
- RBAC behavior
- Drag & drop functionality
- Code structure

📎 *(Video link included in submission)*

---

## 👤 Author

**Suyosha Acharya**  
Computer Science Graduate  
Full-Stack / Software Engineer  

GitHub: https://github.com/SuyoshaA

---

## 📜 License

MIT License


