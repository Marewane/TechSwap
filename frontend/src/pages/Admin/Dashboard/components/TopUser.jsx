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
            case 0: return "bg-secondary/20 text-secondary border-secondary/50 shadow-[0_16px_45px_rgba(109,122,255,0.18)]";
            case 1: return "bg-accent/20 text-accent-foreground border-accent/50 shadow-[0_16px_45px_rgba(56,249,215,0.18)]";
            case 2: return "bg-[#ffb86b1f] text-[#c26b11] border-[#ffb86b66] shadow-[0_16px_45px_rgba(255,184,107,0.2)]";
            default: return "bg-white/70 text-foreground border-border/60 shadow-[0_12px_35px_rgba(46,47,70,0.14)]";
        }
    };

    // Get rank icon
    const getRankIcon = (index) => {
        if (index === 0) {
            return <Trophy className="h-4 w-4 text-secondary" />;
        }
        return <span className="font-bold">#{index + 1}</span>;
    };

    return (
        <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_30px_100px_rgba(46,47,70,0.18)]">
            <CardHeader className="border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-secondary" />
                        <CardTitle className="text-lg font-semibold text-foreground">Top Swappers</CardTitle>
                    </div>
                    <Badge className="rounded-full border border-secondary/40 bg-secondary/15 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                        By revenue
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    {topUsers && topUsers.length > 0 ? (
                        topUsers.map((user, index) => (
                            <div 
                                key={user._id} 
                                className="flex items-center gap-4 rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/70 p-3 shadow-[0_14px_45px_rgba(46,47,70,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/10"
                            >
                                {/* Rank Badge */}
                                <div className={`flex size-10 items-center justify-center rounded-full border ${getRankColor(index)}`}>
                                    {getRankIcon(index)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-secondary/40 to-primary/40 text-sm font-semibold text-primary-foreground">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {user.name || "Unknown User"}
                                        </p>
                                        {index === 0 && (
                                            <Badge className="rounded-full border border-secondary/50 bg-secondary/20 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
                                                Elite performer
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-foreground/60">
                                        {user.email || "No email"}
                                    </p>
                                    <div className="mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                            <TrendingUp className="h-3 w-3 text-secondary" />
                                            {user.transactionCount} transaction{user.transactionCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-base font-semibold text-primary">
                                        <DollarSign className="h-4 w-4 text-secondary" />
                                        {formatCurrency(user.totalRevenue)}
                                    </div>
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Revenue</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-border/40 bg-white/70 py-10 text-center text-muted-foreground">
                            <Trophy className="mb-4 h-12 w-12 text-secondary/40" />
                            <p className="text-sm font-semibold">No top swappers yet</p>
                            <p className="mt-2 max-w-xs text-xs text-muted-foreground/80">
                                As soon as premium sessions start generating revenue, the leaderboard will populate automatically.
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {topUsers && topUsers.length > 0 && (
                    <div className="mt-6 rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/70 px-4 py-3">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <span>Total from top 5</span>
                            <span className="text-sm text-foreground">
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
