import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import Navbar from "@/pages/User/Navbar";

const StickyWalletWidget = () => {
    const { user } = useSelector((state) => state.user || {});
    const coinBalance = useMemo(() => {
        const possibleBalances = [
            user?.coinBalance,
            user?.coins,
            user?.wallet?.balance,
            user?.walletBalance,
        ].filter((value) => typeof value === "number" && !Number.isNaN(value));
        return possibleBalances.length ? possibleBalances[0] : 0;
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <aside className="fixed bottom-6 right-6 z-40 w-[320px] max-w-[90vw]">
            <Card className="border border-border/60 bg-card/95 px-6 py-6 shadow-[0_28px_80px_rgba(46,47,70,0.28)]">
                <CardContent className="flex flex-col gap-5 p-0">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-secondary/20 p-4 text-secondary shadow-[0_16px_45px_rgba(109,122,255,0.22)]">
                            <Coins className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                Coin balance
                            </p>
                            <p className="text-3xl font-semibold text-foreground">
                                {coinBalance.toLocaleString()} coins
                            </p>
                            <p className="text-xs text-foreground/60">
                                50 coins per person per premium swap session.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/wallet">View wallet</Link>
                        </Button>
                        <Button asChild className="w-full">
                            <Link to="/pricing">Buy coins</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
};

const UserLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f9fafb] via-white to-[#eef1ff]">
            <Navbar />
            <main className="relative flex-1 pt-24">
                <StickyWalletWidget />
                <div className="mx-auto w-full max-w-[1440px] px-6 pb-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
