// NotificationPage.jsx - UPDATED VERSION
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, X, Clock, Mail, CheckCircle, CreditCard, Coins, AlertCircle } from "lucide-react";

// ✅ Payment Confirmation Modal Component
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

// ✅ ADDED: Insufficient Coins Modal Component
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

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [selectedSwapRequest, setSelectedSwapRequest] = useState(null);
  const [swapDetails, setSwapDetails] = useState(null);
  const [walletInfo, setWalletInfo] = useState({ currentBalance: 0, requiredCoins: 50 });
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

  // ✅ MODIFIED: New payment validation flow with better UX
  const handleValidatePayment = async (swapRequestId) => {
    setSelectedSwapRequest(swapRequestId);
    setProcessingPayment(swapRequestId);
    
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
    } finally {
      setProcessingPayment(null);
    }
  };

  // ✅ ADDED: Handle coin payment confirmation
  const handleCoinPaymentConfirm = async () => {
    if (!selectedSwapRequest) return;
    
    setProcessingPayment(selectedSwapRequest);
    try {
      console.log("Processing coin payment for:", selectedSwapRequest);
      
      const { data } = await api.post(`/swap-requests/${selectedSwapRequest}/validate-coin-payment`);
      console.log("Coin payment response:", data);

      // Success - close modal and refresh notifications
      setShowPaymentModal(false);
      setSelectedSwapRequest(null);
      setSwapDetails(null);
      
      // Refresh notifications to show updated status
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
      
      alert('Payment validated successfully! 50 coins deducted from your wallet.');
      
    } catch (error) {
      console.error('Coin payment failed:', error);
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(null);
    }
  };

  // ✅ ADDED: Handle buy coins redirect
  const handleBuyCoins = async () => {
    if (!selectedSwapRequest) return;
    
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

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.id) {
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.id}`;
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No Stripe session URL received');
      }
      
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

  const handleAction = async (notificationId, action) => {
    try {
      if (action === "accept") {
        await api.put(`/swap-requests/${notificationId}/accept`);
      } else if (action === "reject") {
        await api.put(`/swap-requests/${notificationId}/reject`);
      }
      await markAsRead(notificationId);
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error(`Failed to ${action} swap request`, err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "swap_accepted":
        return <CheckCircle className="text-green-500" />;
      case "swap_rejected":
        return <Clock className="text-red-500" />;
      case "message":
        return <Mail className="text-blue-500" />;
      case "payment":
        return <CreditCard className="text-blue-500" />;
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
          <Button variant="outline" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-10 text-center bg-gray-50">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
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

                    {/* Swap Request Actions */}
                    {n.type === "swap_request" && !n.isRead && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => {
                            console.log("n.relatedId:", n.relatedId);
                            handleAction(n.relatedId, "accept");
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(n.relatedId, "reject")}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}

                    {/* Payment Action */}
                    {n.type === "swap_accepted" && !n.isRead && (
                      <Button
                        onClick={() => handleValidatePayment(n.relatedId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        disabled={processingPayment === n.relatedId}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        {processingPayment === n.relatedId ? "Checking..." : "Validate Payment"}
                      </Button>
                    )}

                    {/* Mark as Read Button */}
                    {!n.isRead && n.type !== "swap_request" && n.type !== "payment" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs mt-3 text-gray-500 hover:text-indigo-600"
                        onClick={() => markAsRead(n._id)}
                      >
                        Mark as read
                      </Button>
                    )}

                    {/* Mark as Read for swap requests and payments (shown after actions) */}
                    {!n.isRead && (n.type === "swap_request" || n.type === "payment") && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-gray-500 hover:text-indigo-600"
                          onClick={() => markAsRead(n._id)}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSwapRequest(null);
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
          setSwapDetails(null);
        }}
        onBuyCoins={handleBuyCoins}
        loading={processingPayment === selectedSwapRequest}
        currentBalance={walletInfo.currentBalance}
        requiredCoins={walletInfo.requiredCoins}
        swapDetails={swapDetails}
      />
    </>
  );
};

export default NotificationsPage;