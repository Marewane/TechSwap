// NotificationPage.jsx - FIXED VERSION WITH PERSISTENT STATE
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, X, Clock, Mail, CheckCircle, CreditCard, Coins, AlertCircle, UserCheck, UserX, Loader2, Calendar } from "lucide-react";

// Normalize avatar URLs (handles relative paths from backend)
const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/?api\/?$/, "");
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Payment Confirmation Modal Component
const PaymentConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  swapDetails 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Confirm Payment Validation
          </h3>
          <p className="text-gray-600 mb-4">
            This will deduct <strong>50 coins</strong> from your wallet to validate the swap session.
          </p>
          {swapDetails && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p><strong>Session:</strong> {swapDetails.title}</p>
              <p><strong>Duration:</strong> {swapDetails.duration} minutes</p>
              <p><strong>Scheduled:</strong> {new Date(swapDetails.scheduledTime).toLocaleString()}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Insufficient Coins Modal Component
const InsufficientCoinsModal = ({ 
  isOpen, 
  onClose, 
  onBuyCoins,
  loading,
  currentBalance,
  requiredCoins,
  swapDetails 
}) => {
  if (!isOpen) return null;

  const coinsNeeded = requiredCoins - currentBalance;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Insufficient Coins
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">
                Current Balance: {currentBalance} coins
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">
                Required: {requiredCoins} coins
              </span>
            </div>
            <p className="text-orange-700 text-sm">
              You need <strong>{coinsNeeded} more coins</strong> to validate this session.
            </p>
          </div>
          
          {swapDetails && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p><strong>Session:</strong> {swapDetails.title}</p>
              <p><strong>Duration:</strong> {swapDetails.duration} minutes</p>
              <p><strong>Scheduled:</strong> {new Date(swapDetails.scheduledTime).toLocaleString()}</p>
            </div>
          )}

          <p className="text-gray-600 mb-4 text-sm">
            Purchase coins to complete your payment and join the swap session.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onBuyCoins}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Coins className="h-4 w-4 mr-2" />
              )}
              {loading ? "Redirecting..." : `Buy ${coinsNeeded}+ Coins`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Payment Success Modal Component
const PaymentSuccessModal = ({ 
  isOpen, 
  onClose, 
  message,
  sessionDetails 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          
          {sessionDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Session Scheduled</span>
              </div>
              <p className="text-green-700 text-sm">
                Your swap session is confirmed for {new Date(sessionDetails.scheduledTime).toLocaleString()}
              </p>
            </div>
          )}
          
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Action Feedback Component
const ActionFeedback = ({ type, userName, message, sessionDetails }) => {
  const getFeedbackConfig = () => {
    switch (type) {
      case "accepted":
        return {
          icon: UserCheck,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconColor: "text-green-600",
          defaultMessage: `You accepted ${userName}'s swap request`
        };
      case "rejected":
        return {
          icon: UserX,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          iconColor: "text-red-600",
          defaultMessage: `You rejected ${userName}'s swap request`
        };
      case "payment_success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconColor: "text-green-600",
          defaultMessage: "Payment validated successfully!"
        };
      case "payment_processing":
        return {
          icon: Loader2,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          iconColor: "text-blue-600 animate-spin",
          defaultMessage: "Processing payment validation..."
        };
      default:
        return {
          icon: CheckCircle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          iconColor: "text-gray-600",
          defaultMessage: "Action completed"
        };
    }
  };

  const config = getFeedbackConfig();
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-2 mt-3 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
      <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
      <div>
        <span className={`font-medium ${config.textColor}`}>
          {message || config.defaultMessage}
        </span>
        {sessionDetails && type === "payment_success" && (
          <p className={`text-sm mt-1 ${config.textColor}`}>
            Session scheduled for {new Date(sessionDetails.scheduledTime).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState("");
  const [selectedSwapRequest, setSelectedSwapRequest] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [swapDetails, setSwapDetails] = useState(null);
  const [walletInfo, setWalletInfo] = useState({ currentBalance: 0, requiredCoins: 50 });
  const [actionFeedback, setActionFeedback] = useState({});
  const [processingActions, setProcessingActions] = useState({});
  const [unreadCount, setUnreadCount] = useState(0); // kept for compatibility, not shown in UI
  const navigate = useNavigate();

  // Fetch notifications, then silently mark them as read
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const notificationsData = res.data || [];
      setNotifications(notificationsData);
      
      // Calculate initial unread count
      const unread = notificationsData.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications().then(async () => {
      try {
        await api.post('/notifications/read-all');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        window.dispatchEvent(new Event('notifications:read-all'));
      } catch (e) {
        console.warn('Failed to mark all as read on mount', e?.response?.data || e.message);
      }
    });
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Check if notification should show payment validation button
  const shouldShowPaymentButton = (notification) => {
    const isPaymentEligible = notification.type === 'swap_accepted' || notification.type === 'payment';
    const meta = notification.swapMeta;

    if (!isPaymentEligible || !meta) return false;

    const youNeedToPay = (meta.youAreRequester && !meta.requesterPaid) || (meta.youAreOwner && !meta.ownerPaid);

    return meta.status === 'accepted' && youNeedToPay &&
           !actionFeedback[notification._id] &&
           !processingActions[notification._id];
  };

  // Payment validation flow with better UX
  const handleValidatePayment = async (swapRequestId, notificationId) => {
    setSelectedSwapRequest(swapRequestId);
    setSelectedNotificationId(notificationId);
    setProcessingPayment(swapRequestId);
    
    // Set processing state for this notification
    if (notificationId) {
      setProcessingActions(prev => ({
        ...prev,
        [notificationId]: 'payment_check'
      }));
    }
    
    try {
      console.log("Checking wallet balance for swap:", swapRequestId);
      
      // First, check if user has sufficient coins
      const { data } = await api.get(`/swap-requests/${swapRequestId}/wallet-check`);
      console.log("Wallet check response:", data);

      if (data.hasSufficientCoins) {
        // User has enough coins - show confirmation modal
        setSwapDetails(data.swapDetails);
        setShowPaymentModal(true);
      } else {
        // Insufficient coins - show modal with option to buy coins
        setWalletInfo({
          currentBalance: data.currentBalance,
          requiredCoins: data.requiredCoins
        });
        setSwapDetails(data.swapDetails);
        setShowInsufficientCoinsModal(true);
      }
      
    } catch (error) {
      console.error('Payment validation check failed:', error);
      alert('Payment check failed: ' + (error.response?.data?.message || error.message));
      
      // Remove processing state on error
      if (notificationId) {
        setProcessingActions(prev => {
          const newProcessing = { ...prev };
          delete newProcessing[notificationId];
          return newProcessing;
        });
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle coin payment confirmation
  const handleCoinPaymentConfirm = async () => {
    if (!selectedSwapRequest || !selectedNotificationId) return;
    
    // Set processing state
    setProcessingPayment(selectedSwapRequest);
    setProcessingActions(prev => ({
      ...prev,
      [selectedNotificationId]: 'payment_processing'
    }));

    try {
      const { data } = await api.post(`/swap-requests/${selectedSwapRequest}/validate-coin-payment`);
      
      // ✅ 1. CLOSE MODAL
      setShowPaymentModal(false);
      
      // ✅ 2. UPDATE NOTIFICATION LIST IMMEDIATELY - mark as read and update content
      setNotifications(prev => 
        prev.map(n => 
          n._id === selectedNotificationId 
            ? { 
                ...n, 
                content: `${n.content} ✅ Payment completed.`,
                isRead: true 
              } 
            : n
        )
      );

      // ✅ 3a. BROADCAST WALLET BALANCE UPDATE FOR NAVBAR (immediate UI sync)
      try {
        if (typeof window !== 'undefined' && data?.newBalance !== undefined) {
          window.dispatchEvent(new CustomEvent('wallet:update', { detail: { balance: data.newBalance } }));
        }
      } catch {}

      // ✅ 3b. SHOW ACTION FEEDBACK IN NOTIFICATION
      setActionFeedback(prev => ({
        ...prev,
        [selectedNotificationId]: {
          type: "payment_success",
          message: "You have successfully validated the payment! 50 coins deducted from your wallet.",
          sessionDetails: data.sessionCreated ? {
            scheduledTime: swapDetails?.scheduledTime,
            title: swapDetails?.title
          } : null
        }
      }));

      // ✅ 4. SHOW SUCCESS MODAL IF SESSION WAS CREATED
      if (data.sessionCreated) {
        setPaymentSuccessMessage('Payment validated successfully! Your swap session has been confirmed and scheduled.');
        setShowPaymentSuccessModal(true);
      }

      // ✅ 5. REFRESH NOTIFICATIONS TO GET LATEST STATE FROM SERVER
      setTimeout(() => {
        fetchNotifications();
      }, 1000);

    } catch (error) {
      console.error('Coin payment failed:', error);
      
      // Show error feedback
      setActionFeedback(prev => ({
        ...prev,
        [selectedNotificationId]: {
          type: "error",
          message: "Payment failed: " + (error.response?.data?.message || error.message)
        }
      }));
      
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(null);
      setSelectedSwapRequest(null);
      setSelectedNotificationId(null);
      setSwapDetails(null);
      
      // Remove processing state after delay
      setTimeout(() => {
        setProcessingActions(prev => {
          const newProcessing = { ...prev };
          delete newProcessing[selectedNotificationId];
          return newProcessing;
        });
      }, 1000);
    }
  };

  // Handle buy coins redirect
  const handleBuyCoins = async () => {
    if (!selectedSwapRequest || !selectedNotificationId) return;
    
    setProcessingPayment(selectedSwapRequest);
    try {
      console.log("Redirecting to Stripe for coin purchase");
      
      const coinsNeeded = walletInfo.requiredCoins - walletInfo.currentBalance;
      const coinsToPurchase = Math.max(coinsNeeded, 50);
      
      const { data } = await api.post(`/swap-requests/${selectedSwapRequest}/stripe-payment`, {
        requiredCoins: coinsToPurchase
      });
      
      console.log("Stripe session created:", data);

      // Open Stripe in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      } else if (data.id) {
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.id}`;
        window.open(checkoutUrl, '_blank');
      } else {
        throw new Error('No Stripe session URL received');
      }

      // Close the insufficient coins modal
      setShowInsufficientCoinsModal(false);
      
      // Show feedback
      setActionFeedback(prev => ({
        ...prev,
        [selectedNotificationId]: {
          type: "info",
          message: "Coin purchase opened in new tab. After purchase, please refresh this page to validate payment."
        }
      }));
      
    } catch (error) {
      console.error('Stripe session creation failed:', error);
      alert('Failed to create payment session: ' + (error.response?.data?.message || error.message));
      setShowInsufficientCoinsModal(false);
    } finally {
      setProcessingPayment(null);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      // Update local state immediately
      setNotifications(prev =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleAction = async (notificationId, action, userName, notificationDbId) => {
    try {
      // Set processing state for this specific action
      setProcessingActions(prev => ({
        ...prev,
        [notificationDbId]: action
      }));

      let response;
      if (action === "accept") {
        response = await api.put(`/swap-requests/${notificationId}/accept`);
      } else if (action === "reject") {
        response = await api.put(`/swap-requests/${notificationId}/reject`);
      }
      
      console.log(`${action} response:`, response);

      // Show immediate feedback with "You" perspective
      const feedbackMessage = action === "accept" 
        ? `You accepted ${userName}'s swap request. They have been notified and can now proceed with payment.`
        : `You rejected ${userName}'s swap request.`;

      setActionFeedback(prev => ({
        ...prev,
        [notificationDbId]: {
          type: action === "accept" ? "accepted" : "rejected",
          message: feedbackMessage
        }
      }));

      // Mark the original notification as read
      await markAsRead(notificationDbId);
      
      // ✅ REFRESH NOTIFICATIONS TO GET LATEST STATE FROM SERVER
      setTimeout(() => {
        fetchNotifications();
      }, 500);
      
    } catch (err) {
      console.error(`Failed to ${action} swap request`, err);
      
      // Show error feedback
      setActionFeedback(prev => ({
        ...prev,
        [notificationDbId]: {
          type: "error",
          message: `Failed to ${action} request: ${err.response?.data?.message || err.message}`
        }
      }));
      
    } finally {
      // Remove processing state after a short delay
      setTimeout(() => {
        setProcessingActions(prev => {
          const newProcessing = { ...prev };
          delete newProcessing[notificationDbId];
          return newProcessing;
        });
      }, 1000);
    }
  };

  // Check if a notification should show swap actions
  const shouldShowSwapActions = (notification) => {
    if (notification.type !== 'swap_request') return false;
    const meta = notification.swapMeta;
    if (!meta) return false;
    if (processingActions[notification._id] || actionFeedback[notification._id]) return false;
    return meta.status === 'pending';
  };

  const getIcon = (type) => {
    switch (type) {
      case "swap_accepted":
      case "payment":
        return <CheckCircle className="text-green-500" />;
      case "swap_rejected":
        return <Clock className="text-red-500" />;
      case "message":
        return <Mail className="text-blue-500" />;
      case "swap_request":
        return <Bell className="text-orange-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <h1 className="text-2xl font-bold">Loading notifications...</h1>
        </div>
      </div>
    );

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await fetchNotifications();
                try {
                  await api.post('/notifications/read-all');
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  setUnreadCount(0);
                  window.dispatchEvent(new Event('notifications:read-all'));
                } catch {}
              }}
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate("/home")}>
              Back to Home
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-10 text-center bg-gray-50">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const isProcessing = processingActions[n._id];
              const hasFeedback = actionFeedback[n._id];
              const showSwapActions = shouldShowSwapActions(n);
              const showPaymentButton = shouldShowPaymentButton(n);
              
              return (
                <Card
                  key={n._id}
                  className={`p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                    n.isRead ? "bg-white" : "bg-indigo-50 border-indigo-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={resolveAvatarUrl(n.sender?.avatar)} alt={n.sender?.name} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {getInitials(n.sender?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {getIcon(n.type)}
                          <p className="font-semibold text-gray-800">
                            {n.title || "New Notification"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{n.content}</p>

                      {/* Show processing state */}
                      {isProcessing && (
                        <ActionFeedback 
                          type={isProcessing === "payment_processing" ? "payment_processing" : "processing"}
                          message={
                            isProcessing === "accept" ? "Accepting request..." :
                            isProcessing === "reject" ? "Rejecting request..." :
                            isProcessing === "payment_processing" ? "Processing payment validation..." :
                            "Processing..."
                          }
                        />
                      )}

                      {/* Show action feedback if available */}
                      {hasFeedback && !isProcessing && (
                        <ActionFeedback 
                          type={hasFeedback.type} 
                          userName={n.sender?.name || "the user"}
                          message={hasFeedback.message}
                          sessionDetails={hasFeedback.sessionDetails}
                        />
                      )}

                      {/* Swap Request Actions */}
                      {showSwapActions && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => {
                              console.log("Notification DB ID:", n._id);
                              console.log("Related ID (swap request):", n.relatedId);
                              handleAction(n.relatedId, "accept", n.sender?.name, n._id);
                            }}
                            disabled={isProcessing}
                          >
                            {isProcessing === "accept" ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            {isProcessing === "accept" ? "Accepting..." : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleAction(n.relatedId, "reject", n.sender?.name, n._id)}
                            disabled={isProcessing}
                          >
                            {isProcessing === "reject" ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            {isProcessing === "reject" ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      )}

                      {/* Payment Action - For both swap_accepted AND payment type notifications */}
                      {showPaymentButton && (
                        <Button
                          onClick={() => handleValidatePayment(n.relatedId, n._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                          disabled={processingPayment === n.relatedId || isProcessing}
                        >
                          {processingPayment === n.relatedId || isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-1" />
                          )}
                          {processingPayment === n.relatedId || isProcessing ? "Checking..." : "Validate Payment"}
                        </Button>
                      )}

                      {/* Mark as Read Button - Only show if no active processing/feedback */}
                      {!n.isRead && !showSwapActions && !showPaymentButton && !hasFeedback && !isProcessing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs mt-3 text-gray-500 hover:text-indigo-600"
                          onClick={() => markAsRead(n._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSwapRequest(null);
          setSelectedNotificationId(null);
          setSwapDetails(null);
        }}
        onConfirm={handleCoinPaymentConfirm}
        loading={processingPayment === selectedSwapRequest}
        swapDetails={swapDetails}
      />

      {/* Insufficient Coins Modal */}
      <InsufficientCoinsModal
        isOpen={showInsufficientCoinsModal}
        onClose={() => {
          setShowInsufficientCoinsModal(false);
          setSelectedSwapRequest(null);
          setSelectedNotificationId(null);
          setSwapDetails(null);
        }}
        onBuyCoins={handleBuyCoins}
        loading={processingPayment === selectedSwapRequest}
        currentBalance={walletInfo.currentBalance}
        requiredCoins={walletInfo.requiredCoins}
        swapDetails={swapDetails}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModal}
        onClose={() => {
          setShowPaymentSuccessModal(false);
          setPaymentSuccessMessage("");
        }}
        message={paymentSuccessMessage}
        sessionDetails={swapDetails ? {
          scheduledTime: swapDetails.scheduledTime,
          title: swapDetails.title
        } : null}
      />
    </>
  );
};

export default NotificationsPage;