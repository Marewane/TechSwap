import { useEffect, useState } from "react";
import axios from "axios";
import DashboardStats from "./DashboardStats";
import RevenueChart from "./RevenueChart";
import TransactionList from "../Transactions/TransactionPage";
import RecentTransactions from "./RecentTransactions";

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

    const { stats, monthlyRevenue, recentTransactions } = data;

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* ---------- STATS SECTION ---------- */}
            <DashboardStats stats={stats} />

            {/* ---------- REVENUE CHART ---------- */}
            {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <RevenueChart monthlyRevenue={monthlyRevenue} />
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    No revenue data available for the last 6 months
                </div>
            )}
            {/* ---------- TRANSACTIONS TABLE ---------- */}
            <div className="grid grid-cols-2">
                <RecentTransactions transactions={recentTransactions} />
            </div>
        </div>
    );
};

export default DashboardPage;