import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import DashboardStats from "./components/DashboardStats";
import RevenueChart from "./components/RevenueChart";
import RecentTransactions from "./components/RecentTransactions";
import ReportsChart from "./components/ReportsChart";
import TopUsers from "./components/TopUser";

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get("http://localhost:5000/admin/dashboard");
                setData(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
                setError(err.response?.data?.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="max-w-md border border-border/50 bg-card/95 p-0 shadow-[0_32px_110px_rgba(46,47,70,0.22)]">
                    <CardContent className="flex flex-col items-center gap-4 p-10">
                        <div className="size-12 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading dashboard insights…</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="max-w-lg border border-destructive/40 bg-destructive/10 p-0 shadow-[0_30px_90px_rgba(248,113,113,0.18)]">
                    <CardContent className="p-10 text-center">
                        <p className="text-lg font-semibold text-destructive">Failed to load dashboard</p>
                        <p className="mt-2 text-sm text-destructive/80">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="max-w-lg border border-border/50 bg-card/95 p-0 shadow-[0_30px_90px_rgba(46,47,70,0.18)]">
                    <CardContent className="p-10 text-center">
                        <p className="text-lg font-semibold text-foreground">No data available</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            We couldn’t retrieve analytics at this time. Please try again shortly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const topUsers = [
        {
            _id: "user001",
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            avatar: "https://i.pravatar.cc/150?img=1",
            totalRevenue: 1250.75,
            transactionCount: 28
        },
        {
            _id: "user002",
            name: "Michael Chen",
            email: "mike.chen@example.com",
            avatar: "https://i.pravatar.cc/150?img=12",
            totalRevenue: 980.50,
            transactionCount: 22
        },
        {
            _id: "user003",
            name: "Emma Wilson",
            email: "emma.w@example.com",
            avatar: "https://i.pravatar.cc/150?img=5",
            totalRevenue: 875.25,
            transactionCount: 19
        },
        {
            _id: "user004",
            name: "David Rodriguez",
            email: "david.r@example.com",
            avatar: "https://i.pravatar.cc/150?img=8",
            totalRevenue: 720.00,
            transactionCount: 15
        },
        {
            _id: "user005",
            name: "Jennifer Lee",
            email: "jennifer.l@example.com",
            avatar: "https://i.pravatar.cc/150?img=9",
            totalRevenue: 645.50,
            transactionCount: 12
        }
    ]

    const { stats, monthlyRevenue, recentTransactions, reportsPerMonth, userGrowth } = data;

    return (
        <div className="space-y-10">
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-[var(--radius)] border border-border/60 bg-white/80 px-6 py-6 shadow-[0_32px_110px_rgba(46,47,70,0.18)] backdrop-blur-xl"
            >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                            Enterprise analytics overview
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-foreground">
                            Performance pulse · TechSwap admin suite
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-foreground/70">
                            Monitor swaps, revenue, and trust signals in real time. Every data point reflects coin-backed sessions happening right now.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/70 px-4 py-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                            Active users growth · {userGrowth?.percentageChange ?? "—"}%
                        </div>
                        <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-secondary/15 px-4 py-3 text-xs font-semibold text-secondary">
                            Coins transacted (30d) · {stats?.coinsTransacted ?? "—"}
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-8"
            >
                <DashboardStats stats={stats} />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
                    <Card className="h-full border border-border/60 bg-card/95 p-0 shadow-[0_30px_100px_rgba(46,47,70,0.18)]">
                        <CardContent className="p-8">
                            {monthlyRevenue && monthlyRevenue.length > 0 ? (
                                <RevenueChart monthlyRevenue={monthlyRevenue} />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                    <p className="text-sm font-semibold text-foreground/80">
                                        No revenue data available for the last 6 months
                                    </p>
                                    <p className="max-w-md text-xs text-muted-foreground">
                                        Once members begin purchasing coin bundles, the revenue curve will light up automatically.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <TopUsers topUsers={topUsers} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <RecentTransactions transactions={recentTransactions} />
                    <ReportsChart reportsPerMonth={reportsPerMonth} />
                </div>
            </motion.section>
        </div>
    );
};

export default DashboardPage;