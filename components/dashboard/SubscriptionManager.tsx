"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Subscription {
  id: string;
  plan_id: {
    type: string;
    hashrate: number;
    price: number;
  };
  status: string;
  current_period_end: string;
  payment_methods: {
    name: string;
    display_name: string;
  };
}

// Core subscription management function
export async function manageSubscription(subscriptionId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/subscriptions/manage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create management session');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error managing subscription:', error);
    toast.error('Failed to open subscription management');
    return null;
  }
}

// UI Component
export default function SubscriptionManager({ subscriptions }: { subscriptions: Subscription[] }) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleManageClick = async (subscriptionId: string) => {
    setLoading(prev => ({ ...prev, [subscriptionId]: true }));
    
    try {
      const url = await manageSubscription(subscriptionId);
      if (url) window.location.href = url;
    } finally {
      setLoading(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>You don&apos;t have any active subscriptions</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Subscriptions</h2>
      
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <CardTitle>{subscription.plan_id.type} Plan - {subscription.plan_id.hashrate} TH/s</CardTitle>
            <CardDescription>
              Payment Method: {subscription.payment_methods.display_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Provider: </span>
                <span className="font-medium">{subscription.payment_methods?.name || "N/A"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleManageClick(subscription.id)}
              disabled={loading[subscription.id]}
              className="w-full"
            >
              {loading[subscription.id] ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
