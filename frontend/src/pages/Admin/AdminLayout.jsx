import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "../Admin/AdminSideBar";

const AdminLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AdminSidebar />
                <main className="flex-1">
                    {/* Sidebar Toggle Button - Mobile & Desktop */}
                    <div className="border-b p-4">
                        <SidebarTrigger />
                    </div>

                    {/* Page Content */}
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;