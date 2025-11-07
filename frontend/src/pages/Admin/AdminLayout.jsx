import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import ProfileDropdown from "../User/Profile/components/ProfileDropdown";

const AdminLayout = () => {
    const { user, tokens } = useSelector((state) => state.user);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check authentication status
        setIsChecking(false);
    }, [user, tokens]);

    // Show loading state while checking
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user || !tokens) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    if (user.role !== "admin") {
        return <Navigate to="/home" replace />;
    }

    return (
        <SidebarProvider>
            <div className="grid min-h-screen w-full grid-cols-1">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0">
                        <div className="flex justify-between items-center border-b p-4">
                            <SidebarTrigger />
                            <ProfileDropdown />
                        </div>
                        <div>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;