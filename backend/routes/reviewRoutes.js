const express = require("express");

const {
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/books/:bookId/reviews", protect, createReview);

router.put("/reviews/:reviewId", protect, updateReview);

router.delete("/reviews/:reviewId", protect, deleteReview);

module.exports = router;