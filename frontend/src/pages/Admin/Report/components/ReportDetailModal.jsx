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
            pending: "border border-[#ffb86b66] bg-[#ffb86b1f] text-[#c26b11]",
            reviewed: "border border-secondary/40 bg-secondary/15 text-secondary",
            resolved: "border border-accent/40 bg-accent/15 text-accent-foreground",
        };
        return colors[status] || colors.pending;
    };

    return (
        <Dialog open={Boolean(isOpen)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-[var(--radius)] border border-border/60 bg-card/95 shadow-[0_38px_120px_rgba(15,23,42,0.35)]">
                <DialogHeader className="border-b border-border/40 pb-4">
                    <DialogTitle className="text-xl font-semibold text-foreground">Report details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex flex-col gap-3 rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/75 p-5 shadow-[0_16px_55px_rgba(46,47,70,0.12)] md:flex-row md:items-center md:justify-between">
                        <Badge className={`${getStatusColor(report?.status)} text-[11px] font-semibold uppercase tracking-[0.18em] px-4 py-1.5`}>
                            {(report?.status || "N/A").toString().replace("-", " ").toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            <Calendar className="h-4 w-4 text-secondary" />
                            <span>{formatDate(report?.createdAt)}</span>
                        </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/75 p-5 shadow-[0_16px_55px_rgba(46,47,70,0.1)]">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <User className="h-4 w-4 text-secondary" />
                            Reporter information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Name</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{report?.reporterId?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Mail className="h-4 w-4 text-secondary" />
                                    {report?.reporterId?.email || "N/A"}
                                </p>
                            </div>
                            {report?.reporterId?.phone && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                                    <p className="mt-2 text-sm font-semibold text-foreground">{report.reporterId.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reported User Info */}
                    <div className="rounded-[calc(var(--radius)/1.6)] border border-destructive/30 bg-destructive/10 p-5 shadow-[0_16px_55px_rgba(248,113,113,0.16)]">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            Reported user information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Name</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{report?.reportedUserId?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Mail className="h-4 w-4 text-destructive" />
                                    {report?.reportedUserId?.email || "N/A"}
                                </p>
                            </div>
                            {report?.reportedUserId?.phone && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                                    <p className="mt-2 text-sm font-semibold text-foreground">{report.reportedUserId.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Session Info */}
                    {report?.sessionId && (
                        <div className="rounded-[calc(var(--radius)/1.6)] border border-secondary/40 bg-secondary/10 p-5 shadow-[0_16px_55px_rgba(109,122,255,0.16)]">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                                Related session
                            </h3>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Title</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{report.sessionId.title || "N/A"}</p>
                            </div>
                            {report.sessionId?.scheduledAt && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Scheduled at</p>
                                    <p className="mt-2 text-sm text-foreground/70">{formatDate(report.sessionId.scheduledAt)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/75 p-5 shadow-[0_16px_55px_rgba(46,47,70,0.1)]">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <MessageSquare className="h-4 w-4 text-secondary" />
                            Report reason
                        </h3>
                        <p className="text-sm text-foreground/70 whitespace-pre-wrap">{report?.reason || "N/A"}</p>
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
