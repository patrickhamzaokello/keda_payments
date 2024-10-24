"use client"
import { useState, useEffect } from 'react';
import { PaymentOrderRequest } from "@/types/payment";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Decimal from 'decimal.js';
import { handlePaymentRequest } from '@/app/actions/payments/handlePaymentRequest';

interface ProductDetails {
  name: string;
  price: number;
  currency: string;
  description: string;
}

export default function UserPaymentsPage({
  params,
  searchParams,
}: {
  params: { userID: string; artistID: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userID, artistID } = params;
  const amountString = searchParams.amount as string | undefined;

  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const productDetails: ProductDetails = {
    name: "Artist Circle Subscription",
    price: 500.00,
    currency: "UGX",
    description: "Enjoy Artist Exclusive features"
  };

  const formattedPrice = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: productDetails.currency
  }).format(productDetails.price);

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
    callback_url: "https://payments.mwonya.com/confirm_payment",
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
      const orderDetails = createOrderRequest(productDetails);
      // Call the server action
      const response = await handlePaymentRequest(orderDetails);
      if (response.success) {
        setRedirectUrl(response.redirect_url || null);
      } else {
        setError(response.error || 'An unexpected error occurred');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  const isValidAmount = (amt: string | undefined): boolean => {
    if (!amt) return false;
    try {
      const decimalAmount = new Decimal(amt);
      return decimalAmount.isPositive() && decimalAmount.decimalPlaces() <= 2;
    } catch {
      return false;
    }
  };

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
// validate artist
  if (!artistID?.match(/^martist[a-zA-Z0-9]+$/)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid Aritst ID format. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if(!isValidAmount(amountString)){
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid Amount Value. Please check the URL and try again.
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
          <div className="space-y-4">
            {/* Product Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">
                {productDetails.name}
              </h2>
              <p className="text-gray-600 text-sm mb-3">
                {productDetails.description}
              </p>
              <div className="text-xl font-bold">
                {formattedPrice}
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