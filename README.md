````markdown
# Book Review System

A full-stack Book Review System built as a take-home assignment using React.js, Node.js, Express.js, MongoDB, and Mongoose.

## Features

- User signup and login
- JWT-based authentication
- Password hashing with bcryptjs
- Unique username, email, and mobile number
- Book listing with pagination
- Search by book title or author
- Filter by author and genre
- Add new books
- View book details and reviews
- Add, edit, and delete reviews
- One review per user per book
- Users can only edit or delete their own reviews
- Automatic average rating calculation
- Loading, error, and empty states

## Tech Stack

### Frontend

- React.js
- Vite
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

## Project Structure

```text
book-review-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   └── src/
│
├── postman/
│   └── Book Review System API.postman_collection.json
│
├── .gitignore
├── README.md
└── .env.example
```
````

## Requirements

- Node.js
- npm
- MongoDB

## Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd book-review-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/bookreviewdb
JWT_SECRET=your_secure_jwt_secret
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:3000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

```text
POST /auth/signup
POST /auth/login
```

### Books

```text
GET  /books
GET  /books/search?q=
GET  /books/:id
POST /books
```

### Reviews

```text
POST   /books/:bookId/reviews
PUT    /reviews/:reviewId
DELETE /reviews/:reviewId
```

Protected endpoints use:

```text
Authorization: Bearer <JWT>
```

## Database Design

The application uses three main models:

```text
User
 └── Reviews

Book
 └── Reviews

Review
 ├── User reference
 └── Book reference
```

A unique compound index on `user` and `book` ensures that a user can submit only one review for a particular book.

## Postman

A Postman collection containing the project APIs is included in:

```text
postman/Book Review System API.postman_collection.json
```

## AI Usage Log

AI assistance was used during development through ChatGPT.

It was used for:

- Understanding the assignment requirements
- Planning the application structure
- Understanding unfamiliar technologies and concepts
- Assistance with implementation and debugging
- Reviewing API flows and testing scenarios

All generated code was reviewed, integrated, and tested locally as part of the development process.

## Security

- Passwords are hashed using bcryptjs
- JWT is used for authentication
- Protected routes require authentication
- `.env` is excluded from Git
- Sensitive credentials are not committed to the repository

```

```
