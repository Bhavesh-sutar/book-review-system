const User = require("../models/User");
const Review = require("../models/Review");
const Book = require("../models/Book");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            users
        });

    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from deleting an admin account
        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admin account cannot be deleted"
            });
        }

        // Delete user's reviews
        await Review.deleteMany({
            user: userId
        });

        // Delete user's books
        await Book.deleteMany({
            createdBy: userId
        });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "username email")
            .populate("book", "title author")
            .sort({ createdAt: -1 });

        res.status(200).json({
            reviews
        });

    } catch (error) {
        console.error("Get all reviews error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete any review
const deleteAnyReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        const bookId = review.book;

        await Review.findByIdAndDelete(reviewId);

        // Recalculate book rating
        const remainingReviews = await Review.find({
            book: bookId
        });

        let averageRating = 0;

        if (remainingReviews.length > 0) {
            const total = remainingReviews.reduce(
                (sum, review) => sum + review.rating,
                0
            );

            averageRating = Number(
                (total / remainingReviews.length).toFixed(2)
            );
        }

        await Book.findByIdAndUpdate(bookId, {
            averageRating
        });

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid review ID"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getAllUsers,
    deleteUser,
    getAllReviews,
    deleteAnyReview
};