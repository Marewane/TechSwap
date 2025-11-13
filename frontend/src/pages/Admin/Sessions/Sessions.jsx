import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Eye,
    Play,
    Square,
    Calendar,
    Clock,
    Users as UsersIcon,
    DollarSign,
    X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalSessions: 0,
        limit: 10
    });
    const [counts, setCounts] = useState({
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        "in-progress": 0,
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [selectedSession, setSelectedSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch sessions
    useEffect(() => {
        fetchSessions();
    }, [currentPage, debouncedSearch, statusFilter, itemsPerPage, startDate, endDate]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                status: statusFilter,
                startDate: startDate,
                endDate: endDate
            };

            const response = await axios.get("http://localhost:5000/admin/sessions", { params });

            if (response.data.success) {
                setSessions(response.data.data.sessions);
                setPagination(response.data.data.pagination);
                setCounts(response.data.data.counts);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle session status update
    const handleStatusUpdate = async (sessionId, newStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/admin/sessions/${sessionId}/status`,
                { status: newStatus }
            );

            if (response.data.success) {
                fetchSessions(); // Refresh list
            }
        } catch (error) {
            console.error("Error updating session status:", error);
            alert("Failed to update session status");
        }
    };

    // Handle view session details
    const handleViewDetails = (session) => {
        setSelectedSession(session);
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
            scheduled: { color: "border border-[#ffb86b66] bg-[#ffb86b1f] text-[#c26b11]", icon: Calendar },
            completed: { color: "border border-accent/40 bg-accent/15 text-accent-foreground", icon: Square },
            cancelled: { color: "border border-destructive/40 bg-destructive/10 text-destructive", icon: X },
            "in-progress": { color: "border border-secondary/40 bg-secondary/15 text-secondary", icon: Play },
        };

        const config = statusConfig[status] || statusConfig.scheduled;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {status.replace("-", " ")}
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

    const statusHighlights = [
        {
            label: "Total sessions",
            value: counts.total,
            icon: UsersIcon,
            accent: "from-secondary/20 via-white to-[#6d7aff22]",
        },
        {
            label: "In progress",
            value: counts["in-progress"],
            icon: Play,
            accent: "from-accent/20 via-white to-[#38f9d720]",
        },
        {
            label: "Completed",
            value: counts.completed,
            icon: Square,
            accent: "from-primary/15 via-white to-[#2e2f4620]",
        },
        {
            label: "Cancelled",
            value: counts.cancelled,
            icon: X,
            accent: "from-[#fda4af33] via-white to-[#fee2e240]",
        },
    ];


    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-[var(--radius)] border border-border/60 bg-white/80 p-6 shadow-[0_32px_100px_rgba(46,47,70,0.18)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                            Swap governance dashboard
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">Sessions</h1>
                        <p className="mt-2 max-w-xl text-sm text-foreground/70">
                            Manage live and historical swap sessions, enforce quality, and keep the TechSwap ecosystem flowing.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="rounded-full border border-border/50 bg-white/80 px-4 py-2">
                            Coins circulating · {counts.total * 50 || 0}
                        </span>
                    </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statusHighlights.map((item) => (
                        <div
                            key={item.label}
                            className="relative overflow-hidden rounded-[calc(var(--radius)/1.4)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_90px_rgba(46,47,70,0.22)]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-90`} />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-foreground">
                                        {item.value ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-full border border-border/40 bg-white/80 p-3 text-primary shadow-[0_14px_45px_rgba(46,47,70,0.16)]">
                                    <item.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sessions Table */}
            <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
                <CardHeader className="border-b border-border/40">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-xl font-semibold text-foreground">Current sessions</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                                <Input
                                    placeholder="Search sessions by title, participants..."
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
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-40"
                            />

                            <Input
                                type="date"
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-40"
                            />

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
                            <span className="ml-3 text-sm text-muted-foreground">Loading sessions…</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Participants</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.length > 0 ? (
                                            sessions.map((session) => (
                                                <TableRow key={session._id} className="transition-colors hover:bg-secondary/10">
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                                                            {session.hostId?.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{session.hostId?.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white -ml-4">
                                                                            {session.learnerId?.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{session.learnerId?.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(session.status || 'scheduled')}</TableCell>
                                                    <TableCell className="text-sm text-foreground/70">{formatDate(session.createdAt)}</TableCell>
                                                    <TableCell className="text-sm text-foreground/70">{session.endedAt ? formatDate(session.endedAt) : "N/A"}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {session.status === "in-progress" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleStatusUpdate(session._id, "completed")}
                                                                    title="Force End Session"
                                                                >
                                                                    Force End
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewDetails(session)}
                                                                title="View session details"
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
                                                    No sessions found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {sessions.length > 0 && (
                                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                        Showing page {pagination.currentPage} of {pagination.totalPages}
                                        ({pagination.totalSessions} total sessions)
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

            {/* Session Details Modal */}
            {isModalOpen && selectedSession && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 px-4 py-10 backdrop-blur-lg"
                    onClick={() => {
                        setIsModalOpen(false);
                        setSelectedSession(null);
                    }}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-[var(--radius)] border border-border/60 bg-card/95 shadow-[0_45px_140px_rgba(15,23,42,0.35)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-secondary">
                                    Premium session detail
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-foreground">Session insights</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedSession(null);
                                }}
                                className="rounded-full border border-border/50 bg-white/70 text-foreground/70 hover:text-secondary"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                            {/* Session Info */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/75 p-5 shadow-[0_16px_55px_rgba(46,47,70,0.14)]">
                                    <h3 className="text-lg font-semibold text-foreground">{selectedSession.title}</h3>
                                    <p className="mt-2 text-sm text-foreground/70">{selectedSession.description}</p>
                                </div>

                                {/* Participants */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Host
                                        </label>
                                        <div className="mt-3 flex items-center gap-3">
                                            {getUserAvatar(selectedSession.hostId?.name || "Host")}
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {selectedSession.hostId?.name || "Host"}
                                                </p>
                                                <p className="text-xs text-foreground/60">{selectedSession.hostId?.email || ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Learner
                                        </label>
                                        <div className="mt-3 flex items-center gap-3">
                                            {getUserAvatar(selectedSession.learnerId?.name || "Learner")}
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {selectedSession.learnerId?.name || "Learner"}
                                                </p>
                                                <p className="text-xs text-foreground/60">{selectedSession.learnerId?.email || ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Status
                                        </label>
                                        <div className="mt-3">
                                            {getStatusBadge(selectedSession.status || 'scheduled')}
                                        </div>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Session type
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedSession.sessionType || 'skillExchange'}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Cost
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            ${selectedSession.cost || 0}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Duration
                                        </label>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {selectedSession.duration || 0} minutes
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Scheduled time
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">
                                            {formatDate(selectedSession.scheduledTime)}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Started at
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">
                                            {selectedSession.startedAt ? formatDate(selectedSession.startedAt) : 'Not started'}
                                        </p>
                                    </div>
                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Ended at
                                        </label>
                                        <p className="mt-3 text-sm text-foreground/70">
                                            {selectedSession.endedAt ? formatDate(selectedSession.endedAt) : 'Not ended'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedSession(null);
                                }}
                            >
                                Close
                            </Button>
                            {selectedSession.status === "in-progress" && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleStatusUpdate(selectedSession._id, "completed");
                                        setIsModalOpen(false);
                                        setSelectedSession(null);
                                    }}
                                >
                                    Force end session
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sessions;
