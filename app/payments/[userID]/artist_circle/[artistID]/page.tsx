"use client"
import { useState, useEffect } from 'react';
import { PaymentOrderRequest, MwonyaPaymentDetails, ArtistCircleDetails } from "@/types/payment";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader, Users, Calendar, Star, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Decimal from 'decimal.js';
import { fetchArtistDetails, handlePaymentRequest, postMwonyaOrder } from '@/app/actions/payments/handlePaymentRequest';
import Image from 'next/image';

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
  const [artistDetails, setArtistCircleDetails] = useState<ArtistCircleDetails | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const productDetails: ProductDetails = {
    name: "Artist Circle Subscription",
    price: parseFloat(amountString ?? ""),
    currency: "UGX",
    description: "Show Support to the Artist you love, Enjoy Artist Exclusive features"
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


  const handlePaymentSubmission = async () => {
    setProcessingPayment(true);
    setError(null);

    try {

      const mwonyaPaymentData: MwonyaPaymentDetails = {
        merchant_reference: created_order_id,
        userId: userID,
        amount: parseFloat(amountString ?? ""),
        currency: "UGX",
        subscriptionType: "artist_circle",
        subscriptionTypeId: artistID,
        paymentCreatedDate: new Date().toISOString(),
        planDuration: artistDetails?.circle_duration ?? 0,
        planDescription: `${artistDetails?.name} artist circle subscription`
      };

      const paymentRequestData: PaymentOrderRequest = {
        id: created_order_id,
        currency: "UGX",
        amount: parseFloat(amountString ?? ""),
        description: `${artistDetails?.name} artist circle subscription `,
        callback_url: "https://payments.mwonya.com/confirm_payment",
        notification_id: "e523e059-f93b-43ef-9e2b-dd2fb3d7497e",
        branch: "Mwonya Payments- HQ",
        billing_address: {
          email_address: "Email",
          phone_number: "xxxxxx",
          country_code: "UG",
          first_name: "first name",
          last_name: "last name",
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
      window.location.href = pesapalResponse.redirect_url;
    } catch (error) {
      console.error('Payment submission error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchArtistDetails(artistID);
        if (!data?.error) {
          setArtistCircleDetails(data?.artistDetails);
        } else {
          setError('Failed to retrieve user details');
        }
      } catch (error) {
        setError('Error fetching user details');
      }
    };

    fetchDetails();
  }, [artistID]);

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
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

  if (!isValidAmount(amountString)) {
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
    <div className="min-h-screen py-0">
      <div className="max-w-xl mx-auto">


        {/* Checkout Card */}
        <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800/50">
          <CardHeader>
            <h1 className="text-xl font-medium text-zinc-100 text-center">
              Join the Artist Circle
            </h1>
            <p className="text-sm text-zinc-400 text-center">Limited spots available</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Product Details */}
              <div className="rounded-xl bg-zinc-800/30 p-4 border border-zinc-700/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-medium text-zinc-200">
                      {productDetails.name}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {productDetails.description}
                    </p>
                  </div>
                  <div className="text-xl font-semibold text-zinc-100">
                    {formattedPrice}
                  </div>
                </div>

                {/* Added benefits list */}
                <ul className="space-y-2 mt-4">

                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Exclusive content and releases
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Personalized messages from the artist
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Be part of the artist Community
                  </li>
                </ul>
              </div>

              {/* Messages */}
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {redirectUrl && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment initiated! Redirecting to payment page...
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Button */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-violet-700	 to-violet-800 hover:from-violet-700 hover:violet-800 text-white font-medium py-6 shadow-lg shadow-violet-700/20 transition-all hover:shadow-xl hover:shadow-violet-700/30"
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
                    'Join Now'
                  )}
                </Button>
                <p className="text-center text-xs text-zinc-500">
                  Satisfaction guarantee • Instant access upon payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Artist Profile */}
        {artistDetails && (
          <div className="mt-8">
            <div className="relative bg-zinc-900/50 backdrop-blur-lg rounded-2xl p-6 border border-zinc-800/50 overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex items-start gap-6">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 ring-2 ring-zinc-700/50">
                    <Image
                      fill
                      src={artistDetails.profilephoto}
                      alt="Profile"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-zinc-100">
                        {artistDetails.name}
                      </h2>
                      {artistDetails.verified && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified Artist
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-400">{artistDetails.genre}</p>

                    {/* Engagement metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>2k members</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>4.3 rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value proposition cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <h3 className="font-medium text-zinc-200">Exclusive Access</h3>
                    </div>
                    <p className="text-sm text-zinc-400">Be the first to have content from {artistDetails.name}</p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-medium text-zinc-200">{artistDetails.circle_duration} Days</h3>
                    </div>
                    <p className="text-sm text-zinc-400">Valid Membership</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}