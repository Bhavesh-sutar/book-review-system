import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000"
});

//Public request which do not need authentication token
const publicRoutes = [
    "/auth/login",
    "/auth/signup",
    "/books",
    "/books/search"
];

api.interceptors.request.use((config) => {
    const isPublicRoute = publicRoutes.some(
        (route) => config.url === route
    );

    //If not public route then add the token to the request headers else no token is needed for public routes
    if (!isPublicRoute) {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;