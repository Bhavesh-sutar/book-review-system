import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const [reviewError, setReviewError] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // Edit book state for normal user
    const [editingBook, setEditingBook] = useState(false);

    const [editTitle, setEditTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editGenre, setEditGenre] = useState("");

    const [bookEditError, setBookEditError] = useState("");
    const [bookEditLoading, setBookEditLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const loadBook = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/books/${id}`);

            setBook(response.data.book);
            setReviews(response.data.reviews);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load book"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBook();
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewError("");

        if (!comment.trim()) {
            setReviewError("Comment is required");
            return;
        }

        try {
            setReviewLoading(true);

            await api.post(`/books/${id}/reviews`, {
                rating: Number(rating),
                comment
            });

            setComment("");
            setRating(5);

            await loadBook();
        } catch (error) {
            setReviewError(
                error.response?.data?.message ||
                "Failed to submit review"
            );
        } finally {
            setReviewLoading(false);
        }
    };

    //update users owned book
    const handleUpdateBook = async (e) => {
        e.preventDefault();
        setBookEditError("");

        if (!editTitle.trim() || !editAuthor.trim() || !editGenre.trim()) {
            setBookEditError(
                "Title, author, and genre are required"
            );
            return;
        }

        try {
            setBookEditLoading(true);

            await api.put(`/books/${id}`, {
                title: editTitle,
                author: editAuthor,
                genre: editGenre
            });

            setEditingBook(false);

            await loadBook();

        } catch (error) {
            setBookEditError(
                error.response?.data?.message ||
                "Failed to update book"
            );
        } finally {
            setBookEditLoading(false);
        }
    };

    // updating the review
    const updateReview = async (e) => {
        e.preventDefault();
        setReviewError("");

        if (!comment.trim()) {
            setReviewError("Comment is required");
            return;
        }

        try {
            setReviewLoading(true);

            await api.put(`/reviews/${editingReview._id}`, {
                rating: Number(rating),
                comment
            });

            setEditingReview(null);
            setComment("");
            setRating(5);

            await loadBook();
        } catch (error) {
            setReviewError(
                error.response?.data?.message ||
                "Failed to update review"
            );
        } finally {
            setReviewLoading(false);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Delete this review?")) {
            return;
        }

        try {
            await api.delete(`/reviews/${reviewId}`);
            await loadBook();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete review"
            );
        }
    };

    const startEditing = (review) => {
        setEditingReview(review);
        setRating(review.rating);
        setComment(review.comment);
        setReviewError("");
    };

    const cancelEditing = () => {
        setEditingReview(null);
        setRating(5);
        setComment("");
        setReviewError("");
    };

    if (loading) {
        return <p className="status">Loading book...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (!book) {
        return <p className="status">Book not found.</p>;
    }
    
    //Check Owner of the book, if current user is the owner, then allow edit and delete buttons for the book. Admin can also edit and delete any book.
    const isOwner = currentUser?.id === book.createdBy?.toString();

    return (
        <div className="details-page">

            <button onClick={() => navigate("/dashboard")}>
                ← Back to Books
            </button>

            <section className="book-details">
                <h1>{book.title}</h1>

                <p>
                    <strong>Author:</strong> {book.author}
                </p>

                <p>
                    <strong>Genre:</strong> {book.genre}
                </p>

                <h2>⭐ {book.averageRating || 0}</h2>

                {isOwner && (
                    <button
                        onClick={() => {
                            setEditingBook(true);
                            setEditTitle(book.title);
                            setEditAuthor(book.author);
                            setEditGenre(book.genre);
                            setBookEditError("");
                        }}
                    >
                        Edit Book
                    </button>
                )}
            </section>

            {editingBook && (
                <section className="edit-book-section">
                    <h2>Edit Book</h2>

                
                    <form onSubmit={handleUpdateBook}>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Book title"
                        />

                        <input
                            type="text"
                            value={editAuthor}
                            onChange={(e) => setEditAuthor(e.target.value)}
                            placeholder="Author"
                        />

                        <input
                            type="text"
                            value={editGenre}
                            onChange={(e) => setEditGenre(e.target.value)}
                            placeholder="Genre"
                        />

                        {bookEditError && (
                            
                            <p className="error">{bookEditError}</p>
                        )}

                        <button type="submit">
                            Update Book
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingBook(false);
                                setBookEditError("");
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                </section>
            )}

            <section className="review-section">

                <h2>Reviews ({reviews.length})</h2>

                {reviews.length === 0 && (
                    <p className="status">
                        No reviews yet. Be the first to review!
                    </p>
                )}

                {reviews.map((review) => (
                    <div
                        className="review-card"
                        key={review._id}
                    >
                        <h3>{review.user?.username}</h3>

                        <p>⭐ {review.rating}/5</p>

                        <p>{review.comment}</p>

                        <small>
                            {new Date(
                                review.createdAt
                            ).toLocaleDateString()}
                        </small>

                        {currentUser?.id === review.user?._id && (
                            <div>
                                <button
                                    onClick={() =>
                                        startEditing(review)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        deleteReview(review._id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}

            </section>

            {currentUser ? (
                <section className="add-review">

                    <h2>
                        {editingReview
                            ? "Edit Your Review"
                            : "Write a Review"}
                    </h2>

                    <form
                        onSubmit={
                            editingReview
                                ? updateReview
                                : submitReview
                        }
                    >

                        <select
                            value={rating}
                            onChange={(e) =>
                                setRating(Number(e.target.value))
                            }
                        >
                            <option value={5}>
                                5 - Excellent
                            </option>

                            <option value={4}>
                                4 - Very Good
                            </option>

                            <option value={3}>
                                3 - Good
                            </option>

                            <option value={2}>
                                2 - Fair
                            </option>

                            <option value={1}>
                                1 - Poor
                            </option>
                        </select>

                        <textarea
                            placeholder="Write your review..."
                            value={comment}
                            onChange={(e) =>
                                setComment(e.target.value)
                            }
                        />

                        {reviewError && (
                            <p className="error">
                                {reviewError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={reviewLoading}
                        >
                            {reviewLoading
                                ? "Saving..."
                                : editingReview
                                    ? "Update Review"
                                    : "Submit Review"}
                        </button>

                        {editingReview && (
                            <button
                                type="button"
                                onClick={cancelEditing}
                            >
                                Cancel
                            </button>
                        )}

                    </form>

                </section>
            ) : (
                <section className="login-prompt">

                    <h3>Want to share your thoughts?</h3>

                    <p>
                        Login or create an account to write a review.
                    </p>

                    <button onClick={() => navigate("/login")}>
                        Login to Review
                    </button>

                </section>
            )}

        </div>
    );
}

export default BookDetails;