'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  payment_method_id: number;
  provider_subscription_id: string;
  payment_methods: {
    name: string;
  };
  user_id: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const subscriptionId = params.id as string;
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managementUrl, setManagementUrl] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSubscriptionAndManagementUrl() {
      try {
        // Fetch the management URL
        const manageResponse = await fetch('/api/subscriptions/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscriptionId }),
        });
        
        if (!manageResponse.ok) {
          const errorData = await manageResponse.json();
          throw new Error(errorData.error || 'Failed to fetch management URL');
        }
        
        const manageData = await manageResponse.json();
        setManagementUrl(manageData.url);

        // For NowPayments, validate the token
        if (manageData.token) {
          const validateResponse = await fetch(`/api/subscriptions/manage?token=${manageData.token}&subscriptionId=${subscriptionId}`);
          
          if (!validateResponse.ok) {
            const errorData = await validateResponse.json();
            throw new Error(errorData.error || 'Failed to validate session');
          }
          
          const validateData = await validateResponse.json();
          setSubscription(validateData.subscription);
        } else {
          // For Stripe, fetch subscription details directly
          const subResponse = await fetch(`/api/subscriptions/details/${subscriptionId}`);
          
          if (!subResponse.ok) {
            const errorData = await subResponse.json();
            throw new Error(errorData.error || 'Failed to fetch subscription');
          }
          
          const subData = await subResponse.json();
          setSubscription(subData.subscription);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscriptionAndManagementUrl();
  }, [subscriptionId, token]);
  
  const handleManageSubscription = () => {
    if (managementUrl) {
      window.location.href = managementUrl; // Redirect to the management URL
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!subscription) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Not Found</AlertTitle>
          <AlertDescription>
            The subscription you are looking for could not be found or you do not have permission to view it.
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Subscription ID: {subscription.id}
              </CardDescription>
            </div>
            <Badge 
              variant={
                subscription.status === 'active' ? 'default' :
                subscription.status === 'canceled' ? 'destructive' :
                subscription.status === 'paused' ? 'outline' : 'secondary'
              }
            >
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Subscription Details</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{subscription.payment_methods.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Period Start</p>
                  <p className="font-medium">{formatDate(subscription.current_period_start)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Period End</p>
                  <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Account Information</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {subscription.user_id.first_name} {subscription.user_id.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{subscription.user_id.email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleManageSubscription}
            disabled={!managementUrl}
          >
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}