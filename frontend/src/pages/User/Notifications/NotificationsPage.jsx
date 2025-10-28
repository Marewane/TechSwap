// frontend/src/pages/User/Notifications/NotificationsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle, Clock, Mail, Check, X } from "lucide-react";
import { clearSuccess, clearError } from "@/features/posts/postsSlice";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleAction = async (notificationId, action) => {
    try {
      if (action === 'accept') {
        await api.post(`/swap-requests/${notificationId}/accept`);
      } else if (action === 'reject') {
        await api.post(`/swap-requests/${notificationId}/reject`);
      }

      // Mark notification as read after action
      await markAsRead(notificationId);

      // Refresh list
      const res = await api.get("/notifications");
      setNotifications(res.data || []);

    } catch (err) {
      console.error(`Failed to ${action} swap request`, err);
      alert(`Failed to ${action} swap request`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "swap_accepted":
        return <CheckCircle className="text-green-500" />;
      case "swap_rejected":
        return <Clock className="text-red-500" />;
      case "session":
        return <Bell className="text-blue-500" />;
      case "message":
        return <Mail className="text-indigo-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/home")}
          className="text-sm"
        >
          Back to Home
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-4 transition-all ${
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200 border-l-4"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10 mt-0.5">
                  <AvatarImage src={n.sender?.avatar} alt={n.sender?.name || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {getInitials(n.sender?.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <p className="font-semibold text-gray-900 mt-1">{n.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{n.content}</p>

                  {/* Action Buttons for Swap Requests */}
                  {n.type === "swap_accepted" && !n.isRead && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(n.relatedId, 'accept')}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(n.relatedId, 'reject')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Mark as Read Button */}
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(n._id)}
                      className="text-xs mt-2"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;