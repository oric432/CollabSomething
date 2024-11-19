import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AuthProvider } from "@/providers/authProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRoutes } from "@/routes";

export function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                    <ToastContainer />
                </AuthProvider>
            </BrowserRouter>
        </Provider>
    );
}
