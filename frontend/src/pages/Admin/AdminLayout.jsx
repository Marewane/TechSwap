import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
    return (
        <SidebarProvider>
            <div className="grid min-h-screen w-full grid-cols-1">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0">
                        <div className="border-b p-4">
                            <SidebarTrigger />
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