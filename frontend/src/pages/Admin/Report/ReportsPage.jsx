import { useState, useEffect } from "react"
import api from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, Loader2, Eye, CheckCircle, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ReportDetailModal from "./components/ReportDetailModal"

const ReportsPage = () => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalReports: 0,
        limit: 10,
    })
    const [counts, setCounts] = useState({
        all: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
    })

    // Filter states
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Modal state
    const [selectedReport, setSelectedReport] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch reports
    useEffect(() => {
        fetchReports()
    }, [currentPage, debouncedSearch, statusFilter, itemsPerPage])

    const fetchReports = async () => {
        setLoading(true)
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                status: statusFilter,
            }

            const response = await api.get("/admin/reports", { params })

            if (response.data.success) {
                setReports(response.data.data.reports)
                setPagination(response.data.data.pagination)
                setCounts(response.data.data.counts)
            }
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
        }
    }

    // Handle status update
    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/status`, {
                status: newStatus,
            })

            if (response.data.success) {
                fetchReports() // Refresh list
                if (isModalOpen) {
                    setIsModalOpen(false)
                }
            }
        } catch (error) {
            console.error("Error updating report status:", error)
            alert("Failed to update report status")
        }
    }

    // Handle view details
    const handleViewDetails = async (reportId) => {
        try {
            const response = await api.get(`/admin/reports/${reportId}`)
            console.log("report detail response:", response.data)
            if (response.data.success) {
                const payload = response.data.data?.report || response.data.data || response.data
                setSelectedReport(payload)
                setIsModalOpen(true)
            }
        } catch (error) {
            console.error("Error fetching report details:", error)
        }
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
            reviewed: { color: "bg-blue-100 text-blue-800", icon: Eye },
            resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        }

        const config = statusConfig[status] || statusConfig.pending
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {status}
            </span>
        )
    }

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
                    <p className="text-gray-600 mt-1">Manage and review user reports</p>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        {[
                            { value: "all", label: "All Reports", count: counts.all },
                            { value: "pending", label: "Pending", count: counts.pending },
                            { value: "reviewed", label: "Reviewed", count: counts.reviewed },
                            { value: "resolved", label: "Resolved", count: counts.resolved },
                        ].map((tab) => (
                            <Button
                                key={tab.value}
                                variant={statusFilter === tab.value ? "default" : "outline"}
                                onClick={() => {
                                    setStatusFilter(tab.value)
                                    setCurrentPage(1)
                                }}
                                className="flex items-center gap-2"
                            >
                                {tab.label}
                                <Badge variant="secondary" className="ml-1">
                                    {tab.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Reports List</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>

                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(val) => {
                                    setItemsPerPage(Number(val))
                                    setCurrentPage(1)
                                }}
                            >
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
                            <span className="ml-2 text-gray-600">Loading reports...</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reporter</TableHead>
                                            <TableHead>Reported User</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.length > 0 ? (
                                            reports.map((report) => (
                                                <TableRow key={report._id}>
                                                    <TableCell className="text-sm text-gray-600">{formatDate(report.createdAt)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>
                                                            <p className="font-medium">{report.reporterId?.name || "N/A"}</p>
                                                            <p className="text-xs text-gray-500">{report.reporterId?.email || ""}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>
                                                            <p className="font-medium">{report.reportedUserId?.name || "N/A"}</p>
                                                            <p className="text-xs text-gray-500">{report.reportedUserId?.email || ""}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-xs truncate">{report.reason}</TableCell>
                                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Status Buttons */}
                                                            {report.status === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                                    onClick={() => handleStatusUpdate(report._id, "reviewed")}
                                                                >
                                                                    Review
                                                                </Button>
                                                            )}
                                                            {report.status === "reviewed" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-green-50 text-green-700 hover:bg-green-100"
                                                                    onClick={() => handleStatusUpdate(report._id, "resolved")}
                                                                >
                                                                    Resolve
                                                                </Button>
                                                            )}
                                                            {/* View Details */}
                                                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(report._id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="6" className="py-8 text-center text-gray-500">
                                                    No reports found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {reports.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-gray-600">
                                        Showing page {pagination.currentPage} of {pagination.totalPages}({pagination.totalReports} total
                                        reports)
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            disabled={!pagination.hasPrevPage || loading}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.totalPages)].map((_, index) => {
                                                const pageNumber = index + 1
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
                                                    )
                                                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                                    return (
                                                        <span key={pageNumber} className="px-2">
                                                            ...
                                                        </span>
                                                    )
                                                }
                                                return null
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
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

            {/* Report Detail Modal - always mounted so Dialog can open/close reliably */}
            <ReportDetailModal
                report={selectedReport}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedReport(null)
                }}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    )
}

export default ReportsPage