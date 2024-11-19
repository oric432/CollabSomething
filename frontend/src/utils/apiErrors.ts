import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error) && error.response) {
        // Get the error message from the backend response
        return error.response.data.error || "An error occurred";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred";
}
