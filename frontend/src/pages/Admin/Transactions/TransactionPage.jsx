import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Loader2,
} from "lucide-react";

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTransactions: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, [currentPage, debouncedSearch, typeFilter, itemsPerPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                type: typeFilter,
            };

            const response = await axios.get(
                "http://localhost:5000/admin/transactions",
                { params }
            );

            if (response.data.success) {
                setTransactions(response.data.data.transactions);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    const handlePageChange = (newPage) => setCurrentPage(newPage);
    const handleTypeFilterChange = (value) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        Transactions
                    </h1>
                    <p className="text-gray-500 text-sm">
                        View, filter, and manage all user transactions on the platform.
                    </p>
                </div>
            </div>

            {/* Transactions Table Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle className="text-lg font-semibold">Transactions List</CardTitle>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Items per page */}
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={handleItemsPerPageChange}
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
                            <span className="ml-2 text-gray-600">Loading transactions...</span>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="text-left py-3 px-4">Date</th>
                                            <th className="text-left py-3 px-4">Description</th>
                                            <th className="text-left py-3 px-4">From</th>
                                            <th className="text-left py-3 px-4">To</th>
                                            <th className="text-left py-3 px-4">Type</th>
                                            <th className="text-right py-3 px-4">Amount</th>
                                            <th className="text-right py-3 px-4">Platform Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length > 0 ? (
                                            transactions.map((t) => (
                                                <tr
                                                    key={t._id}
                                                    className="border-t hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 px-4">{formatDate(t.createdAt)}</td>
                                                    <td className="py-3 px-4">{t.description || "N/A"}</td>
                                                    <td className="py-3 px-4">{t.fromUserId?.name || "N/A"}</td>
                                                    <td className="py-3 px-4">{t.toUserId?.name || "N/A"}</td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === "credit"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium">
                                                        {formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-purple-600">
                                                        {formatCurrency(t.platformShare)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-gray-500">
                                                    No transactions found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {transactions.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-gray-600">
                                        Showing page {pagination.currentPage} of {pagination.totalPages} (
                                        {pagination.totalTransactions} total)
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
                                                const pageNumber = index + 1;
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === pagination.totalPages ||
                                                    (pageNumber >= currentPage - 1 &&
                                                        pageNumber <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={
                                                                currentPage === pageNumber ? "default" : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNumber)}
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
                                                    return (
                                                        <span key={pageNumber} className="px-2">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return null;
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
    );
};

export default TransactionPage;
