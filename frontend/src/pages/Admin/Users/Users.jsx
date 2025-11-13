import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Eye,
    UserCheck,
    UserX,
    Users as UsersIcon,
    Shield,
    X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10
    });
    const [counts, setCounts] = useState({
        total: 0,
        active: 0,
        suspended: 0,
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearch, statusFilter, itemsPerPage]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                status: statusFilter
            };

            const response = await axios.get("http://localhost:5000/admin/users", { params });

            if (response.data.success) {
                setUsers(response.data.data.users);
                setPagination(response.data.data.pagination);
                setCounts(response.data.data.counts);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/admin/users/${userId}/status`,
                { status: newStatus }
            );

            if (response.data.success) {
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Failed to update user status");
        }
    };

    // Handle view user details
    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: "border border-accent/40 bg-accent/15 text-accent-foreground", icon: UserCheck },
            suspended: { color: "border border-destructive/40 bg-destructive/10 text-destructive", icon: UserX },
            inactive: { color: "border border-border/50 bg-white/70 text-foreground/70", icon: UserX },
        };

        const config = statusConfig[status] || statusConfig.active;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {status.replace("-", " ")}
            </span>
        );
    };

    // Get role badge
    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { color: "border border-secondary/40 bg-secondary/15 text-secondary", icon: Shield },
            user: { color: "border border-border/50 bg-white/70 text-foreground/70", icon: UsersIcon },
        };

        const config = roleConfig[role] || roleConfig.user;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {role}
            </span>
        );
    };

    // Generate user avatar
    const getUserAvatar = (name) => {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/40 bg-secondary/15 text-xs font-semibold text-secondary shadow-[0_12px_35px_rgba(109,122,255,0.22)]">
                {initials}
            </div>
        );
    };

    const highlightCards = [
        {
            label: "Total members",
            value: counts.total,
            icon: UsersIcon,
            accent: "from-secondary/20 via-white to-[#6d7aff22]",
        },
        {
            label: "Active",
            value: counts.active,
            icon: UserCheck,
            accent: "from-accent/20 via-white to-[#38f9d720]",
        },
        {
            label: "Suspended",
            value: counts.suspended,
            icon: UserX,
            accent: "from-[#fda4af33] via-white to-[#fee2e240]",
        },
        {
            label: "Verified",
            value: users.filter((user) => user.isEmailVerified).length,
            icon: Shield,
            accent: "from-[#7c3aed22] via-white to-[#ede9fe40]",
        },
    ];

  return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-[var(--radius)] border border-border/60 bg-white/80 p-6 shadow-[0_32px_100px_rgba(46,47,70,0.18)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                            Member intelligence dashboard
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">Users</h1>
                        <p className="mt-2 max-w-xl text-sm text-foreground/70">
                            Monitor elite mentors and learners, track trust signals, and maintain a premium TechSwap experience.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="rounded-full border border-border/50 bg-white/80 px-4 py-2">
                            Verified · {users.filter((user) => user.isEmailVerified).length}
                        </span>
                    </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {highlightCards.map((card) => (
                        <div
                            key={card.label}
                            className="relative overflow-hidden rounded-[calc(var(--radius)/1.4)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_90px_rgba(46,47,70,0.22)]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-90`} />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-foreground">{card.value ?? 0}</p>
                                </div>
                                <div className="rounded-full border border-border/40 bg-white/80 p-3 text-primary shadow-[0_14px_45px_rgba(46,47,70,0.16)]">
                                    <card.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Users Table */}
            <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
                <CardHeader className="border-b border-border/40">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-xl font-semibold text-foreground">Users list</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                                <Input
                                    placeholder="Search users by name, email, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 sm:w-64"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                                setItemsPerPage(Number(val));
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 per page</SelectItem>
                                    <SelectItem value="10">10 per page</SelectItem>
                                    <SelectItem value="20">20 per page</SelectItem>
                                    <SelectItem value="50">50 per page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                            <span className="ml-3 text-sm text-muted-foreground">Loading users…</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <TableRow key={user._id} className="transition-colors hover:bg-secondary/10">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {getUserAvatar(user.name || user.firstName + ' ' + user.lastName)}
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {user.name || `${user.firstName} ${user.lastName}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-foreground/70">{user.email}</TableCell>
                                                    <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                                                    <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {user.status === "active" ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleStatusUpdate(user._id, "suspended")}
                                                                    title="Suspend user"
                                                                >
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-accent/50 text-accent-foreground hover:bg-accent/15"
                                                                    onClick={() => handleStatusUpdate(user._id, "active")}
                                                                    title="Activate user"
                                                                >
                                                                    <UserCheck className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-border/60 text-foreground/70 hover:text-secondary"
                                                                onClick={() => handleViewDetails(user)}
                                                                title="View user details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="5" className="py-10 text-center text-muted-foreground">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {users.length > 0 && (
                                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                        Showing page {pagination.currentPage} of {pagination.totalPages}
                                        ({pagination.totalUsers} total users)
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            disabled={!pagination.hasPrevPage || loading}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === pagination.totalPages ||
                                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            disabled={loading}
                                                            className="w-10"
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 2 ||
                                                    pageNumber === currentPage + 2
                                                ) {
                                                    return <span key={pageNumber} className="px-2 text-muted-foreground">…</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={!pagination.hasNextPage || loading}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 px-4 py-10 backdrop-blur-lg"
                    onClick={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-[var(--radius)] border border-border/60 bg-card/95 shadow-[0_45px_140px_rgba(15,23,42,0.35)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-secondary">
                                    Member profile spotlight
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-foreground">User details</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="rounded-full border border-border/50 bg-white/70 text-foreground/70 hover:text-secondary"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                            {/* User Info */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="flex items-center gap-4 rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/75 p-5 shadow-[0_16px_55px_rgba(46,47,70,0.14)]">
                                    {getUserAvatar(selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`)}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
                                        </h3>
                                        <p className="text-sm text-foreground/70">{selectedUser.email}</p>
                                    </div>
                                </div>

                                {/* Status and Role */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Status
                                        </label>
                                        <div className="mt-3">
                                            {getStatusBadge(selectedUser.status || 'active')}
                                        </div>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Role
                                        </label>
                                        <div className="mt-3">
                                            {getRoleBadge(selectedUser.role || 'user')}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            User ID
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedUser.userId || selectedUser._id?.slice(-6)?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Email verified
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Rating
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedUser.rating || 0}/5
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Total sessions
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedUser.totalSession || 0}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Last login
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">
                                            {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Member since
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">
                                            {formatDate(selectedUser.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedUser.bio && (
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Bio
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">{selectedUser.bio}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {(selectedUser.skillsToTeach?.length > 0 || selectedUser.skillsToLearn?.length > 0) && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {selectedUser.skillsToTeach?.length > 0 && (
                                            <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                    Skills to teach
                                                </label>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {selectedUser.skillsToTeach.map((skill, index) => (
                                                        <span key={index} className="rounded-full border border-secondary/40 bg-secondary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedUser.skillsToLearn?.length > 0 && (
                                            <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                    Skills to learn
                                                </label>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {selectedUser.skillsToLearn.map((skill, index) => (
                                                        <span key={index} className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedUser(null);
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant={selectedUser.status === "active" ? "destructive" : "default"}
                                onClick={() => {
                                    const newStatus = selectedUser.status === "active" ? "suspended" : "active";
                                    handleStatusUpdate(selectedUser._id, newStatus);
                                    setIsModalOpen(false);
                                    setSelectedUser(null);
                                }}
                            >
                                {selectedUser.status === "active" ? "Suspend user" : "Activate user"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default Users;
