// NotificationPage.jsx - UPDATED VERSION WITH IMPROVED UX
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, X, Clock, Mail, CheckCircle, CreditCard, Coins, AlertCircle, UserCheck, UserX, Loader2 } from "lucide-react";

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
              {loading ? "Processing..." : "Confirm Validation"}
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
              <Coins className="h-4 w-4 mr-2" />
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
  message 
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
const ActionFeedback = ({ type, userName, message }) => {
  if (type === "accepted") {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <UserCheck className="h-5 w-5 text-green-600" />
        <span className="text-green-700 font-medium">
          {message || `You accepted ${userName}'s swap request`}
        </span>
      </div>
    );
  }
  
  if (type === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <UserX className="h-5 w-5 text-red-600" />
        <span className="text-red-700 font-medium">
          {message || `You rejected ${userName}'s swap request`}
        </span>
      </div>
    );
  }

  if (type === "payment_success") {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-green-700 font-medium">
          {message || "Payment validated successfully!"}
        </span>
      </div>
    );
  }
  
  return null;
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

  // Check if notification should show payment validation button
  const shouldShowPaymentButton = (notification) => {
    // Show payment button for:
    // 1. swap_accepted notifications (when your request was accepted)
    // 2. payment notifications (when the other party has paid and you need to pay)
    const isPaymentEligible = notification.type === 'swap_accepted' || notification.type === 'payment';
    
    return isPaymentEligible && 
           !notification.isRead && 
           !actionFeedback[notification._id] && 
           !processingActions[notification._id];
  };

  // payment validation flow with better UX
  const handleValidatePayment = async (swapRequestId, notificationId) => {
    setSelectedSwapRequest(swapRequestId);
    setSelectedNotificationId(notificationId);
    setProcessingPayment(swapRequestId);
    
    // Set processing state for this notification
    if (notificationId) {
      setProcessingActions(prev => ({
        ...prev,
        [notificationId]: 'payment'
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
    
    setProcessingPayment(selectedSwapRequest);
    try {
      console.log("Processing coin payment for:", selectedSwapRequest);
      
      const { data } = await api.post(`/swap-requests/${selectedSwapRequest}/validate-coin-payment`);
      console.log("Coin payment response:", data);

      // Success - close modal and show success feedback
      setShowPaymentModal(false);
      
      // Show payment success feedback
      setActionFeedback(prev => ({
        ...prev,
        [selectedNotificationId]: 'payment_success'
      }));

      // Mark notification as read
      await markAsRead(selectedNotificationId);
      
      // Refresh notifications to show updated status
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
      
      // Show success message
      setPaymentSuccessMessage('Payment validated successfully! 50 coins deducted from your wallet.');
      setShowPaymentSuccessModal(true);
      
    } catch (error) {
      console.error('Coin payment failed:', error);
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(null);
      setSelectedSwapRequest(null);
      setSelectedNotificationId(null);
      setSwapDetails(null);
    }
  };

  // Handle buy coins redirect - UPDATED to check for coins and auto-validate
  const handleBuyCoins = async () => {
    if (!selectedSwapRequest || !selectedNotificationId) return;
    
    setProcessingPayment(selectedSwapRequest);
    try {
      console.log("Redirecting to Stripe for coin purchase");
      
      const coinsNeeded = walletInfo.requiredCoins - walletInfo.currentBalance;
      // Always buy at least 50 coins or more for better user experience
      const coinsToPurchase = Math.max(coinsNeeded, 50);
      
      const { data } = await api.post(`/swap-requests/${selectedSwapRequest}/stripe-payment`, {
        requiredCoins: coinsToPurchase
      });
      
      console.log("Stripe session created:", data);

      // Open Stripe in a new tab instead of redirecting
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
      
      // Show message to user
      alert('Coin purchase opened in new tab. After purchase, please refresh this page to validate payment.');
      
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
      setNotifications((prev) =>
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

      // Show feedback immediately with custom message
      const feedbackMessage = action === "accept" 
        ? `You accepted ${userName}'s swap request. They have been notified.`
        : `You rejected ${userName}'s swap request.`;

      setActionFeedback(prev => ({
        ...prev,
        [notificationDbId]: {
          type: action,
          message: feedbackMessage
        }
      }));

      // Mark the original notification as read
      await markAsRead(notificationDbId);
      
      // Refresh notifications to get any new notifications
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
      
    } catch (err) {
      console.error(`Failed to ${action} swap request`, err);
      // Remove processing state on error
      setProcessingActions(prev => {
        const newProcessing = { ...prev };
        delete newProcessing[notificationDbId];
        return newProcessing;
      });
      
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to ${action} swap request: ${errorMessage}`);
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
    // Only show actions for unread swap_request notifications
    if (notification.type !== 'swap_request' || notification.isRead) {
      return false;
    }
    
    // Don't show actions if we're processing or have feedback
    if (processingActions[notification._id] || actionFeedback[notification._id]) {
      return false;
    }
    
    return true;
  };

  const getIcon = (type) => {
    switch (type) {
      case "swap_accepted":
      case "payment": // Use same icon for payment notifications
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
        <h1 className="text-2xl font-bold">Loading notifications...</h1>
      </div>
    );

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
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
                      <AvatarImage src={n.sender?.avatar} alt={n.sender?.name} />
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
                        <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-blue-700 font-medium">
                            {isProcessing === "accept" ? "Accepting..." : 
                             isProcessing === "reject" ? "Rejecting..." : "Processing..."}
                          </span>
                        </div>
                      )}

                      {/* Show action feedback if available */}
                      {hasFeedback && !isProcessing && (
                        <ActionFeedback 
                          type={hasFeedback.type || hasFeedback} 
                          userName={n.sender?.name || "the user"}
                          message={hasFeedback.message}
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
      />
    </>
  );
};

export default NotificationsPage;