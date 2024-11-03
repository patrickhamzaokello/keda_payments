"use client";
import { useState, useEffect } from 'react';
import { PaymentOrderRequest, MwonyaPaymentDetails, UserDetails } from "@/types/payment";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchUserDetails, handlePaymentRequest, postMwonyaOrder } from '@/app/actions/payments/handlePaymentRequest';
import Image from 'next/image';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [
    { id: "daily", name: "Daily Pass", price: 500, duration: 1 },
    { id: "weekly", name: "Weekly Pass", price: 2500, duration: 7 },
    { id: "monthly", name: "Monthly Pass", price: 8000, duration: 30 }
  ];

  const sharedFeatures = [
    "Full content access",
    "HD streaming quality",
    "Multiple device support",
    "Offline downloads"
  ];

  // Rest of the functions remain the same
  const generateOrderId = (): string => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handlePaymentSubmission = async (plan: SubscriptionPlan) => {
    setProcessingPayment(true);
    setError(null);
    setSelectedPlan(plan.id);
    const orderId = generateOrderId();

    try {
      const mwonyaPaymentData: MwonyaPaymentDetails = {
        merchant_reference: orderId,
        userId: userID,
        amount: plan.price,
        currency: "UGX",
        subscriptionType: `${plan.duration} day pass`,
        subscriptionTypeId: plan.id,
        paymentCreatedDate: new Date().toISOString(),
        planDuration: plan.duration,
        planDescription: `${plan.name} subscription`
      };

      const paymentRequestData: PaymentOrderRequest = {
        id: orderId,
        currency: "UGX",
        amount: plan.price,
        description: `${plan.name} Subscription`,
        callback_url: "https://payments.mwonya.com/confirm_payment",
        notification_id: "e523e059-f93b-43ef-9e2b-dd2fb3d7497e",
        branch: "Mwonya Payments- HQ",
        billing_address: {
          email_address: userDetails?.email ?? "",
          phone_number: "0723xxxxxx",
          country_code: "UG",
          first_name: userDetails?.firstName ?? "",
          last_name: userDetails?.lastName ?? "",
          line_1: "Kampala, uganda",
        }
      };

      const mwonyaResponse = await postMwonyaOrder(mwonyaPaymentData);
      if (!mwonyaResponse.success) {
        throw new Error(mwonyaResponse.error || 'Mwonya payment failed');
      }

      const pesapalResponse = await handlePaymentRequest(paymentRequestData);
      if (!pesapalResponse.success) {
        throw new Error(pesapalResponse.error || 'Pesapal payment failed');
      }

      setRedirectUrl(pesapalResponse.redirect_url || null);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

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
        setError('Error fetching user details');
      }
    };

    fetchDetails();
  }, [userID]);

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  if (!userID?.match(/^mw[a-zA-Z0-9]+$/)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Invalid user ID format</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 bg-gray-900 min-h-screen text-gray-100">
      {/* User Profile */}
      {userDetails && (
        <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <Image
            width={40}
            height={40}
            src={userDetails.profilePic}
            alt="Profile"
            className="rounded-full"
          />
          <div>
            <h2 className="font-semibold text-white">{userDetails.firstName}</h2>
            <p className="text-sm text-gray-300">{userDetails.email}</p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {redirectUrl && (
        <Alert className="bg-green-900 border-green-700">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-100">Redirecting to payment...</AlertDescription>
        </Alert>
      )}

      {/* Subscription Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className="p-4 relative bg-gray-800 border-gray-700">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="text-2xl font-bold mt-2 text-violet-400">
                {new Intl.NumberFormat('en-UG', {
                  style: 'currency',
                  currency: 'UGX'
                }).format(plan.price)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {plan.duration} day{plan.duration > 1 ? 's' : ''}
              </div>
            </div>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => handlePaymentSubmission(plan)}
              disabled={processingPayment}
            >
              {processingPayment && selectedPlan === plan.id ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Subscribe'
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Shared Features */}
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-3 text-white">All plans include:</h3>
        <ul className="grid grid-cols-2 gap-2">
          {sharedFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}