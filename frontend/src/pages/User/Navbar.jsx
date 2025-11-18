// frontend/src/pages/User/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, CircleDollarSign, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyProfile } from "@/features/profile/profileSlice";
import { logout as logoutAction } from "@/features/user/userSlice";
import { useCallback, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import api from "@/services/api";
import { useSocket } from "@/hooks/useSocket";

// Resolve avatar to absolute URL if backend returns a relative path
const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url; // already absolute
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/?api\/?$/, "");
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Navbar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myProfile } = useSelector((state) => state.profile);
  const { tokens } = useSelector((state) => state.user);
  const user = myProfile?.user;
  const accessToken = tokens?.accessToken;
  const { socket, connect, disconnect } = useSocket(accessToken);


  

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

  const getInitials = (name) => {
    if (!name) return "UN";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
      setLoadingWallet(true);
      const res = await api.get("/users/me/wallet");
      setWalletBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Failed to fetch wallet balance", err);
      setWalletBalance(0);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      const unread = res.data?.filter((n) => !n.isRead) || [];
      setUnreadCount(unread.length);
      return unread.length;
    } catch (err) {
      console.error("Failed to fetch notification count", err);
      return undefined;
    }
  }, []);

  useEffect(() => {
    // Fetch both wallet balance and notifications when component mounts
    fetchWalletBalance();
    fetchUnreadCount();

    // Optional: Poll every 30 seconds for updates
    const interval = setInterval(() => {
      fetchWalletBalance();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchWalletBalance, fetchUnreadCount]);

  const handleLogout = async () => {
    try {
      // Best-effort server logout (no need to block on response)
      api.post("/auth/logout").catch(() => {});
    } catch {}
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  // On hard refresh or direct visit, hydrate profile so avatar/name render
  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [myProfile, dispatch]);

  // Also fetch wallet when profile changes (user logs in/out)
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user, fetchWalletBalance]);

  // Listen for global wallet balance updates (e.g., after payment validation)
  useEffect(() => {
    const handler = (e) => {
      if (typeof e?.detail?.balance === 'number') {
        setWalletBalance(e.detail.balance);
      }
    };
    window.addEventListener('wallet:update', handler);
    return () => window.removeEventListener('wallet:update', handler);
  }, []);

  // When notifications page auto-marks all as read, refresh the count quickly
  useEffect(() => {
    const handleMarkedAll = () => {
      fetchUnreadCount();
    };
    const handleUpdated = (e) => {
      if (e.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
      }
    };
    window.addEventListener('notifications:read-all', handleMarkedAll);
    window.addEventListener('notifications:updated', handleUpdated);
    return () => {
      window.removeEventListener('notifications:read-all', handleMarkedAll);
      window.removeEventListener('notifications:updated', handleUpdated);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    connect();
    return () => {
      disconnect();
    };
  }, [accessToken, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleNotificationNew = (notification) => {
      if (!notification) return;

      fetchUnreadCount().then((count) => {
        if (typeof count === "number") {
          window.dispatchEvent(new CustomEvent("notifications:updated", { detail: { unreadCount: count } }));
        }
      });

      window.dispatchEvent(new CustomEvent("notifications:new", { detail: { notification } }));
    };

    socket.on("notification:new", handleNotificationNew);

    return () => {
      socket.off("notification:new", handleNotificationNew);
    };
  }, [socket, fetchUnreadCount]);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center gap-2 text-sm font-medium tracking-tight text-primary"
        >
          <img
            src="/TechswapLogo.svg"
            alt="TechSwap"
            className="h-22 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  isActivePath(item.path)
                    ? "bg-[#E3E7FF] text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-primary"
                }`}
              >
                {item.label}
                {isActivePath(item.path) && (
                  <div className="absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-[#38F9D7]/70" />
                )}
              </Link>
            ))}
          </div>

          {/* Wallet Balance + Buy Coins */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-border bg-gradient-to-r from-[#E3E7FF] via-white to-[#E3E7FF] px-3 py-1.5 text-xs font-medium text-primary shadow-sm shadow-black/5 lg:flex">
              <CircleDollarSign className="mr-1 h-4 w-4 text-[#6D7AFF]" />
              {loadingWallet ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                `${formatAmount(walletBalance)} Coins`
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-[#6D7AFF] text-[11px] font-semibold text-primary hover:bg-[#E3E7FF]"
              onClick={() =>
                navigate("/profile", { state: { openAddFunds: true, tab: "wallet" } })
              }
            >
              Buy Coins
            </Button>
          </div>

          {/* Notification Bell with unread badge */}
          <Link to="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center focus:outline-none cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={resolveAvatarUrl(user?.avatar)} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile quick actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.path}>
                    <Link
                      to={item.path}
                      className={`rounded-xl py-3 px-4 text-base font-medium transition-colors ${
                        isActivePath(item.path)
                          ? "bg-[#E3E7FF] text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                {/* Mobile Wallet Balance */}
                <div className="space-y-2 rounded-2xl border border-border bg-gradient-to-r from-[#EEF0FF] via-white to-[#EEF0FF] px-4 py-3 shadow-sm shadow-black/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CircleDollarSign className="mr-2 h-5 w-5 text-[#6D7AFF]" />
                      <span className="text-sm font-semibold text-primary">Wallet Balance</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {loadingWallet ? "..." : `${formatAmount(walletBalance)} Coins`}
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 w-full rounded-full border-[#6D7AFF] text-[11px] font-semibold text-primary hover:bg-[#E3E7FF]"
                      onClick={() =>
                        navigate("/profile", { state: { openAddFunds: true, tab: "wallet" } })
                      }
                    >
                      Buy Coins
                    </Button>
                  </SheetClose>
                </div>

                {/* Mobile Notification with badge */}
                <SheetClose asChild>
                  <Link
                    to="/notifications"
                    className="text-lg font-medium py-3 px-4 rounded-lg text-gray-700 hover:text-indigo-600 flex items-center gap-2 relative"
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </SheetClose>

                {/* Mobile Profile Section */}
                <div className="pt-4 border-t space-y-4">
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={resolveAvatarUrl(user?.avatar)} alt={user?.name || "User"} />
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
                        <p className="text-xs text-green-700 font-semibold mt-1">
                          {loadingWallet ? "Loading coins..." : `${formatAmount(walletBalance)} Coins`}
                        </p>
                      </div>
                    </Link>
                  </SheetClose>

                  {user?.role === "admin" && (
                    <SheetClose asChild>
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium">Admin Dashboard</span>
                      </Link>
                    </SheetClose>
                  )}

                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Button
                        onClick={handleLogout}
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
      </div>
    </nav>
  );
};

export default Navbar;