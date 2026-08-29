const express = require("express");

const {
    getAllUsers,
    deleteUser,
    getAllReviews,
    deleteAnyReview
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin user management
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:userId", protect, adminOnly, deleteUser);

// Admin review management
router.get("/reviews", protect, adminOnly, getAllReviews);
router.delete("/reviews/:reviewId", protect, adminOnly, deleteAnyReview);

module.exports = router;