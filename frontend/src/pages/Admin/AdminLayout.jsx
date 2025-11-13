import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "../Admin/AdminSideBar";

const AdminLayout = () => {
    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff]">
                <div aria-hidden="true" className="pointer-events-none">
                    <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-secondary/15 blur-[160px]" />
                    <div className="absolute right-[-15%] bottom-[-10%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-[200px]" />
                </div>
                <AdminSidebar />
                <SidebarInset className="relative z-10 flex w-full flex-col">
                    <motion.header
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="sticky top-0 z-40 border-b border-border/60 bg-white/70 px-6 py-4 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/80 shadow-[0_14px_35px_rgba(46,47,70,0.16)]" />
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
                                        Admin control center
                                    </p>
                                    <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                                        TechSwap Operations
                                    </h1>
                                </div>
                            </div>
                            <div className="hidden items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground md:flex">
                                <span className="rounded-full border border-border/60 bg-white/70 px-4 py-2">
                                    Live swaps · 47
                                </span>
                                <span className="rounded-full border border-border/60 bg-white/70 px-4 py-2">
                                    Coins in circulation · 1.2M
                                </span>
                            </div>
                        </div>
                    </motion.header>
                    <main className="relative flex-1">
                        <div className="mx-auto w-full max-w-[1440px] px-6 py-10">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;