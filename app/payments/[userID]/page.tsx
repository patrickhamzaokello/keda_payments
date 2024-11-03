"use client"
import { useState, useEffect } from 'react';
import { PaymentOrderRequest, MwonyaPaymentDetails, UserDataResponse, UserDetails } from "@/types/payment";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchUserDetails, handlePaymentRequest, postMwonyaOrder } from '@/app/actions/payments/handlePaymentRequest';
import Image from 'next/image';

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
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const productDetails: ProductDetails = {
    name: "Premium Subscription",
    price: 500.00,
    currency: "UGX",
    description: "1 Month Premium Access to All Features"
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

  const created_order_id = generateOrderId();

  

  const paymentMwonyaData: MwonyaPaymentDetails = {
    merchant_reference: created_order_id,
    userId: userID,
    amount: 2500,
    currency: "UGX",
    subscriptionType: "1 day pass",
    subscriptionTypeId: "1day",
    paymentCreatedDate: new Date().toISOString(),
    planDuration: 1,
    planDescription: "payment for subscription"
  };




  const handlePaymentSubmission = async () => {
    setProcessingPayment(true);
    setError(null);

    try {
      const mwonyaResponse = await postMwonyaOrder(paymentMwonyaData)
      if (!mwonyaResponse.success) {
        setError(mwonyaResponse.error || 'Failed to post to mwonya');
        return; 
      }
      const pesapalResponse = await handlePaymentRequest(paymentRequestData);
      if (!pesapalResponse.success) {
        setError(pesapalResponse.error || 'Failed to post to pesapal');
        return; 
      } 
      setRedirectUrl(pesapalResponse.redirect_url || null);

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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchUserDetails(userID);
        if (!data.error) {
          setUserDetails(data.userDetails[0]);
        } else {
          setError('Failed to retrieve user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('An error occurred while fetching user details');
      }
    };

    fetchDetails();
  }, [userID]);

  const paymentRequestData: PaymentOrderRequest = {
    id: created_order_id,
    currency: "UGX",
    amount: 500.00,
    cancellation_url: "",
    description: "Payment description goes here",
    callback_url: "https://payments.mwonya.com/confirm_payment",
    redirect_mode: "",  // Optional field that could be filled based on your requirements
    notification_id: "e523e059-f93b-43ef-9e2b-dd2fb3d7497e",
    branch: "Mwonya Payments- HQ",
    billing_address: {
      email_address:  userDetails?.email?? "",
      phone_number: "0723xxxxxx",
      country_code: "UG",
      first_name: userDetails?.lastName?? "",
      last_name: userDetails?.lastName?? "",
      line_1: "Kampala, uganda",
    }
  };

  return (
    <div className="container mx-auto max-w-md py-8">
    {/* Display user details if available */}
    {userDetails && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">User Details</h2>
          <p><strong>Username:</strong> {userDetails.firstName}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <Image width={15} height={15} src={userDetails.profilePic} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
        </div>
      )}
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