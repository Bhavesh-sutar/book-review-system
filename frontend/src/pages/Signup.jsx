import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        mobile: "",
        password: "",
        pincode: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");

        if (!form.username || !form.email || !form.mobile || !form.password || !form.pincode) {
            setError("All fields are required");
            return;
        }

        if (!/^\d{10}$/.test(form.mobile)) {
            setError("Mobile number must contain exactly 10 digits");
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
            setError("Enter valid email");
            return;
        }

        if (!/^\d{6}$/.test(form.pincode)) {
            setError("Pincode must contain 6 digits number");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/signup", form);

            setSuccess("Account created successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 800);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Signup failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Book Review System</h1>
                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        value={form.mobile}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <input
                        type="pincode"
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                    />

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Sign Up"}
                    </button>
                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;