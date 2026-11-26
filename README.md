# DriveEasy Car Rental Platform

A full-stack car rental booking web application built with the MERN stack.

## Live Demo
🔗 https://car-rental-client-xuyh.onrender.com

## Features
- JWT authentication with role-based access (user / owner)
- Browse and filter cars by category, location, price, fuel type, transmission
- Full booking system with date selection and cancellation
- Owner dashboard — list cars, manage bookings, toggle availability
- Overlapping bookings are rejected, so a car can't be rented twice for the same dates
- Stripe payments, confirmed server-side against Stripe before a booking is marked paid
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
| Payments | Stripe (test mode) |
| Testing | Vitest, Supertest |
| CI | GitHub Actions |
| Deployment | Render |

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
STRIPE_SECRET_KEY=your_stripe_test_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000

### 4. Run locally
Terminal 1 - backend: cd server && npm start
Terminal 2 - frontend: cd client && npm run dev

Visit http://localhost:5173

## Testing
cd car-rental/server && npm test

The API tests mock the database and Stripe, so they run with no setup. They cover sign-up
rules, booking dates and overlaps, payment confirmation, input validation and error handling.
GitHub Actions runs them, plus a client build, on every push and pull request.

## Security notes
- Visitors can only sign up as `user` or `owner`; admins are never self-assigned.
- Request bodies are validated with Zod, which also blocks NoSQL operator injection.
- Payments are confirmed with Stripe (status, booking id and amount), never on the client's word.
- Owners can only edit an allow-list of listing fields.
- `helmet` headers, rate limiting on auth routes, a body size limit, and image upload limits (5 MB, images only).
- Internal error details are logged on the server, not sent to users.
- `CLIENT_URL` accepts several comma-separated origins.

Known limitation: the overlap check and the booking insert are two separate steps, so two requests
arriving at the same instant could both pass. A MongoDB transaction or a unique-slot design would close that gap.

## Author
Dillon Ganpat
GitHub: https://github.com/dillonganpat
