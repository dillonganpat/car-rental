# DriveEasy — Car Rental Platform

A full-stack car rental booking web application built with the MERN stack.

## Features
- JWT authentication with role-based access (user / owner)
- Browse and filter cars by category, location, price, fuel type, transmission
- Full booking system with date selection and cancellation
- Owner dashboard — list cars, manage bookings, toggle availability
- Image uploads via Cloudinary
- Fully responsive UI built with Tailwind CSS

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT |
| Images | Cloudinary |
| Deployment | Vercel |

## Getting Started

### 1. Clone the repo
git clone https://github.com/dillonganpat/car-rental.git
cd car-rental

### 2. Install dependencies
cd server && npm install
cd ../client && npm install

### 3. Set up environment variables
Create server/.env:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000

### 4. Run locally
Terminal 1 - backend: cd server && npm start
Terminal 2 - frontend: cd client && npm run dev

Visit http://localhost:5173

## Author
Dillon Ganpat
GitHub: https://github.com/dillonganpat
