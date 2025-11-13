import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileWarning, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardStats = ({ stats }) => {
    const statsData = [
        {
            label: "Total members",
            value: stats?.totalUsers ?? 0,
            icon: Users,
            accent: "from-secondary/20 to-[#6d7aff33]",
            link: "/admin/users",
        },
        {
            label: "Active swap sessions",
            value: stats?.totalSessions ?? 0,
            icon: ClipboardList,
            accent: "from-accent/20 to-[#38f9d733]",
            link: "/admin/sessions",
        },
        {
            label: "Open reports",
            value: stats?.totalReports ?? 0,
            icon: FileWarning,
            accent: "from-[#ffb4b4]/30 to-[#f87171]/20",
            link: "/admin/reports",
        },
        {
            label: "Lifetime revenue",
            value: stats?.totalRevenue ? `$${stats.totalRevenue}` : "$0",
            icon: DollarSign,
            accent: "from-[#ffe7c2]/40 to-[#ffb86b]/30",
            link: "/admin/transactions",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statsData.map((item) => (
                <Link to={item.link} key={item.label} className="no-underline focus-visible:outline-none">
                    <Card className="relative overflow-hidden border border-border/50 bg-card/95 p-0 shadow-[0_28px_90px_rgba(46,47,70,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_34px_110px_rgba(46,47,70,0.24)] focus-visible:ring-2 focus-visible:ring-ring/40">
                        <div className={`absolute inset-0 opacity-90 bg-gradient-to-br ${item.accent}`} />
                        <div className="relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                                <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70">
                                    {item.label}
                                </CardTitle>
                                <div className="rounded-full border border-border/40 bg-white/80 p-3 shadow-[0_16px_45px_rgba(46,47,70,0.16)]">
                                    <item.icon className="size-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-3xl font-semibold text-foreground md:text-4xl">{item.value}</p>
                            </CardContent>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default DashboardStats;