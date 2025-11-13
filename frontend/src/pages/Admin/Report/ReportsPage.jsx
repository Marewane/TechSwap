import { useState, useEffect } from "react"
import axios from "axios"
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

            const response = await axios.get("http://localhost:5000/admin/reports", { params })

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
            const response = await axios.patch(`http://localhost:5000/admin/reports/${reportId}/status`, {
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
            const response = await axios.get(`http://localhost:5000/admin/reports/${reportId}`)
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
            pending: { color: "border border-[#ffb86b66] bg-[#ffb86b1f] text-[#c26b11]", icon: Clock },
            reviewed: { color: "border border-secondary/40 bg-secondary/15 text-secondary", icon: Eye },
            resolved: { color: "border border-accent/40 bg-accent/15 text-accent-foreground", icon: CheckCircle },
        }

        const config = statusConfig[status] || statusConfig.pending
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {status.replace("-", " ")}
            </span>
        )
    }

    const highlightCards = [
        {
            label: "Total reports",
            value: counts.all,
            accent: "from-secondary/20 via-white to-[#6d7aff22]",
            icon: Eye,
        },
        {
            label: "Pending",
            value: counts.pending,
            accent: "from-[#ffb86b33] via-white to-[#fdeccf40]",
            icon: Clock,
        },
        {
            label: "Reviewed",
            value: counts.reviewed,
            accent: "from-primary/15 via-white to-[#2e2f4620]",
            icon: Eye,
        },
        {
            label: "Resolved",
            value: counts.resolved,
            accent: "from-accent/20 via-white to-[#38f9d720]",
            icon: CheckCircle,
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-[var(--radius)] border border-border/60 bg-white/80 p-6 shadow-[0_32px_100px_rgba(46,47,70,0.18)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                            Trust & safety control center
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">Reports management</h1>
                        <p className="mt-2 max-w-xl text-sm text-foreground/70">
                            Monitor escalations, close the loop on community feedback, and maintain the integrity of TechSwap sessions.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="rounded-full border border-border/50 bg-white/80 px-4 py-2">
                            New this week · {counts.pending}
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

            {/* Reports Table */}
            <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
                <CardHeader className="border-b border-border/40">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <CardTitle className="text-xl font-semibold text-foreground">Reports list</CardTitle>
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
                                        <Badge variant="secondary" className="ml-1 rounded-full border border-border/40 bg-white/70 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
                                            {tab.count}
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                                <Input
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 sm:w-64"
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
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                            <span className="ml-3 text-sm text-muted-foreground">Loading reports…</span>
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
                                                <TableRow key={report._id} className="transition-colors hover:bg-secondary/10">
                                                    <TableCell className="text-sm text-foreground/70">{formatDate(report.createdAt)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">{report.reporterId?.name || "N/A"}</p>
                                                            <p className="text-xs text-foreground/60">{report.reporterId?.email || ""}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">{report.reportedUserId?.name || "N/A"}</p>
                                                            <p className="text-xs text-foreground/60">{report.reportedUserId?.email || ""}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs text-sm text-foreground/70">{report.reason}</TableCell>
                                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Status Buttons */}
                                                            {report.status === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-secondary/40 text-secondary hover:bg-secondary/15"
                                                                    onClick={() => handleStatusUpdate(report._id, "reviewed")}
                                                                >
                                                                    Review
                                                                </Button>
                                                            )}
                                                            {report.status === "reviewed" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-accent/40 text-accent-foreground hover:bg-accent/15"
                                                                    onClick={() => handleStatusUpdate(report._id, "resolved")}
                                                                >
                                                                    Resolve
                                                                </Button>
                                                            )}
                                                            {/* View Details */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-border/60 text-foreground/70 hover:text-secondary"
                                                                onClick={() => handleViewDetails(report._id)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="6" className="py-10 text-center text-muted-foreground">
                                                    No reports found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {reports.length > 0 && (
                                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                        Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalReports} total
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
                                                    return <span key={pageNumber} className="px-2 text-muted-foreground">…</span>
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
