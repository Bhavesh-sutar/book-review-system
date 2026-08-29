const express = require("express");

const { 
  getBooks, 
  createBook, 
  getBookById, 
  searchBooks, 
  deleteBook, 
  updateBook 
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", getBooks); //Public route to get all books
router.get("/search", searchBooks); // Public route to search books by title or author
router.get("/:id", getBookById); // Public route to get a book by ID

// Authenticated users can create books
router.post("/", protect, createBook); // Protected route to create a new book

// Authenticated users can update/delete their own books
// Admins can update/delete any book
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;


// Note: Here authAdminMiddleware is not used because user is admin or normal user it is verified in bookController File, and authMiddleware will be used for Admin Only Requests.
// Because there is no reason for Admin Only APIs to go to controller and check if user is admin or not, so we can create a separate middleware for Admin Only APIs.