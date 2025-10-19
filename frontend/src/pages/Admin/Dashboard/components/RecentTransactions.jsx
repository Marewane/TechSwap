import { Card, CardContent, CardHeader, CardTitle ,CardDescription} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentTransactions = ({ transactions }) => {
    const navigate = useNavigate();

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            Latest transactions on the platform.
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/transactions')}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {transactions && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div
                                key={transaction._id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                            >
                                {/* Left side - Icon and Info */}
                                <div className="flex items-center gap-3 flex-1">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-full ${transaction.type === 'credit'
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                        }`}>
                                        {transaction.type === 'credit' ? (
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>

                                    {/* Transaction Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">
                                            {transaction.description || "Transaction"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span>{formatDate(transaction.createdAt)}</span>
                                            {transaction.fromUserId?.name && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">
                                                        {transaction.fromUserId.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Amount */}
                                <div className="text-right ml-4">
                                    <p className={`font-semibold text-sm ${transaction.type === 'credit'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'credit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    {transaction.platformShare > 0 && (
                                        <p className="text-xs text-purple-600 font-medium">
                                            Fee: {formatCurrency(transaction.platformShare)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No recent transactions
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentTransactions;