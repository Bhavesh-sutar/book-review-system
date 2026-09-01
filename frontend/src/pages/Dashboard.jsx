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

    // CHANGED: loadBooks now accepts authorValue and pageValue as explicit
    // parameters too (previously only searchValue was a parameter, and
    // author/page were read from state). This avoids stale-closure bugs
    // any time we need to fetch with values that haven't finished
    // re-rendering into state yet (e.g. right after clearFilters or
    // handleSearch call setX and then immediately call loadBooks).
    const loadBooks = async (
        searchValue = search,
        authorValue = author,
        genreValue = genre,
        pageValue = page
    ) => {
        try {
            setLoading(true);
            setError("");

            let response;

            if (searchValue.trim()) {
                response = await api.get(
                    `/books/search?q=${encodeURIComponent(searchValue)}`
                );

                setBooks(response.data.books);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalBooks: response.data.books.length
                });
            } else {
                const params = new URLSearchParams({
                    page: pageValue, // CHANGED: use pageValue param instead of state `page`
                    limit: 6
                });

                if (authorValue) params.append("author", authorValue); // CHANGED: authorValue param
                if (genreValue) params.append("genre", genreValue);   // CHANGED: genreValue param

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

    // UNCHANGED: still handles page/author/genre changes (typing in the
    // author/genre filter inputs, or clicking Previous/Next).
    useEffect(() => {
        loadBooks();
    }, [page, author, genre]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        // CHANGED: pass the values being submitted explicitly instead of
        // relying on loadBooks() reading `search`/`page` from state
        // (state wouldn't have updated yet at this point in the function).
        loadBooks(search, author, genre, 1);
    };

    const clearFilters = () => {
        setSearch("");
        setAuthor("");
        setGenre("");
        setPage(1);
        // CHANGED (the actual bug fix): explicitly reload with the reset
        // values right here, instead of waiting on the useEffect. This is
        // necessary because if author/genre/page were already at their
        // "empty"/default values, setting them again produces no change
        // in the useEffect's dependency array, so the effect never
        // re-fires and the old search results stayed on screen until a
        // second Clear click coincidentally caused a re-fetch.
        loadBooks("", "", "", 1);
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