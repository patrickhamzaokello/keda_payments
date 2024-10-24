"use client"
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Assuming you're using Next.js
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handlePaymentStatusRequest } from '../actions/payment_status/handlePaymentStatusRequest';

export default function CheckStatusPage() {
    const searchParams = useSearchParams(); // Used to get query params from the URL
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');

    const [error, setError] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
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
                throw new Error(response.error  || 'Failed to check Payment status');
            }

            const statusResponse = await response.orderStatusResponse;
            setOrderStatus(statusResponse?.statusCode); // Assuming the response has a 'status' field
            setPayment_account(statusResponse?.paymentAccount);
            setPayment_amount(statusResponse?.amount.toString());
            setPayment_method(statusResponse?.paymentMethod);
            setConfirmation_code(statusResponse?.confirmationCode);
            setOrder_tracking_id(statusResponse?.orderTrackingId);
            setMerchant_reference("merchange_no");
            setPayment_message("message");
            setTransaction_date(new Date(statusResponse?.createdDate).toLocaleString());

        } catch (error) {
            console.error('Error fetching Payment status:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const Receipt = () => (
        <div className="bg-white p-8 font-mono text-sm space-y-6 border border-gray-100">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-light tracking-wider mb-2">RECEIPT</h2>
                <p className="text-gray-500 text-xs">{payment_message}</p>
            </div>

            {/* Amount Section */}
            <div className="text-center py-6 border-b border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Amount Paid</span>
                <div className="text-3xl font-bold tracking-tight">
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
                        <span className="font-bold">{orderStatus === '200' ? 'Successful' : orderStatus}</span>
                    </div>
                    <span className="bg-black text-white text-xs px-3 py-1.5 rounded">
                        #{confirmation_code}
                    </span>
                </div>
            </div>
        </div>
    );

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

                        {/* Order Status */}
                        {!loading && !error && orderStatus && (
                            orderStatus === '200' ? (
                                <Receipt />
                            ) : (
                                <div className="bg-red-50 p-6 rounded-lg space-y-2">
                                    <h2 className="font-semibold text-lg">Payment Failed</h2>
                                    <p className="text-gray-600">
                                        Status: <strong>{orderStatus}</strong>
                                    </p>
                                    <Button className="w-full mt-4" onClick={onRetry}>
                                        Try Again
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
