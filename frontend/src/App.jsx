import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                   element={<Dashboard />}
                />
                <Route
                    path="/add-book"
                    element={<AddBook />}
                />
                <Route
                    path="/books/:id"
                    element={<BookDetails />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;