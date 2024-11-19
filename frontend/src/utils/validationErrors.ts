import { z } from "zod";

export function getValidationErrors(error: z.ZodError) {
    return error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));
}

export const loginValidationMessages = {
    email: {
        required: "Email is required",
        invalid: "Please enter a valid email address",
    },
    password: {
        required: "Password is required",
        tooShort: "Password must be at least 6 characters",
    },
};

export const registerValidationMessages = {
    ...loginValidationMessages,
    name: {
        required: "Name is required",
        tooShort: "Name must be at least 2 characters",
    },
    role: {
        required: "Please select a role",
        invalid: "Invalid role selected",
    },
};
