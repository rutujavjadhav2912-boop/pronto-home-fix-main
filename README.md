# 🚀 Pronto Home Fix

A full-stack home services booking platform that connects users with verified professionals like plumbers, electricians, AC technicians, and more — built with modern web technologies.

---

## 📌 Overview

**Pronto Home Fix** is designed to simplify booking home services with real-time updates, role-based dashboards, and secure payment integration.

Users can:

* Browse services
* Book professionals
* Track job status
* Leave reviews

Workers can:

* Manage assigned jobs
* Update availability
* Track earnings

Admins can:

* Monitor platform activity
* Manage users & workers
* View analytics

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Shadcn UI
* Axios / Fetch API
* Socket.IO Client

### Backend

* Node.js
* Express.js
* PostgreSQL
* Socket.IO
* JWT Authentication

---

## 📂 Project Structure

```
Pronto-Home-Fix/
│
├── client (Frontend)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── components/ui/
│       ├── dashboards/
│       └── lib/
│
├── server (Backend)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── db/
│   └── scripts/
```

---

## 🎯 Features

### 👤 User Features

* Register/Login (JWT Auth)
* Browse service categories
* Book services instantly
* Track booking status in real-time
* Submit reviews

### 🛠️ Worker Features

* View assigned jobs
* Update job status
* Manage availability
* Dashboard for tracking work

### 🛡️ Admin Features

* Manage users & workers
* Monitor bookings
* View analytics dashboard
* Platform-wide control

### ⚡ Core Features

* Real-time updates (Socket.IO)
* Role-based access control
* Secure payments (Stripe / Razorpay)
* Notifications system
* Responsive UI (mobile-friendly)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/pronto-home-fix.git
cd pronto-home-fix
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create `.env` file:

```
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
```

Run server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔌 API Endpoints (Sample)

| Method | Endpoint       | Description    |
| ------ | -------------- | -------------- |
| POST   | /auth/login    | User login     |
| POST   | /auth/register | Register user  |
| GET    | /bookings      | Get bookings   |
| POST   | /bookings      | Create booking |
| GET    | /admin/users   | Get all users  |

---

## 🧠 Architecture

* **MVC Pattern** (Controllers + Models)
* **REST API** for communication
* **WebSockets** for real-time updates
* **PostgreSQL** for relational data storage

---

## 🔐 Security

* JWT Authentication
* Role-based access control
* Secure API routes
* Environment variables for secrets

---

## 📊 Future Improvements

* 📍 Live worker tracking (Google Maps)
* 🌐 Multi-language support
* 📱 Mobile app version
* 🤖 AI-based worker recommendation
* 💳 Advanced payment features

---

## 🤝 Contributing

Contributions are welcome!

```bash
fork → clone → create branch → commit → push → pull request
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Kuber (Survival Craze)**

* YouTube: Gaming & Tech Content Creator
* Developer | Freelancer

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 📢 Share it

---
