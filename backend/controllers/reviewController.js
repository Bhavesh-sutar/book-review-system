const Review = require("../models/Review");
const Book = require("../models/Book");

const recalculateRating = async (bookId) => {
    const reviews = await Review.find({ book: bookId });

    if (reviews.length === 0) {
        await Book.findByIdAndUpdate(bookId, {
            averageRating: 0
        });
        return;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    await Book.findByIdAndUpdate(bookId, {
        averageRating: Number(average.toFixed(2))
    });
};

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { bookId } = req.params;

        if (!rating || !comment) {
            return res.status(400).json({
                message: "Rating and comment are required"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be an integer from 1 to 5"
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const existingReview = await Review.findOne({
            user: req.user,
            book: bookId
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this book"
            });
        }

        const review = await Review.create({
            user: req.user,
            book: bookId,
            rating,
            comment
        });

        await recalculateRating(bookId);

        const populatedReview = await Review.findById(review._id)
            .populate("user", "username");

        res.status(201).json({
            message: "Review created successfully",
            review: populatedReview
        });

    } catch (error) {
        console.error("Create review error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { reviewId } = req.params;

        if (!rating || !comment) {
            return res.status(400).json({
                message: "Rating and comment are required"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be an integer from 1 to 5"
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        if (review.user.toString() !== req.user.toString()) {
            return res.status(403).json({
                message: "You can only update your own review"
            });
        }

        review.rating = rating;
        review.comment = comment;

        await review.save();

        await recalculateRating(review.book);

        const updatedReview = await Review.findById(review._id)
            .populate("user", "username");

        res.status(200).json({
            message: "Review updated successfully",
            review: updatedReview
        });

    } catch (error) {
        console.error("Update review error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        if (review.user.toString() !== req.user.toString()) {
            return res.status(403).json({
                message: "You can only delete your own review"
            });
        }

        const bookId = review.book;

        await Review.findByIdAndDelete(reviewId);

        await recalculateRating(bookId);

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



module.exports = {
    createReview,
    updateReview,
    deleteReview
};