import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileDropdown from "@/pages/User/Profile/ProfileDropdown";

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: "/home", label: "Home" },
        { path: "/sessions", label: "Sessions" },
    ];

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="fixed top-0 left-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link 
                    to="/home" 
                    className="flex items-center gap-3 text-xl font-semibold text-primary transition-colors hover:text-secondary"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-gradient-to-br from-primary to-[#3b3c5c] text-sm font-semibold text-primary-foreground shadow-[0_18px_50px_rgba(46,47,70,0.25)]">
                        TS
                    </div>
                    <span>TechSwap</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-1.5">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative rounded-[calc(var(--radius)/1.6)] px-4 py-2 text-sm font-semibold transition-all ${
                                    isActivePath(item.path)
                                        ? "bg-secondary/20 text-secondary shadow-[0_16px_40px_rgba(109,122,255,0.22)]"
                                        : "text-foreground/70 hover:bg-secondary/15 hover:text-secondary"
                                }`}
                            >
                                {item.label}
                                {isActivePath(item.path) && (
                                    <div className="absolute inset-x-6 -bottom-[6px] h-[2px] rounded-full bg-secondary/80" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Profile Dropdown Component */}
                    <ProfileDropdown />
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-foreground/80 hover:text-secondary">
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent 
                        side="right" 
                        className="w-[320px] sm:w-[400px] border-l border-border/50 bg-white/90 backdrop-blur-xl"
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <div className="mt-10 flex flex-col gap-5">
                            {navItems.map((item) => (
                                <SheetClose asChild key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`rounded-[calc(var(--radius)/1.6)] px-5 py-3 text-base font-semibold transition-colors ${
                                            isActivePath(item.path)
                                                ? "bg-secondary/20 text-secondary shadow-[0_18px_50px_rgba(109,122,255,0.22)]"
                                                : "text-foreground/75 hover:bg-secondary/15 hover:text-secondary"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}
                            
                            {/* Mobile Profile Section */}
                            <div className="space-y-4 border-t border-border/50 pt-4">
                                <div className="flex items-center gap-3 rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-3 shadow-[0_14px_35px_rgba(46,47,70,0.14)]">
                                    <Avatar className="size-10">
                                        <AvatarImage src="/avatars/user.jpg" alt="User" />
                                        <AvatarFallback>UN</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">John Doe</p>
                                        <p className="truncate text-xs text-foreground/60">john.doe@example.com</p>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <SheetClose asChild>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <Link to="/profile">
                                                <User className="mr-2 size-4" />
                                                Profile
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button 
                                            variant="default" 
                                            className="w-full"
                                        >
                                            <LogOut className="mr-2 size-4" />
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