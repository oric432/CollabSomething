import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
    id: string;
    email: string;
    name: string;
    role: "TEACHER" | "STUDENT";
    createdAt: string;
    updatedAt: string;
    tokenVersion: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    isLoading: !!localStorage.getItem("token"), // Set initial loading state if token exists
    error: null,
};

// Set up axios defaults
axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

// Add token to requests if it exists
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = createAsyncThunk(
    "auth/login",
    async (
        credentials: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/users/login", credentials);
            const { token, user } = response.data;
            localStorage.setItem("token", token);
            return { token, user };
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (
        userData: {
            email: string;
            password: string;
            name: string;
            role: "TEACHER" | "STUDENT";
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/users/register", userData);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

export const getProfile = createAsyncThunk(
    "auth/getProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/users/profile");
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post("/users/logout");
            localStorage.removeItem("token");
            return null;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Login failed";
                state.isAuthenticated = false;
            })
            // Register cases
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Registration failed";
            })
            // Get Profile cases
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to get profile";
                state.isAuthenticated = false;
            })
            // Logout cases
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
