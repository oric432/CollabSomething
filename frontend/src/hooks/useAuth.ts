import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { login, logout, register, getProfile } from "@/store/slices/authSlice";
import { useCallback } from "react";

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const getProfileCallback = useCallback(() => {
        return dispatch(getProfile());
    }, [dispatch]);

    return {
        ...auth,
        login: (credentials: { email: string; password: string }) =>
            dispatch(login(credentials)),
        register: (credentials: {
            email: string;
            password: string;
            name: string;
            role: "TEACHER" | "STUDENT";
        }) => dispatch(register(credentials)),
        logout: () => dispatch(logout()),
        getProfile: getProfileCallback,
        isTeacher: auth.user?.role === "TEACHER",
        isStudent: auth.user?.role === "STUDENT",
    };
};
