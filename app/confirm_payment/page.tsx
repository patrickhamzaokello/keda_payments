"use client"
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Assuming you're using Next.js
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handlePaymentStatusRequest } from '../actions/payment_status/handlePaymentStatusRequest';
export default function CheckStatusPage() {
    const searchParams = useSearchParams(); // Used to get query params from the URL
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');

    const [error, setError] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<number | null>(null);
    const [payment_account, setPayment_account] = useState<string | null>(null);
    const [payment_amount, setPayment_amount] = useState<string | null>(null);
    const [payment_method, setPayment_method] = useState<string | null>(null);
    const [confirmation_code, setConfirmation_code] = useState<string | null>(null);
    const [order_tracking_id, setOrder_tracking_id] = useState<string | null>(null);
    const [merchant_reference, setMerchant_reference] = useState<string | null>(null);
    const [payment_message, setPayment_message] = useState<string | null>(null);
    const [transaction_date, setTransaction_date] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (orderTrackingId && orderMerchantReference) {
            checkOrderStatus(orderTrackingId, orderMerchantReference);
        } else {
            setError('Missing Payment tracking or merchant reference in the URL.');
        }
    }, [orderTrackingId, orderMerchantReference]);

    const checkOrderStatus = async (trackingId: string, merchantReference: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await handlePaymentStatusRequest(trackingId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to check Payment status');
            }

            const statusResponse = response;
            setOrderStatus(statusResponse.code ?? null); // Assuming the response has a 'status' field
            setPayment_account(statusResponse.account ?? null);
            setPayment_amount(statusResponse.totalAmount?.toString() ?? null);
            setPayment_method(statusResponse.method ?? null);
            setConfirmation_code(statusResponse.confirmation ?? null);
            setOrder_tracking_id(statusResponse.trackingId ?? null);
            setMerchant_reference(statusResponse.merchantReference ?? null);
            setPayment_message(statusResponse.message ?? null);
            setTransaction_date(statusResponse.dateCreated ?? null);


        } catch (error) {
            console.error('Error fetching Payment status:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className={`text-center text-sm ${status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                        {status === 'failed'
                            ? 'Please try again or contact support if the problem persists.'
                            : 'Please wait while we confirm your payment...'}
                    </div>
                )}
            </div>
        );
    };


    function onRetry(): void {
        if (orderTrackingId && orderMerchantReference) {
            checkOrderStatus(orderTrackingId, orderMerchantReference);
        } else {
            setError('Missing Payment tracking or merchant reference in the URL.');
        }
    }

    return (
        <div className="container mx-auto max-w-md py-8">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold text-center">
                        Payment Status
                    </h1>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <Loader className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                <Button className="w-full" onClick={onRetry}>
                                    Retry Checking Status
                                </Button>
                            </div>
                        )}

                        {/* 0 - INVALID,  1 - COMPLETED, 2 - FAILED, 3 - REVERSED */}

                        {/* Order Status */}
                        {!loading && !error && orderStatus && (
                            <>
                                {/* Success State */}
                                {orderStatus === 1 && (
                                    <Receipt status="success" />
                                )}

                                {/* Failed State */}
                                {orderStatus === 2 && (
                                    <div className="space-y-4">
                                        <Receipt status="failed" />
                                        <Button
                                            className="w-full mt-4"
                                            onClick={onRetry}
                                            variant="destructive"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {/* Reversed State */}
                                {orderStatus === 3 && (
                                    <div className="space-y-4">
                                        <Receipt status="pending" />
                                        <Button
                                            className="w-full mt-4"
                                            onClick={onRetry}
                                            variant="secondary"
                                        >
                                            Check Again
                                        </Button>
                                    </div>
                                )}

                                {/* Invalid State */}
                                {orderStatus === 0 && (
                                    <div className="space-y-4">
                                        <Receipt status="pending" />
                                        <Button
                                            className="w-full mt-4"
                                            onClick={onRetry}
                                            variant="secondary"
                                        >
                                            Check Again
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
