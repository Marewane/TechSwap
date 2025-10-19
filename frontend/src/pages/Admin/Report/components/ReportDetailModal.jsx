import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, AlertCircle, MessageSquare } from "lucide-react";

const ReportDetailModal = ({ report, isOpen, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            reviewed: "bg-blue-100 text-blue-800",
            resolved: "bg-green-100 text-green-800",
        };
        return colors[status] || colors.pending;
    };

    return (
        <Dialog open={Boolean(isOpen)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Report Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <Badge className={`${getStatusColor(report?.status)} text-sm px-4 py-1`}>
                            {(report?.status || "N/A").toString().toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(report?.createdAt)}
                        </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Reporter Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{report?.reporterId?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {report?.reporterId?.email || "N/A"}
                                </p>
                            </div>
                            {report?.reporterId?.phone && (
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{report.reporterId.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reported User Info */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Reported User Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{report?.reportedUserId?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {report?.reportedUserId?.email || "N/A"}
                                </p>
                            </div>
                            {report?.reportedUserId?.phone && (
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{report.reportedUserId.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Session Info */}
                    {report?.sessionId && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-700 mb-3">Related Session</h3>
                            <div>
                                <p className="text-sm text-gray-500">Title</p>
                                <p className="font-medium">{report.sessionId.title || "N/A"}</p>
                            </div>
                            {report.sessionId?.scheduledAt && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Scheduled At</p>
                                    <p className="font-medium">{formatDate(report.sessionId.scheduledAt)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Report Reason
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{report?.reason || "N/A"}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDetailModal;
