import { useEffect, useState } from "react";
import axios from "axios";
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-2">Failed to load dashboard</p>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-500">No data available</p>
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

    const { stats, monthlyRevenue, recentTransactions, reportsPerMonth, userGrowth ,  } = data;

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* ---------- STATS SECTION ---------- */}
            <DashboardStats stats={stats} />

            {/* ---------- REVENUE CHART ---------- */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    {monthlyRevenue && monthlyRevenue.length > 0 ? (
                        <RevenueChart monthlyRevenue={monthlyRevenue} />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            No revenue data available for the last 6 months
                        </div>
                    )}
                </div>
                <TopUsers topUsers={topUsers} />
            </div>
            {/* ---------- TRANSACTIONS TABLE ---------- */}
            <div className="grid grid-cols-2 gap-4">
                <RecentTransactions transactions={recentTransactions} />
                <ReportsChart reportsPerMonth={reportsPerMonth} />
            </div>
        </div>
    );
};

export default DashboardPage;