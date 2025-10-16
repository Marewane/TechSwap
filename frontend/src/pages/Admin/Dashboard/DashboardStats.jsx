import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, FileWarning, DollarSign } from "lucide-react"

const DashboardStats = ({ stats }) => {
    const statsData = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-600 bg-blue-50",
        },
        {
            label: "Sessions",
            value: stats.totalSessions,
            icon: ClipboardList,
            color: "text-purple-600 bg-purple-50",
        },
        {
            label: "Reports",
            value: stats.totalReports,
            icon: FileWarning,
            color: "text-red-600 bg-red-50",
        },
        {
            label: "Revenue",
            value: `$${stats.totalRevenue}`,
            icon: DollarSign,
            color: "text-green-600 bg-green-50",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statsData.map((item, index) => (
                <Card
                    key={index}
                    className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-md text-muted-foreground font-medium">{item.label}</CardTitle>
                        <div className={`p-2.5 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center`}>
                            <item.icon className={`w-4 h-4 ${item.color.split(" ")[0]}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-4xl font-bold tracking-tight">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default DashboardStats
