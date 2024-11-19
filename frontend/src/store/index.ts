import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import classReducer from "./slices/classSlice";
import sessionReducer from "./slices/sessionSlice";
export const store = configureStore({
    reducer: {
        auth: authReducer,
        class: classReducer,
        session: sessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
