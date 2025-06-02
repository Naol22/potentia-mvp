"use client";
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersAdmin from '@/components/admin/UsersAdmin';
import PlansAdmin from '@/components/admin/PlansAdmin';
import OrdersAdmin from '@/components/admin/OrdersAdmin';
import MinersAdmin from '@/components/admin/MinersAdmin';
import FacilitiesAdmin from '@/components/admin/FacilitiesAdmin';
import HostingAdmin from '@/components/admin/HostingAdmin';
import TransactionsAdmin from '@/components/admin/TransactionsAdmin';

export default function AdminDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("users");

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 mt-20">Admin Dashboard</h1>
      <p className="mb-4 text-gray-300">Welcome, {user?.fullName || 'Admin'}!</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="miners">Miners</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="hosting">Hosting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersAdmin />
        </TabsContent>
        
        <TabsContent value="plans">
          <PlansAdmin />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionsAdmin />
        </TabsContent>
        
        <TabsContent value="miners">
          <MinersAdmin />
        </TabsContent>
        
        <TabsContent value="facilities">
          <FacilitiesAdmin />
        </TabsContent>
        
        <TabsContent value="hosting">
          <HostingAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}