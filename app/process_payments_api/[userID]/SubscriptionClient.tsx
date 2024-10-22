'use client';

import React, { useState } from 'react';
import { PaymentScreen } from '@/components/PaymentScreen';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const SubscriptionClient: React.FC = () => {
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

  const plans = [
    { amount: 500, duration: 30, description: "1 Month Subscription", type: "1_month", typeId: "mw_1_months" },
    { amount: 1000, duration: 60, description: "3 Months Subscription", type: "3_months", typeId: "mw_3_months" },
    { amount: 1500, duration: 7, description: "7 Days Subscription", type: "7_days", typeId: "mw_seven" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Subscription Plan</h1>
      <p className="text-1xl font-medium mb-6 text-center">Start building for free, then build your site after</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardTitle>{plan.description}</CardTitle>
              <CardDescription>Enjoy unlimited access for {plan.duration} days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{plan.amount.toLocaleString()} UGX</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePayment(plan.amount, plan.duration, plan.description, plan.type, plan.typeId)}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
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

export default SubscriptionClient;