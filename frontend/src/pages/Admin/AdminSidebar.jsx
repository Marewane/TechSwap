import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdFlag, MdVideoCall, MdLogout } from "react-icons/md";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const AdminSidebar = () => {
    const location = useLocation();

    const links = [
        { name: "Dashboard", path: "/admin/dashboard", icon: MdDashboard },
        { name: "Users", path: "/admin/users", icon: MdPeople },
        { name: "Reports", path: "/admin/reports", icon: MdFlag },
        { name: "Sessions", path: "/admin/sessions", icon: MdVideoCall },
    ];


    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                    <h1 className="text-2xl font-bold">TechSwap Admin</h1>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;

                                return (
                                    <SidebarMenuItem key={link.name}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link to={link.path}>
                                                <Icon className="text-lg" />
                                                <span>{link.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AdminSidebar;