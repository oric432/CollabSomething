export interface User {
    id: string;
    email: string;
    name: string;
    role: "TEACHER" | "STUDENT";
    createdAt: string;
    updatedAt: string;
    tokenVersion: number;
}
export interface Session {
    id: string;
    title: string;
    description?: string;
    status: "ACTIVE" | "COMPLETED";
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
        id: string;
        userId: string;
        student: {
            id: string;
            name: string;
            email: string;
            role: "STUDENT";
        };
    }[];
    sessions?: Session[];
}
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
    role?: "TEACHER" | "STUDENT";
}

export interface AuthResponse {
    user: User;
    token: string;
}
