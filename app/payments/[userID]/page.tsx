"use client"
import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { PaymentOrderRequest } from "@/types/payment";
import { PaymentServiceError } from '@/lib/PaymentServiceError';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductDetails {
  name: string;
  price: number;
  currency: string;
  description: string;
}

export default function UserPaymentsPage({
  params,
}: {
  params: { userID: string };
}) {
  const { userID } = params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Mock product details - In real app, fetch this from API/database
  const productDetails: ProductDetails = {
    name: "Premium Subscription",
    price: 500.00,
    currency: "UGX",
    description: "1 Month Premium Access to All Features"
  };

  const generateOrderId = (): string => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.T]/g, '')
      .slice(0, 15);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ORD${timestamp}${randomNum}`;
  };

  const paymentRequestData: PaymentOrderRequest = {
    id: generateOrderId(),
    currency: "UGX",
    amount: 500.00,
    cancellation_url: "",
    description: "Payment description goes here",
    callback_url: "https://www.myapplication.com/response-page",
    redirect_mode: "",  // Optional field that could be filled based on your requirements
    notification_id: "e523e059-f93b-43ef-9e2b-dd2fb3d7497e",
    branch: "Store Name - HQ",
    billing_address: {
      email_address: "john.doe@example.com",
      phone_number: "0723xxxxxx",
      country_code: "KE",
      first_name: "John",
      middle_name: "",  // Optional
      last_name: "Doe",
      line_1: "Pesapal Limited",
      line_2: "",  // Optional
      city: "",    // Optional
      state: "",   // Optional
      postal_code: "",  // Optional
      zip_code: ""      // Optional
    }
  };

  const createOrderRequest = (product: ProductDetails): PaymentOrderRequest => (paymentRequestData);

  const handlePaymentSubmission = async () => {
    setProcessingPayment(true);
    setError(null);

    try {
      const consumerKey = process.env.NEXT_PUBLIC_CONSUMER_KEY;
      const consumerSecret = process.env.NEXT_PUBLIC_CONSUMER_SECRET;

      if (!consumerKey || !consumerSecret) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      await paymentService.authenticate({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      });

      const orderResponse = await paymentService.submitOrder(
        createOrderRequest(productDetails)
      );

      setRedirectUrl(orderResponse.redirect_url);
    } catch (error) {
      console.error('Payment submission error:', error);
      setError(
        error instanceof PaymentServiceError
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000); // Give user 2 seconds to see the success message
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  // Validation
  if (!userID?.match(/^mw[a-zA-Z0-9]+$/)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid user ID format. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">
            Complete Your Purchase
          </h1>
        </CardHeader>
        <CardContent>
          {/* Product Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">
                {productDetails.name}
              </h2>
              <p className="text-gray-600 text-sm mb-3">
                {productDetails.description}
              </p>
              <div className="text-xl font-bold">
                {productDetails.currency} {productDetails.price.toFixed(2)}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {redirectUrl && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Payment initiated! Redirecting to payment page...
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Button */}
            <Button
              className="w-full"
              onClick={handlePaymentSubmission}
              disabled={processingPayment || !!redirectUrl}
            >
              {processingPayment ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : redirectUrl ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Redirecting...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}