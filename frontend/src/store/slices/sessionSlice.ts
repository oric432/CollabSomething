import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Session {
    id: string;
    title: string;
    description?: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    currentState?: string;
    thumbnail?: string;
    classId: string;
    class: {
        id: string;
        name: string;
        teacherId: string;
        teacher: {
            id: string;
            name: string;
            email: string;
        };
    };
}

interface SessionState {
    sessions: Session[];
    activeSessions: Session[];
    currentSession: Session | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SessionState = {
    sessions: [],
    activeSessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
};

// Get all active sessions
export const getAllSessions = createAsyncThunk("session/all", async () => {
    const response = await axios.get("/sessions/all");
    return response.data;
});

// Get all sessions for a class
export const getClassSessions = createAsyncThunk(
    "session/getClassSessions",
    async (classId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `/sessions/class/${classId}/sessions`
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Create a new session
export const createSession = createAsyncThunk(
    "session/create",
    async (
        sessionData: {
            title: string;
            description?: string;
            classId: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/sessions/session", sessionData);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Get session details
export const getSession = createAsyncThunk(
    "session/getSession",
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/sessions/session/${sessionId}`);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// End session
export const endSession = createAsyncThunk(
    "session/endSession",
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `/sessions/session/${sessionId}/end`
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        clearCurrentSession: (state) => {
            state.currentSession = null;
        },
        updateSessionState: (state, action) => {
            if (state.currentSession) {
                state.currentSession.currentState = action.payload.currentState;
                state.currentSession.thumbnail = action.payload.thumbnail;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Active Sessions
            .addCase(getAllSessions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeSessions = action.payload;
            })
            .addCase(getAllSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.error.message || "Failed to fetch active sessions";
            })
            // Get Class Sessions
            .addCase(getClassSessions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getClassSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sessions = action.payload;
            })
            .addCase(getClassSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.error.message || "Failed to fetch class sessions";
            })
            // Create Session
            .addCase(createSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sessions.unshift(action.payload);
                state.activeSessions.unshift(action.payload);
                state.currentSession = action.payload;
            })
            .addCase(createSession.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.error.message || "Failed to create session";
            })
            // Get Session
            .addCase(getSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentSession = action.payload;
            })
            .addCase(getSession.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Failed to fetch session";
            })
            // End Session
            .addCase(endSession.fulfilled, (state, action) => {
                state.sessions = state.sessions.map((session) =>
                    session.id === action.payload.id ? action.payload : session
                );
                state.activeSessions = state.activeSessions.filter(
                    (session) => session.id !== action.payload.id
                );
                if (state.currentSession?.id === action.payload.id) {
                    state.currentSession = action.payload;
                }
            });
    },
});

export const { clearCurrentSession, updateSessionState } = sessionSlice.actions;
export default sessionSlice.reducer;
