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
            active: { color: "bg-green-100 text-green-800", icon: UserCheck },
            suspended: { color: "bg-red-100 text-red-800", icon: UserX },
            inactive: { color: "bg-gray-100 text-gray-800", icon: UserX },
        };

        const config = statusConfig[status] || statusConfig.active;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {status}
            </span>
        );
    };

    // Get role badge
    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { color: "bg-purple-100 text-purple-800", icon: Shield },
            user: { color: "bg-gray-100 text-gray-800", icon: UsersIcon },
        };

        const config = roleConfig[role] || roleConfig.user;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
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
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
                </div>
            </div>


            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Users List</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users by name, email, or ID..."
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
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading users...</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">NAME</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">EMAIL</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">ROLE</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">STATUS</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-600">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            {getUserAvatar(user.name || user.firstName + ' ' + user.lastName)}
    <div>
                                                                <p className="font-medium">{user.name || `${user.firstName} ${user.lastName}`}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {user.email}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {getRoleBadge(user.role || 'user')}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {getStatusBadge(user.status || 'active')}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Status Toggle */}
                                                            {user.status === "active" ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-red-50 text-red-700 hover:bg-red-100"
                                                                    onClick={() => handleStatusUpdate(user._id, "suspended")}
                                                                    title="Suspend user"
                                                                >
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-green-50 text-green-700 hover:bg-green-100"
                                                                    onClick={() => handleStatusUpdate(user._id, "active")}
                                                                    title="Activate user"
                                                                >
                                                                    <UserCheck className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            
                                                            {/* View Details */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewDetails(user)}
                                                                title="View user details"
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
                                                    No users found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {users.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-gray-600">
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

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div 
                    className="fixed inset-0 flex items-center justify-center z-50 bg-white/80 backdrop-blur-sm"
                    onClick={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                >
                    <div 
                        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="hover:bg-gray-100"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* User Info */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="flex items-center gap-4">
                                    {getUserAvatar(selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`)}
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
                                        </h3>
                                        <p className="text-gray-600">{selectedUser.email}</p>
                                    </div>
                                </div>

                                {/* Status and Role */}
                                <div className="flex gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedUser.status || 'active')}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Role</label>
                                        <div className="mt-1">
                                            {getRoleBadge(selectedUser.role || 'user')}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">User ID</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedUser.userId || selectedUser._id?.slice(-6)?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email Verified</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Rating</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedUser.rating || 0}/5
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Total Sessions</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedUser.totalSession || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Login</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatDate(selectedUser.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedUser.bio && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Bio</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedUser.bio}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {(selectedUser.skillsToTeach?.length > 0 || selectedUser.skillsToLearn?.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedUser.skillsToTeach?.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Skills to Teach</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedUser.skillsToTeach.map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedUser.skillsToLearn?.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Skills to Learn</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedUser.skillsToLearn.map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
                                    {selectedUser.status === "active" ? "Suspend User" : "Activate User"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default Users;
