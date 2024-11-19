export interface ApiError {
    error: string;
    details?: {
        errors?: Array<{
            code: string;
            message: string;
            path: string[];
        }>;
    };
}
