import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const ProfileDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full border border-border/60 bg-white/70 shadow-[0_18px_45px_rgba(46,47,70,0.18)]">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src="/avatars/user.jpg" alt="User" />
                        <AvatarFallback className="bg-secondary/25 text-secondary border border-secondary/40">
                            UN
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-48"
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                }}
            >
                <DropdownMenuLabel className="font-semibold text-foreground">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">John Doe</p>
                        <p className="text-xs leading-none text-foreground/60 font-mono uppercase tracking-[0.2em]">john.doe@example.com</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-foreground/80 hover:text-secondary">
                    <Link to="/profile" className="flex w-full items-center">
                        <User className="mr-2 size-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProfileDropdown;