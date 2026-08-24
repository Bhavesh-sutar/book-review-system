
const express = require("express");
const { getBooks, createBook, getBookById, searchBooks } = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/search", searchBooks);
router.get("/:id", getBookById);
router.post("/", protect, createBook);


module.exports = router;
