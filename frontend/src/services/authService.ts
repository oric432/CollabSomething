import axios from "axios";
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
} from "@/types/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post("/users/login", credentials);
        return response.data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.post("/users/register", credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post("/users/logout");
        localStorage.removeItem("token");
    },

    async getProfile(): Promise<AuthResponse["user"]> {
        try {
            const response = await api.get("/users/profile");
            return response.data;
        } catch (error) {
            localStorage.removeItem("token");
            throw error;
        }
    },

    async updateProfile(
        data: Partial<AuthResponse["user"]>
    ): Promise<AuthResponse["user"]> {
        const response = await api.put("/users/profile", data);
        return response.data;
    },

    // Helper method to check if user has specific role
    hasRole(user: AuthResponse["user"] | null, role: string): boolean {
        return user?.role === role;
    },

    // Helper method to check if token exists
    isAuthenticated(): boolean {
        return !!localStorage.getItem("token");
    },
};
