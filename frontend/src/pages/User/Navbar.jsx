import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut,CircleDollarSign  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import ProfileDropdown from "./Profile/components/ProfileDropdown";

const Navbar = () => {
    const location = useLocation();
    const { myProfile } = useSelector((state) => state.profile);
    const user = myProfile?.user;
    const walletBalance = myProfile?.wallet?.balance;

    const formatAmount = (amount) => {
        try {
            return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        } catch {
            return amount;
        }
    };

    const navItems = [
        { path: "/home", label: "Home" },
        { path: "/events", label: "Events" },
    ];

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "UN";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white border-b z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/home"
                    className="flex items-center space-x-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TS</span>
                    </div>
                    <span>TechSwap</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Navigation Links */}
                    <div className="flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative px-4 py-2 rounded-lg font-medium transition-all ${isActivePath(item.path)
                                    ? "text-indigo-600 bg-indigo-50"
                                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                                    }`}
                            >
                                {item.label}
                                {isActivePath(item.path) && (
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>
                    {/* Wallet Balance */}
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
                        <span className="mr-1"><CircleDollarSign></CircleDollarSign></span>
                        {walletBalance !== undefined ? `${formatAmount(walletBalance)} Coins` : '0 Coins'}
                    </div>
                    <ProfileDropdown />
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col space-y-4 mt-8">
                            {navItems.map((item) => (
                                <SheetClose asChild key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`text-lg font-medium py-3 px-4 rounded-lg transition-colors ${isActivePath(item.path)
                                            ? "text-indigo-600 bg-indigo-50"
                                            : "text-gray-700 hover:text-indigo-600"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}

                            {/* Mobile Profile Section */}
                            <div className="pt-4 border-t space-y-4">
                                <div className="flex items-center space-x-3 p-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user?.email || "user@example.com"}
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {walletBalance !== undefined ? `${formatAmount(walletBalance)} Coins` : '0 Coins'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <SheetClose asChild>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <Link to="/profile">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button
                                            variant="default"
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;