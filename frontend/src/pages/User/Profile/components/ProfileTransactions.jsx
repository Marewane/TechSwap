import React from 'react';

const StatusBadge = ({ status }) => {
    const base = 'px-2 py-0.5 rounded text-xs font-medium';
    const map = {
        completed: 'bg-green-50 text-green-700 border border-green-200',
        pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        failed: 'bg-red-50 text-red-700 border border-red-200',
    };
    return <span className={`${base} ${map[status] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>{status}</span>;
};

const TypeBadge = ({ type }) => {
    const base = 'px-2 py-0.5 rounded text-xs font-medium';
    const map = {
        credit: 'bg-blue-50 text-blue-700 border border-blue-200',
        debit: 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    return <span className={`${base} ${map[type] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>{type}</span>;
};

const formatAmount = (amount) => {
    try {
        return Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    } catch {
        return amount;
    }
};

const ProfileTransactions = ({ balance, transactions = [] }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Wallet Balance</h2>
                        <p className="text-sm text-gray-500">Your current coin balance</p>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{balance || 0} Coins</div>
                </div>
            </div>

            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                </div>
                {transactions.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">No transactions yet.</p>
                ) : (
                    <div className="divide-y">
                        {transactions.map((tx) => (
                            <div key={tx._id || tx.id} className="p-4 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {tx.description || (tx.type === 'credit' ? 'Credit' : 'Debit')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TypeBadge type={tx.type} />
                                    <StatusBadge status={tx.status} />
                                    <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{formatAmount(tx.amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileTransactions;


