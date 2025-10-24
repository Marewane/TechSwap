import { Card, CardContent } from "@/components/ui/card";

const ProfileStats = ({ stats }) => {
    const statItems = [
        {
            icon: "📖",
            value: stats?.sessionsCompleted || 0,
            label: "Sessions Completed"
        },
        {
            icon: "💬", 
            value: stats?.matchingMade || 0,
            label: "Matches Made"
        },
        {
            icon: "⭐",
            value: stats?.averageRating?.toFixed(1) || "0.0",
            label: "Average Rating"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statItems.map((item, index) => (
                <Card key={index} className="text-center">
                    <CardContent className="p-6">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {item.value}
                        </div>
                        <div className="text-sm text-gray-600">{item.label}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ProfileStats;