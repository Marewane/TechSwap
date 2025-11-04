import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import api from '@/services/api';

export default function ChatRoomPayment({ chatRoomId, currentUser }) {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { balance, loading: walletLoading } = useWallet();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get(`/api/chat/payment-status?chatRoomId=${chatRoomId}`);
        setHasPaid(res.data.hasPaid);
      } catch (error) {
        console.error('Failed to check payment status',error);
      }
    };
    checkStatus();
  }, [chatRoomId]);

  const handleValidatePayment = async () => {
    if (balance < 50) {
      alert('❌ Insufficient balance. You need 50 coins to join.');
      return;
    }

    if (!window.confirm('Are you sure? This will deduct 50 coins from your wallet.')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/payments/session', { chatRoomId });
      alert('✅ Payment validated! You’re all set for the session.');
      setHasPaid(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed. Please try again.';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (hasPaid) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-yellow-800">🔒 Confirm Your Commitment</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Validate your payment to confirm this skill swap session.
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            💰 Your balance: <span className="font-mono">{walletLoading ? '...' : balance}</span> coins
            {balance < 50 && (
              <span className="ml-2 text-red-600">(⚠️ Need 50 coins)</span>
            )}
          </p>
        </div>
        <Button
          onClick={handleValidatePayment}
          disabled={loading || balance < 50}
          className="ml-4"
        >
          {loading ? 'Processing...' : 'Validate Payment (50 coins)'}
        </Button>
      </div>
    </div>
  );
}