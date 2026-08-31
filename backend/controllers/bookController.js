const Book = require("../models/Book");
const Review = require("../models/Review");

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
            averageRating: 0,
            createdBy: req.user.id
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

        // Get reviews for the book, sorted by creation date (newest first)
        const reviews = await Review.find({ book: book._id })
            .populate("user", "username") //We want username in frontend, not the userId...
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


const updateBook = async (req, res) => {
    try {
        const { title, author, genre } = req.body;

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Normal user can update only their own book
        if (
            req.user.role !== "admin" &&
            book.createdBy.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update your own books"
            });
        }

        if (title !== undefined) book.title = title;
        if (author !== undefined) book.author = author;
        if (genre !== undefined) book.genre = genre;

        await book.save();

        res.status(200).json({
            message: "Book updated successfully",
            book
        });

    } catch (error) {
        console.error("Update book error:", error);

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


const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Normal user can delete only their own book
        if (
            req.user.role !== "admin" &&
            book.createdBy.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only delete your own books"
            });
        }

        //Delete all reviews associated with the book
        await Review.deleteMany({
            book: req.params.id
        });
        
        //Delete the book
        await Book.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error("Delete book error:", error);

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


module.exports = {
    getBooks, // Public route to get all books
    createBook, // Protected route to create a new book (requires authentication)
    getBookById, // Public route to get a book by ID
    searchBooks, // Public route to search books by title or author
    updateBook, // Protected route to update a book (requires authentication)
    deleteBook // Protected route to delete a book (requires authentication)
};