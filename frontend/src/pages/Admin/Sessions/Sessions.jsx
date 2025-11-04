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
    Play,
    Square,
    Calendar,
    Clock,
    Users as UsersIcon,
    DollarSign,
    X,
} from "lucide-react";

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
            scheduled: { color: "bg-yellow-100 text-yellow-800", icon: Calendar },
            completed: { color: "bg-green-100 text-green-800", icon: Square },
            cancelled: { color: "bg-red-100 text-red-800", icon: X },
            "in-progress": { color: "bg-blue-100 text-blue-800", icon: Play },
        };

        const config = statusConfig[status] || statusConfig.scheduled;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {status}
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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {initials}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
                    <p className="text-gray-600 mt-1">Manage active, ended, and pending user sessions</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm text-muted-foreground font-medium">Total Sessions</CardTitle>
                        <div className="p-2.5 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-4xl font-bold tracking-tight">{counts.total}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm text-muted-foreground font-medium">Active Sessions</CardTitle>
                        <div className="p-2.5 rounded-lg bg-green-50 flex items-center justify-center">
                            <Play className="w-4 h-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-4xl font-bold tracking-tight">{counts["in-progress"]}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm text-muted-foreground font-medium">Completed</CardTitle>
                        <div className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Square className="w-4 h-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-4xl font-bold tracking-tight">{counts.completed}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm text-muted-foreground font-medium">Cancelled</CardTitle>
                        <div className="p-2.5 rounded-lg bg-red-50 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-4xl font-bold tracking-tight">{counts.cancelled}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Current Sessions</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search sessions by title, participants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
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
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading sessions...</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Session ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Participants</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Created At</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">End Date</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.length > 0 ? (
                                            sessions.map((session) => (
                                                <tr key={session._id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {session._id?.slice(-6)?.toUpperCase()}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                {getUserAvatar(session.hostId?.name || "Host")}
                                                                <span className="font-medium">{session.hostId?.name || "Host"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getUserAvatar(session.learnerId?.name || "Learner")}
                                                                <span className="font-medium">{session.learnerId?.name || "Learner"}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">(2 total)</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {getStatusBadge(session.status || 'scheduled')}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {formatDate(session.createdAt)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {session.endedAt ? formatDate(session.endedAt) : "N/A"}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Force End Button for Active Sessions */}
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
                                                            
                                                            {/* View Details */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewDetails(session)}
                                                                title="View session details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                                    No sessions found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {sessions.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-gray-600">
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
                                                    return <span key={pageNumber} className="px-2">...</span>;
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
                    className="fixed inset-0 flex items-center justify-center z-50 bg-white/80 backdrop-blur-sm"
                    onClick={() => {
                        setIsModalOpen(false);
                        setSelectedSession(null);
                    }}
                >
                    <div 
                        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedSession(null);
                                    }}
                                    className="hover:bg-gray-100"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Session Info */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{selectedSession.title}</h3>
                                    <p className="text-gray-600">{selectedSession.description}</p>
                                </div>

                                {/* Participants */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Host</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            {getUserAvatar(selectedSession.hostId?.name || "Host")}
                                            <div>
                                                <p className="font-medium">{selectedSession.hostId?.name || "Host"}</p>
                                                <p className="text-sm text-gray-500">{selectedSession.hostId?.email || ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Learner</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            {getUserAvatar(selectedSession.learnerId?.name || "Learner")}
                                            <div>
                                                <p className="font-medium">{selectedSession.learnerId?.name || "Learner"}</p>
                                                <p className="text-sm text-gray-500">{selectedSession.learnerId?.email || ""}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Session ID</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedSession._id?.slice(-6)?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedSession.status || 'scheduled')}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Session Type</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedSession.sessionType || 'skillExchange'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Cost</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            ${selectedSession.cost || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Duration</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedSession.duration || 0} minutes
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatDate(selectedSession.scheduledTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Started At</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedSession.startedAt ? formatDate(selectedSession.startedAt) : 'Not started'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ended At</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedSession.endedAt ? formatDate(selectedSession.endedAt) : 'Not ended'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
                                        Force End Session
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sessions;
