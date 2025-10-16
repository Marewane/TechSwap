import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdFlag, MdVideoCall, MdSwapHoriz } from "react-icons/md";

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
        { name: "Dashboard", path: "/admin/dashboard", icon: MdDashboard },
        { name: "Users", path: "/admin/users", icon: MdPeople },
        { name: "Reports", path: "/admin/reports", icon: MdFlag },
        { name: "Sessions", path: "/admin/sessions", icon: MdVideoCall },
    ];


    return (
        <Sidebar collapsible="icon" >
            <SidebarHeader>
                <div className="px-2 py-4">
                    {open ? (
                        <h1 className="text-2xl font-bold">TechSwap</h1>
                    ) : (
                        <MdSwapHoriz />
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