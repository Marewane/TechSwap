import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";

const TopUsers = ({ topUsers }) => {
    // Format currency
    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Get rank badge color
    const getRankColor = (index) => {
        switch(index) {
            case 0: return "bg-yellow-100 text-yellow-800 border-yellow-300"; // Gold
            case 1: return "bg-gray-200 text-gray-700 border-gray-400"; // Silver
            case 2: return "bg-orange-100 text-orange-700 border-orange-300"; // Bronze
            default: return "bg-blue-100 text-blue-700 border-blue-300";
        }
    };

    // Get rank icon
    const getRankIcon = (index) => {
        if (index === 0) {
            return <Trophy className="h-4 w-4 text-yellow-600" />;
        }
        return <span className="font-bold">#{index + 1}</span>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <CardTitle>Top Users</CardTitle>
                    </div>
                    <Badge variant="secondary">By Revenue</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {topUsers && topUsers.length > 0 ? (
                        topUsers.map((user, index) => (
                            <div 
                                key={user._id} 
                                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors border"
                            >
                                {/* Rank Badge */}
                                <div className={`flex items-center justify-center size-10 rounded-full border-2 ${getRankColor(index)}`}>
                                    {getRankIcon(index)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {user.name || "Unknown User"}
                                        </p>
                                        {index === 0 && (
                                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                Top Performer
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.email || "No email"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {user.transactionCount} transaction{user.transactionCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-green-600 font-bold">
                                        <DollarSign className="h-4 w-4" />
                                        {formatCurrency(user.totalRevenue)}
                                    </div>
                                    <p className="text-xs text-gray-500">revenue</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No top users data available</p>
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {topUsers && topUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total from top 5</span>
                            <span className="font-bold text-gray-900">
                                {formatCurrency(
                                    topUsers.reduce((sum, user) => sum + user.totalRevenue, 0)
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopUsers;