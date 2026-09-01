import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        // Clear error for the field being edited
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});

        const newErrors = {};

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!form.email.includes("@")) {
            newErrors.email = "Enter a valid email";
        }

        // Password validation
        if (!form.password) {
            newErrors.password = "Password is required";
        }

        // If there are validation errors, show all of them
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", form);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            setErrors({
                server:
                    error.response?.data?.message ||
                    "Login failed"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>Book Review System</h1>
                <h2>Login</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    {errors.email && (
                        <p className="error">
                            {errors.email}
                        </p>
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    {errors.password && (
                        <p className="error">
                            {errors.password}
                        </p>
                    )}

                    {errors.server && (
                        <p className="error">
                            {errors.server}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/signup">
                        Create account
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;