"use client";
import { useState, useEffect } from 'react';
import { PaymentOrderRequest, MwonyaPaymentDetails, UserDetails } from "@/types/payment";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader, ChevronRight } from 'lucide-react';
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
    "Exclusive Tracks",
    "Full content access",
    "High quality audio",
    "Offline downloads",
    "Free Artists Circle's Membership",
    "No Ads",
    "Multiple device support",

  ];

  // Existing functions remain the same
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
          phone_number: "xxxxxx",
          country_code: "UG",
          first_name: userDetails?.firstName ?? "",
          last_name: userDetails?.lastName ?? "",
          line_1: "Kampala, uganda",
        }
      };

      // Execute both requests concurrently
      const [mwonyaResponse, pesapalResponse] = await Promise.all([
        postMwonyaOrder(mwonyaPaymentData),
        handlePaymentRequest(paymentRequestData)
      ]);

      // Check responses and handle errors
      if (!mwonyaResponse.success) {
        throw new Error(mwonyaResponse.error || 'Failed to post to mwonya');
      }

      if (!pesapalResponse.success || !pesapalResponse.redirect_url) {
        throw new Error(pesapalResponse.error || 'Failed to get payment URL');
      }

      // Immediate redirect
      // window.location.href = pesapalResponse.redirect_url;

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
      }, 500);
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
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold text-zinc-100">Choose Your Plan</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Select the perfect subscription that suits your needs
          </p>
        </div>

        {/* User Profile Card */}
        {userDetails && (
          <Card className="p-4 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 ring-2 ring-zinc-700 rounded-full">
                <Image
                  fill
                  src={userDetails.profilePic}
                  alt="Profile"
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-100">{userDetails.firstName}</h2>
                <p className="text-sm text-zinc-400">{userDetails.email}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts */}
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
          
          {redirectUrl && (
            <Alert className="bg-violet-900 border-violet-800">
              <CheckCircle className="h-4 w-4 text-violet-400" />
              <AlertDescription className="text-violet-400">Redirecting to payment...</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300
                ${selectedPlan === plan.id ? 
                  'bg-zinc-800 border-2 border-zinc-600' : 
                  'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80'}
              `}
            >
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-zinc-100">{plan.name}</h3>
                  <div className="mt-4 space-y-1">
                    <span className="text-3xl font-bold text-zinc-100">
                      {new Intl.NumberFormat('en-UG', {
                        style: 'currency',
                        currency: 'UGX'
                      }).format(plan.price)}
                    </span>
                    <p className="text-sm text-zinc-400">
                      {plan.duration} day{plan.duration > 1 ? 's' : ''} access
                    </p>
                  </div>
                </div>

                <Button
                  className={`w-full transition-colors duration-300
                    ${processingPayment && selectedPlan === plan.id ?
                      'bg-zinc-700' :
                      'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1'
                    }`}
                  onClick={() => handlePaymentSubmission(plan)}
                  disabled={processingPayment}
                >
                  {processingPayment && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Subscribe</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card className="mt-12 p-8 bg-zinc-900 border-zinc-800">
          <h3 className="text-xl font-semibold text-zinc-100 mb-6">All plans include:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sharedFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50"
              >
                <CheckCircle className="h-5 w-5 text-zinc-400" />
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}