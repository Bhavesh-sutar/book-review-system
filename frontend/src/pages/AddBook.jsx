import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddBook() {
    const [form, setForm] = useState({
        title: "",
        author: "",
        genre: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.title || !form.author || !form.genre) {
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            await api.post("/books", form);

            navigate("/dashboard");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to create book"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>Add New Book</h1>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="title"
                        placeholder="Book title"
                        value={form.title}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="author"
                        placeholder="Author"
                        value={form.author}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="genre"
                        placeholder="Genre"
                        value={form.genre}
                        onChange={handleChange}
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Book"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                    >
                        Cancel
                    </button>

                </form>

            </div>
        </div>
    );
}

export default AddBook;