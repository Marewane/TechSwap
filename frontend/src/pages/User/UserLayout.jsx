import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "@/pages/User/Navbar";

const UserLayout = () => {
    const { user, tokens } = useSelector((state) => state.user || {});

    // If not authenticated, redirect to login page
    if (!tokens || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 mt-16 p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
