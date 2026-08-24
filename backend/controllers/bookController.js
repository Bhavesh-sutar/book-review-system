const Book = require("../models/Book");

const getBooks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            author,
            genre
        } = req.query;

        const filter = {};

        if (author) {
            filter.author = {
                $regex: author,
                $options: "i"
            };
        }

        if (genre) {
            filter.genre = {
                $regex: genre,
                $options: "i"
            };
        }

        const skip = (page - 1) * limit;

        const books = await Book.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const totalBooks = await Book.countDocuments(filter);

        res.status(200).json({
            books,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalBooks / limit),
                totalBooks
            }
        });

    } catch (error) {
        console.error("Get books error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, author, genre } = req.body;

        if (!title || !author || !genre) {
            return res.status(400).json({
                message: "Title, author, and genre are required"
            });
        }

        const book = await Book.create({
            title,
            author,
            genre,
            averageRating: 0
        });

        res.status(201).json({
            message: "Book created successfully",
            book
        });

    } catch (error) {
        console.error("Create book error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const Review = require("../models/Review");

        const reviews = await Review.find({ book: book._id })
            .populate("user", "username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            book,
            reviews
        });

    } catch (error) {
        console.error("Get book error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};



const searchBooks = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const books = await Book.find({
            $or: [
                {
                    title: {
                        $regex: q,
                        $options: "i"
                    }
                },
                {
                    author: {
                        $regex: q,
                        $options: "i"
                    }
                }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            books
        });

    } catch (error) {
        console.error("Search books error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getBooks,
    createBook,
    getBookById,
    searchBooks
};

