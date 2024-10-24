import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Receipt = ({ status = 'pending' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          message: 'Payment Successful',
          messageColor: 'text-green-500',
          statusBadge: 'bg-green-50 text-green-700',
          statusText: 'Successful'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          message: 'Payment Failed',
          messageColor: 'text-red-500',
          statusBadge: 'bg-red-50 text-red-700',
          statusText: 'Failed'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          message: 'Payment Pending',
          messageColor: 'text-yellow-500',
          statusBadge: 'bg-yellow-50 text-yellow-700',
          statusText: 'Pending'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white font-mono text-sm space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-light tracking-wider mb-2">RECEIPT</h2>
        <div className="flex items-center justify-center gap-2">
          {statusConfig.icon}
          <p className={`text-xs ${statusConfig.messageColor}`}>{statusConfig.message}</p>
        </div>
      </div>

      {/* Amount Section */}
      <div className="text-center py-6 border-b border-gray-100">
        <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Amount</span>
        <div className={`text-3xl font-bold tracking-tight ${status === 'failed' ? 'line-through text-gray-400' : ''}`}>
          UGX {payment_amount}
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-4 py-6 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 uppercase text-xs tracking-wider block mb-1">Method</span>
            <span className="font-semibold">{payment_method}</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-xs tracking-wider block mb-1">Account</span>
            <span className="font-semibold">{payment_account}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 uppercase text-xs tracking-wider block mb-1">Date</span>
            <span>{transaction_date}</span>
          </div>
        </div>
      </div>

      {/* Reference Numbers */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-md">
        <div className="space-y-2">
          <span className="text-gray-500 uppercase text-xs tracking-wider block">Transaction Details</span>
          <div className="grid gap-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Tracking ID</span>
              <span className="font-medium bg-white px-3 py-1.5 rounded">{order_tracking_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Reference</span>
              <span className="font-medium bg-white px-3 py-1.5 rounded">{merchant_reference}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="pt-4">
        <div className="flex justify-between items-center border border-gray-200 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase text-xs tracking-wider">Status</span>
            <span className={`${statusConfig.statusBadge} px-2 py-1 rounded-full text-xs font-medium`}>
              {statusConfig.statusText}
            </span>
          </div>
          <span className="bg-black text-white text-xs px-3 py-1.5 rounded">
            #{confirmation_code}
          </span>
        </div>
      </div>

      {/* Additional Message for Failed/Pending */}
      {status !== 'success' && (
        <div className={`text-center text-sm ${
          status === 'failed' ? 'text-red-500' : 'text-yellow-500'
        }`}>
          {status === 'failed' 
            ? 'Please try again or contact support if the problem persists.'
            : 'Please wait while we confirm your payment...'}
        </div>
      )}
    </div>
  );
};

export default Receipt;