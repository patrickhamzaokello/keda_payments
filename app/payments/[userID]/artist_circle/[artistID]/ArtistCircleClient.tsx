
'use client';

import React, { useState } from 'react';
import { PaymentScreen } from '@/components/PaymentScreen';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Decimal from 'decimal.js';

interface ArtistCircleClientProps {
  userID: string;
  artistID: string;
  amount: number;
  duration: number;
  description: string;
  type: string;
  typeId: string;
}


const ArtistCircleClient: React.FC<ArtistCircleClientProps> = ({ userID, artistID, amount, duration, description, type, typeId }) => {
  const [selectedPlan, setSelectedPlan] = useState<{
    amount: number;
    duration: number;
    description: string;
    type: string;
    typeId: string;
  } | null>(null);

  const handlePayment = (amount: number, duration: number, description: string, type: string, typeId: string) => {
    setSelectedPlan({ amount, duration, description, type, typeId });
  };

  const handleClosePaymentScreen = () => {
    setSelectedPlan(null);
  };

  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Join Artist Subscription Plan</h1>
      <p className="text-1xl font-medium mb-6 text-center">Access exclusive content, interviews, and previews from your artist circle</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Aritist Circle</CardTitle>
              <CardDescription>Enjoy unlimited access for your artist</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{amount.toLocaleString()} UGX</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePayment(amount, duration, description, type, typeId)}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
      </div>

      {selectedPlan && (
        <PaymentScreen
          amount={selectedPlan.amount}
          planDuration={selectedPlan.duration}
          planDescription={selectedPlan.description}
          subscriptionType={selectedPlan.type}
          subscriptionTypeId={selectedPlan.typeId}
          userId="user123"
          username="John Doe"
          email="john@example.com"
          phone="1234567890"
          onClose={handleClosePaymentScreen}
        />
      )}
    </div>
  );
};

export default ArtistCircleClient;