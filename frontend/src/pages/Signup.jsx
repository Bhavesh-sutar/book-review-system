import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        mobile: "",
        password: "",
        pin: ""
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
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
        setSuccess("");

        const newErrors = {};

        // Username validation
        if (!form.username.trim()) {
            newErrors.username = "Username is required";
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                form.email
            )
        ) {
            newErrors.email = "Enter a valid email";
        }

        // Mobile validation
        if (!form.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(form.mobile)) {
            newErrors.mobile =
                "Mobile number must contain exactly 10 digits";
        }

        // Password validation
        if (!form.password) {
            newErrors.password = "Password is required";
        }

        // PIN validation
        if (!form.pin.trim()) {
            newErrors.pin = "PIN is required";
        } else if (!/^\d{6}$/.test(form.pin)) {
            newErrors.pin = "PIN must contain exactly 6 digits";
        }

        // Show all validation errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
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
            setErrors({
                server:
                    error.response?.data?.message ||
                    "Signup failed"
            });
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
                        maxLength="20"
                        value={form.username}
                        onChange={handleChange}
                    />

                    {errors.username && (
                        <p className="error">
                            {errors.username}
                        </p>
                    )}

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
                        type="text"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        value={form.mobile}
                        onChange={handleChange}
                    />

                    {errors.mobile && (
                        <p className="error">
                            {errors.mobile}
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

                    <input
                        type="text"
                        name="pin"
                        placeholder="Pin"
                        maxLength="6"
                        inputMode="numeric"
                        value={form.pin}
                        onChange={handleChange}
                    />

                    {errors.pin && (
                        <p className="error">
                            {errors.pin}
                        </p>
                    )}

                    {errors.server && (
                        <p className="error">
                            {errors.server}
                        </p>
                    )}

                    {success && (
                        <p className="success">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
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