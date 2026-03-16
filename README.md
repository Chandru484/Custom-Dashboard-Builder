# Dashboard Builder

A premium, full-stack ERP-style dashboard for managing customer orders and viewing real-time analytics. Built with a focus on **security**, **responsiveness**, and **performance**.

## 🚀 Features

- **Secure Authentication:** Full JWT-based login and signup system with role-based access control (User & Admin).
- **Dynamic Dashboard:** Configurable charts and KPI cards that update in real-time as data changes.
- **Configure Dashboard:** Powerful drag-and-drop interface to build and customize your own dashboard layout.
- **Order Management:** Complete CRUD operations for customer orders with automated price calculations.
- **Premium Responsive UI:** A "Deep Blue" minimal design that adapts perfectly to desktop, tablet, and mobile screens.
- **Admin Access:** A dedicated (unlisted) route for administrative login to manage system-wide settings.

## 🛠️ Tech Stack

### Frontend
- **React (Vite)** for a lightning-fast UI.
- **Recharts** for premium data visualizations.
- **Axios** with JWT interceptors for secure API communication.
- **Custom CSS** for a pixel-perfect, framework-free design system.

### Backend
- **Flask (Python)** for a robust RESTful API.
- **MongoDB Atlas** for scalable, cloud-native data storage.
- **Flask-JWT-Extended** for session management.
- **Bcrypt** for secure password hashing.

---

## 📖 Getting Started

### 1. Prerequisites
- Python 3.x
- Node.js & npm
- MongoDB Atlas account (connection string needed)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file based on .env.example
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Credentials for Testing
- **Standard User:** `user@halleyx.com` / `password123`
- **Admin User:** `admin@halleyx.com` / `admin123`

---

## 📁 Project Structure

- `/backend`: Flask API routes, database models, and authentication logic.
- `/frontend`: React components, pages, and global state management.
- `/brain`: Project logs, task tracking, and implementation plans.
