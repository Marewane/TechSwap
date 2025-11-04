import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Flag,
    Video,
    ArrowLeftRight,
    Wallet,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

const AdminSidebar = () => {
    const location = useLocation();
    const { open } = useSidebar();

    const links = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Reports", path: "/admin/reports", icon: Flag },
        { name: "Sessions", path: "/admin/sessions", icon: Video },
        { name: "Transactions", path: "/admin/transactions", icon: Wallet },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="px-2 py-4 flex items-center gap-2">
                    {open ? (
                        <Link to={"/home"} className="text-2xl font-bold tracking-wide text-primary">
                            TechSwap
                        </Link>
                    ) : (
                        <ArrowLeftRight className="w-6 h-6 text-primary" />
                    )}
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
                                            <Link to={link.path} className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
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
