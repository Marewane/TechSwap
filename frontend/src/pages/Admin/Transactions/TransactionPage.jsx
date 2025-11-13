import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTransactions: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch transactions
    useEffect(() => {
        fetchTransactions()
    }, [currentPage, debouncedSearch, typeFilter, itemsPerPage])

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                type: typeFilter,
            }

            const response = await axios.get("http://localhost:5000/admin/transactions", { params })

            if (response.data.success) {
                setTransactions(response.data.data.transactions)
                setPagination(response.data.data.pagination)
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        } finally {
            setLoading(false)
        }
    }

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

    const formatCurrency = (amount) => `$${amount.toFixed(2)}`

    const handlePageChange = (newPage) => setCurrentPage(newPage)
    const handleTypeFilterChange = (value) => {
        setTypeFilter(value)
        setCurrentPage(1)
    }
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1)
    }

    // Badge for transaction type
    const getTypeBadge = (type) => {
        const typeConfig = {
            credit: "border border-accent/40 bg-accent/15 text-accent-foreground",
            debit: "border border-destructive/40 bg-destructive/10 text-destructive",
        }
        return (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${typeConfig[type] || "border border-border/50 bg-white/70 text-foreground/70"}`}>
                {type}
            </span>
        )
    }

    const creditCount = transactions.filter((t) => t.type === "credit").length
    const debitCount = transactions.filter((t) => t.type === "debit").length
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const averagePlatformShare = transactions.length
        ? transactions.reduce((sum, t) => sum + (t.platformShare || 0), 0) / transactions.length
        : 0

    const summaryCards = [
        {
            label: "Total transactions",
            value: pagination.totalTransactions,
            accent: "from-secondary/20 via-white to-[#6d7aff22]",
        },
        {
            label: "Credits",
            value: creditCount,
            accent: "from-accent/20 via-white to-[#38f9d720]",
        },
        {
            label: "Debits",
            value: debitCount,
            accent: "from-[#fda4af33] via-white to-[#fee2e240]",
        },
        {
            label: "Avg platform share",
            value: `$${averagePlatformShare.toFixed(2)}`,
            accent: "from-primary/15 via-white to-[#2e2f4620]",
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-[var(--radius)] border border-border/60 bg-white/80 p-6 shadow-[0_32px_100px_rgba(46,47,70,0.18)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                            Revenue & coin economy
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">Transactions</h1>
                        <p className="mt-2 max-w-xl text-sm text-foreground/70">
                            Track coin flows, platform share, and premium swap purchases powering TechSwap’s growth.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        <span className="rounded-full border border-border/50 bg-white/80 px-4 py-2">
                            Volume (page) · ${totalVolume.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className="relative overflow-hidden rounded-[calc(var(--radius)/1.4)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_90px_rgba(46,47,70,0.22)]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-90`} />
                            <div className="relative">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">{card.value ?? 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Table Filters */}
            <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
                <CardHeader className="border-b border-border/40">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-xl font-semibold text-foreground">Transactions list</CardTitle>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 sm:w-64"
                                />
                            </div>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Items per page */}
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
                            <span className="ml-3 text-sm text-muted-foreground">Loading transactions…</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Platform Share</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.length > 0 ? (
                                            transactions.map((t) => (
                                                <TableRow key={t._id} className="transition-colors hover:bg-secondary/10">
                                                    <TableCell className="py-3 text-sm text-foreground/70">{formatDate(t.createdAt)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <p className="text-sm font-semibold text-foreground">{t.fromUserId?.name || "N/A"}</p>
                                                        <p className="text-xs text-foreground/60">{t.fromUserId?.email || ""}</p>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <p className="text-sm font-semibold text-foreground">{t.toUserId?.name || "N/A"}</p>
                                                        <p className="text-xs text-foreground/60">{t.toUserId?.email || ""}</p>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs text-sm text-foreground/70">{t.description || "N/A"}</TableCell>
                                                    <TableCell>{getTypeBadge(t.type)}</TableCell>
                                                    <TableCell className="text-right text-sm font-semibold text-foreground">{formatCurrency(t.amount)}</TableCell>
                                                    <TableCell className="text-right text-sm font-semibold text-secondary">{formatCurrency(t.platformShare)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="7" className="py-10 text-center text-muted-foreground">
                                                    No transactions found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {transactions.length > 0 && (
                                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                        Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalTransactions} total)
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
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
                                                            onClick={() => handlePageChange(pageNumber)}
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
                                            onClick={() => handlePageChange(currentPage + 1)}
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
        </div>
    )
}

export default TransactionPage
