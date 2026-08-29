import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalBooks: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const isLoggedIn = !!token;
    const isAdmin = currentUser?.role === "admin";

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError("");

            let response;

            if (search.trim()) {
                response = await api.get(
                    `/books/search?q=${encodeURIComponent(search)}`
                );

                setBooks(response.data.books);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalBooks: response.data.books.length
                });
            } else {
                const params = new URLSearchParams({
                    page,
                    limit: 6
                });

                if (author) params.append("author", author);
                if (genre) params.append("genre", genre);

                response = await api.get(`/books?${params.toString()}`);

                setBooks(response.data.books);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load books"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooks();
    }, [page, author, genre]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadBooks();
    };

    const clearFilters = () => {
        setSearch("");
        setAuthor("");
        setGenre("");
        setPage(1);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="dashboard">

            <header className="navbar">

                <div>
                    <h1>📚 Book Review System</h1>
                    <p>Discover, review and share great books.</p>
                </div>

                <div className="navbar-actions">

                    {!isLoggedIn && (
                        <>
                            <button onClick={() => navigate("/login")}>
                                Login
                            </button>

                            <button onClick={() => navigate("/signup")}>
                                Sign Up
                            </button>
                        </>
                    )}

                    {isLoggedIn && !isAdmin && (
                        <button onClick={() => navigate("/add-book")}>
                            + Add Book
                        </button>
                    )}

                    {isAdmin && (
                        <button onClick={() => navigate("/admin")}>
                            Admin Panel
                        </button>
                    )}

                    {isLoggedIn && (
                        <button onClick={logout}>
                            Logout
                        </button>
                    )}

                </div>

            </header>

            <main className="dashboard-content">

                <section className="hero-section">
                    <h2>Find Your Next Great Read</h2>
                    <p>
                        Explore books, discover new authors and read what
                        other readers think.
                    </p>
                </section>

                <section className="search-section">

                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <button type="submit">
                            🔍 Search
                        </button>
                    </form>

                    <div className="filters">

                        <input
                            type="text"
                            placeholder="Filter by author"
                            value={author}
                            onChange={(e) => {
                                setAuthor(e.target.value);
                                setPage(1);
                            }}
                        />

                        <input
                            type="text"
                            placeholder="Filter by genre"
                            value={genre}
                            onChange={(e) => {
                                setGenre(e.target.value);
                                setPage(1);
                            }}
                        />

                        <button onClick={clearFilters}>
                            Clear
                        </button>

                    </div>

                </section>

                {loading && (
                    <p className="status">Loading books...</p>
                )}

                {error && (
                    <p className="error">{error}</p>
                )}

                {!loading && !error && books.length === 0 && (
                    <p className="status">
                        No books found.
                    </p>
                )}

                <div className="book-grid">

                    {books.map((book) => (
                        <div
                            className="book-card"
                            key={book._id}
                        >
                            <div
                                onClick={() =>
                                    navigate(`/books/${book._id}`)
                                }
                            >
                                <span className="book-genre">
                                    {book.genre}
                                </span>

                                <h2>{book.title}</h2>

                                <p>
                                    <strong>Author:</strong>{" "}
                                    {book.author}
                                </p>

                                <p className="rating">
                                    ⭐ {book.averageRating || 0}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(`/books/${book._id}`)
                                }
                            >
                                View Details
                            </button>
                        </div>
                    ))}

                </div>

                {!search && pagination.totalPages > 1 && (
                    <div className="pagination">

                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Previous
                        </button>

                        <span>
                            Page {pagination.currentPage} of{" "}
                            {pagination.totalPages}
                        </span>

                        <button
                            disabled={
                                page === pagination.totalPages
                            }
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </button>

                    </div>
                )}

            </main>

        </div>
    );
}

export default Dashboard;