# 🚗 DriveEasy — Car Rental App (MERN Stack)

A full-stack car rental booking platform built with MongoDB, Express, React, and Node.js.

---

## ✨ Features

- User authentication (JWT)
- Browse and filter cars by category, location, price, fuel type
- Book cars with date selection
- My Bookings page with cancel functionality
- Owner dashboard: add cars, manage listings, update booking statuses
- Image uploads via Cloudinary
- Responsive design with Tailwind CSS

---

## 🏗 Project Structure

```
car-rental/
├── client/          ← React (Vite + Tailwind)
└── server/          ← Express + MongoDB
```

---

## 🚀 Setup (Local Development)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/car-rental.git
cd car-rental
```

### 2. Install all dependencies
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGODB_URI=mongodb+srv://...      ← from MongoDB Atlas
JWT_SECRET=any_long_random_string
CLOUDINARY_CLOUD_NAME=...          ← from cloudinary.com
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...      ← from stripe.com (optional)
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 4. Run development servers
```bash
# From root — runs both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## ☁️ Services to Set Up

### MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get your connection string → paste as `MONGODB_URI`

### Cloudinary (Free)
1. Go to https://cloudinary.com
2. Sign up for a free account
3. Dashboard → copy Cloud Name, API Key, API Secret

### Stripe (Optional - for payments)
1. Go to https://stripe.com
2. Create account → Dashboard → Developers → API Keys
3. Copy Secret Key

---

## 🌐 Deploy to Vercel

### Deploy the Backend
1. Go to https://vercel.com → New Project
2. Import your GitHub repo → select the `server` folder as root
3. Add all environment variables from your `.env` file
4. Deploy!
5. Copy the deployed URL (e.g. `https://car-rental-api.vercel.app`)

### Deploy the Frontend
1. New Project → same repo → select `client` folder as root
2. Add environment variable:
   ```
   VITE_API_URL=https://car-rental-api.vercel.app
   ```
3. Deploy!

### Update Client API URL
In `client/src/context/AppContext.jsx`, change:
```js
const API = axios.create({ baseURL: '/api' });
```
To:
```js
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/api' });
```

---

## 📦 Adding to GitHub

```bash
git init
git add .
git commit -m "Initial commit: MERN car rental app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/car-rental.git
git push -u origin main
```

---

## 📄 Resume Description

> **DriveEasy — Full-Stack Car Rental Platform**
> 
> Built a production-ready car rental web application using the MERN stack (MongoDB, Express.js, React, Node.js). Features include JWT authentication, role-based access (user/owner), real-time car listings with advanced filtering, booking management system, image uploads via Cloudinary, and responsive UI with Tailwind CSS. Deployed frontend and backend independently on Vercel.

---

## 🛠 Tech Stack

| | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Images | Cloudinary |
| Payments | Stripe (optional) |
| Deployment | Vercel |
