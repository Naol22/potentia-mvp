"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { TransactionsTable } from "@/components/transactions-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import SubscriptionManager from "@/components/dashboard/SubscriptionManager"
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen"

export default function Page() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const response = await fetch('/api/subscriptions/manage');
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data.subscriptions || []);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  if (loading) return <GlobalLoadingScreen />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
                <TransactionsTable />
              </div>

              {/* Subscription Management Section */}
              <div className="px-4 lg:px-6 mt-4">
                <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
                <SubscriptionManager subscriptions={subscriptions} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
