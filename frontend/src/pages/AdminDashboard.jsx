import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const [error, setError] = useState("");

    const [editingBook, setEditingBook] = useState(null);
    const [bookForm, setBookForm] = useState({
        title: "",
        author: "",
        genre: ""
    });

    // =========================
    // LOAD USERS
    // =========================

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);

            const response = await api.get("/admin/users");

            setUsers(response.data.users);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    // =========================
    // LOAD BOOKS
    // =========================

    const loadBooks = async () => {
        try {
            setLoadingBooks(true);

            const response = await api.get("/books?limit=100");

            setBooks(response.data.books);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load books"
            );
        } finally {
            setLoadingBooks(false);
        }
    };

    // =========================
    // LOAD REVIEWS
    // =========================

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);

            const response = await api.get("/admin/reviews");

            setReviews(response.data.reviews);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load reviews"
            );
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadBooks();
        loadReviews();
    }, []);

    // =========================
    // DELETE USER
    // =========================

    const deleteUser = async (userId) => {
        if (!window.confirm(
            "Delete this user? Their books and reviews will also be deleted."
        )) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);

            setUsers((prevUsers) =>
                prevUsers.filter(
                    (user) => user._id !== userId
                )
            );

            await loadBooks();
            await loadReviews();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };

    // =========================
    // EDIT BOOK
    // =========================

    const startEditingBook = (book) => {
        setEditingBook(book);

        setBookForm({
            title: book.title,
            author: book.author,
            genre: book.genre
        });
    };

    const cancelEditingBook = () => {
        setEditingBook(null);

        setBookForm({
            title: "",
            author: "",
            genre: ""
        });
    };

    const handleBookChange = (e) => {
        setBookForm({
            ...bookForm,
            [e.target.name]: e.target.value
        });
    };

    const updateBook = async (e) => {
        e.preventDefault();

        if (
            !bookForm.title.trim() ||
            !bookForm.author.trim() ||
            !bookForm.genre.trim()
        ) {
            alert("Title, author, and genre are required");
            return;
        }

        try {
            const response = await api.put(
                `/books/${editingBook._id}`,
                bookForm
            );

            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book._id === editingBook._id
                        ? response.data.book
                        : book
                )
            );

            cancelEditingBook();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update book"
            );
        }
    };

    // =========================
    // DELETE BOOK
    // =========================

    const deleteBook = async (bookId) => {
        if (!window.confirm(
            "Delete this book? Its reviews will remain unless handled separately."
        )) {
            return;
        }

        try {
            await api.delete(`/books/${bookId}`);

            setBooks((prevBooks) =>
                prevBooks.filter(
                    (book) => book._id !== bookId
                )
            );

            // Refresh reviews because reviews belong to this book
            await loadReviews();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete book"
            );
        }
    };

    // =========================
    // DELETE REVIEW
    // =========================

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Delete this review?")) {
            return;
        }

        try {
            await api.delete(`/admin/reviews/${reviewId}`);

            setReviews((prevReviews) =>
                prevReviews.filter(
                    (review) => review._id !== reviewId
                )
            );

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete review"
            );
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="admin-dashboard">

            {/* =========================
                NAVBAR
            ========================= */}

            <header className="navbar">

                <div>
                    <h1>🛠️ Admin Panel</h1>
                    <p>Manage users, books and reviews</p>
                </div>

                <div className="navbar-actions">

                    <button
                        onClick={() => navigate("/dashboard")}
                    >
                        View Books
                    </button>

                    <button onClick={() => navigate("/add-book")}>
                        + Add Book
                    </button>

                    <button onClick={logout}>
                        Logout
                    </button>

                </div>

            </header>

            <main className="admin-content">

                {error && (
                    <p className="error">{error}</p>
                )}

                {/* =========================
                    USERS
                ========================= */}

                <section className="admin-section">

                    <h2>
                        Users ({users.length})
                    </h2>

                    {loadingUsers ? (
                        <p className="status">
                            Loading users...
                        </p>
                    ) : users.length === 0 ? (
                        <p className="status">
                            No users found.
                        </p>
                    ) : (
                        <div className="admin-table-container">

                            <table className="admin-table">

                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {users.map((user) => (
                                        <tr key={user._id}>

                                            <td>
                                                {user.username}
                                            </td>

                                            <td>
                                                {user.email}
                                            </td>

                                            <td>
                                                {user.mobile}
                                            </td>

                                            <td>
                                                {user.role}
                                            </td>

                                            <td>

                                                {user.role !== "admin" ? (
                                                    <button
                                                        onClick={() =>
                                                            deleteUser(
                                                                user._id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                ) : (
                                                    <span>
                                                        Protected
                                                    </span>
                                                )}

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>


                {/* =========================
                    BOOKS
                ========================= */}

                <section className="admin-section">

                    <h2>
                        Books ({books.length})
                    </h2>

                    {loadingBooks ? (
                        <p className="status">
                            Loading books...
                        </p>
                    ) : books.length === 0 ? (
                        <p className="status">
                            No books found.
                        </p>
                    ) : (
                        <div className="admin-table-container">

                            <table className="admin-table">

                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Genre</th>
                                        <th>Rating</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {books.map((book) => (
                                        <tr key={book._id}>

                                            <td>
                                                {book.title}
                                            </td>

                                            <td>
                                                {book.author}
                                            </td>

                                            <td>
                                                {book.genre}
                                            </td>

                                            <td>
                                                ⭐ {book.averageRating}
                                            </td>

                                            <td>

                                                <button
                                                    onClick={() =>
                                                        startEditingBook(book)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteBook(book._id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>


                {/* =========================
                    EDIT BOOK FORM
                ========================= */}

                {editingBook && (

                    <section className="admin-section">

                        <h2>Edit Book</h2>

                        <form onSubmit={updateBook}>

                            <input
                                type="text"
                                name="title"
                                placeholder="Book title"
                                value={bookForm.title}
                                onChange={handleBookChange}
                            />

                            <input
                                type="text"
                                name="author"
                                placeholder="Author"
                                value={bookForm.author}
                                onChange={handleBookChange}
                            />

                            <input
                                type="text"
                                name="genre"
                                placeholder="Genre"
                                value={bookForm.genre}
                                onChange={handleBookChange}
                            />

                            <button type="submit">
                                Update Book
                            </button>

                            <button
                                type="button"
                                onClick={cancelEditingBook}
                            >
                                Cancel
                            </button>

                        </form>

                    </section>

                )}


                {/* =========================
                    REVIEWS
                ========================= */}

                <section className="admin-section">

                    <h2>
                        Reviews ({reviews.length})
                    </h2>

                    {loadingReviews ? (
                        <p className="status">
                            Loading reviews...
                        </p>
                    ) : reviews.length === 0 ? (
                        <p className="status">
                            No reviews found.
                        </p>
                    ) : (
                        <div className="admin-table-container">

                            <table className="admin-table">

                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Book</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {reviews.map((review) => (
                                        <tr key={review._id}>

                                            <td>
                                                {review.user?.username}
                                            </td>

                                            <td>
                                                {review.book?.title}
                                            </td>

                                            <td>
                                                ⭐ {review.rating}/5
                                            </td>

                                            <td>
                                                {review.comment}
                                            </td>

                                            <td>

                                                <button
                                                    onClick={() =>
                                                        deleteReview(
                                                            review._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;