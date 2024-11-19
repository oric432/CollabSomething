import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "TEACHER" | "STUDENT";
}

export interface Class {
    id: string;
    name: string;
    description?: string;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
    teacherId: string;
    teacher: {
        id: string;
        name: string;
        email: string;
    };
    students: {
        student: User;
    }[];
    sessions: {
        id: string;
        title: string;
        description?: string;
        startedAt: string;
        status: string;
    }[];
}

interface ClassState {
    classes: Class[];
    currentClass: Class | null;
    enrolledStudents: User[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ClassState = {
    classes: [],
    currentClass: null,
    enrolledStudents: [],
    isLoading: false,
    error: null,
};

// Get all classes
export const getAllClasses = createAsyncThunk(
    "class/all",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/classes/all");
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Create a new class
export const createClass = createAsyncThunk(
    "class/create",
    async (
        classData: { name: string; description?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post("/classes/class", classData);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Get a specific class
export const getClass = createAsyncThunk(
    "class/getClass",
    async (classId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/classes/class/${classId}`);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Delete a class
export const deleteClass = createAsyncThunk(
    "class/deleteClass",
    async (classId: string, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/classes/class/${classId}`);
            return { classId, ...response.data };
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            throw err;
        }
    }
);

// Enroll a student
export const enrollStudent = createAsyncThunk(
    "class/enrollStudent",
    async (
        { classId, studentId }: { classId: string; studentId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(
                `/classes/class/${classId}/enroll`,
                {
                    studentId,
                }
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

const classSlice = createSlice({
    name: "class",
    initialState,
    reducers: {
        clearClassError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all classes
            .addCase(getAllClasses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllClasses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classes = action.payload;
                state.error = null;
            })
            .addCase(getAllClasses.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to fetch classes";
            })
            // Create class
            .addCase(createClass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classes.unshift(action.payload); // Add to beginning of array
                state.error = null;
            })
            .addCase(createClass.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to create class";
            })
            // Get class
            .addCase(getClass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentClass = action.payload;
                state.error = null;
            })
            .addCase(getClass.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to fetch class";
            })
            // Delete class
            .addCase(deleteClass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classes = state.classes.filter(
                    (c) => c.id !== action.payload.classId
                );
                if (state.currentClass?.id === action.payload.classId) {
                    state.currentClass = null;
                }
                state.error = null;
            })
            .addCase(deleteClass.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to delete class";
            })
            // Enroll student
            .addCase(enrollStudent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(enrollStudent.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.currentClass) {
                    state.currentClass.students.push({
                        student: action.payload.student,
                    });
                }
                state.error = null;
            })
            .addCase(enrollStudent.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as { error: string })?.error ||
                    "Failed to enroll student";
            });
    },
});

export const { clearClassError } = classSlice.actions;
export default classSlice.reducer;
