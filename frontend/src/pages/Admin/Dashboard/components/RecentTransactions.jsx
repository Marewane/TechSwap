import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
            <CardHeader className="border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
                        <CardDescription className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            Last five coin movements across the ecosystem
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/transactions')}
                        className="gap-1 rounded-full border border-border/60 bg-white/70 text-secondary hover:bg-secondary/15 hover:text-secondary"
                    >
                        View all
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    {transactions && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div
                                key={transaction._id}
                                className="flex items-center justify-between rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/70 p-4 shadow-[0_16px_55px_rgba(46,47,70,0.14)] transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/10"
                            >
                                {/* Left side - Icon and Info */}
                                <div className="flex flex-1 items-center gap-3">
                                    {/* Icon */}
                                    <div
                                        className={`rounded-full p-2.5 shadow-[0_12px_35px_rgba(46,47,70,0.12)] ${
                                            transaction.type === 'credit'
                                                ? 'border border-accent/50 bg-accent/20 text-accent-foreground'
                                                : 'border border-destructive/40 bg-destructive/10 text-destructive'
                                        }`}
                                    >
                                        {transaction.type === 'credit' ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                    </div>

                                    {/* Transaction Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {transaction.description || "Transaction"}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                            <span>{formatDate(transaction.createdAt)}</span>
                                            {transaction.fromUserId?.name && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate text-foreground/70">
                                                        {transaction.fromUserId.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Amount */}
                                <div className="ml-4 text-right">
                                    <p
                                        className={`text-sm font-semibold ${
                                            transaction.type === 'credit'
                                                ? 'text-primary'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {transaction.type === 'credit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    {transaction.platformShare > 0 && (
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                                            Fee · {formatCurrency(transaction.platformShare)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-border/50 bg-white/70 py-12 text-center text-muted-foreground">
                            <p className="text-sm font-semibold">No recent transactions</p>
                            <p className="mt-2 max-w-xs text-xs text-muted-foreground/80">
                                As soon as coin purchases begin, you’ll see them surface here in real time.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentTransactions;