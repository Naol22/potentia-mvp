'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ManageSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const response = await fetch('/api/subscriptions/manage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch subscriptions');
        }

        const data = await response.json();
        setSubscriptions(data.subscriptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  const handleManageSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch management URL');
      }

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank'); // Open Stripe link in a new tab
      } else if (data.error === "NowPayments management not implemented") {
        alert("NowPayments management not implemented");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Subscriptions Found</AlertTitle>
          <AlertDescription>
            You currently have no subscriptions.
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
      <h1 className="text-2xl font-bold mb-6">Manage Subscriptions</h1>
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="mb-4">
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

          <div className="flex justify-end p-4">
            <Button
              variant="default"
              onClick={() => handleManageSubscription(subscription.id)}
            >
              Manage
            </Button>
          </div>
        </Card>
      ))}
      <div className="mt-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}