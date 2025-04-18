// "use client";
// import { useUser } from "@clerk/nextjs";
// import { createClient } from "@supabase/supabase-js";
// import { useEffect, useState } from "react";

// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// export default function AdminDashboard() {
//   const { user } = useUser();
//   const [users, setUsers] = useState([]);
//   const [transactions, setTransactions] = useState([]);

//   useEffect(() => {
//     if (!user || user.id !== "admin_clerk_id") return; // Replace with your admin Clerk ID
//     const fetchData = async () => {
//       const { data: userData } = await supabase.from("users").select("*");
//       const { data: txData } = await supabase.from("transactions").select("*");
//       setUsers(userData);
//       setTransactions(txData);
//     };
//     fetchData();
//   }, [user]);

//   if (!user || user.id !== "admin_clerk_id") return <div>Access Denied</div>;

//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       <h2>Users</h2>
//       <ul>
//         {users.map((u) => (
//           <li key={u.id}>
//             {u.email} (Clerk ID: {u.clerk_user_id}, Stripe ID: {u.stripe_customer_id})
//           </li>
//         ))}
//       </ul>
//       <h2>Transactions</h2>
//       <ul>
//         {transactions.map((t) => (
//           <li key={t.id}>
//             {t.clerk_user_id} - ${t.amount / 100} - {t.status} ({t.stripe_transaction_id})
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersAdmin from "@/components/admin/UsersAdmin";
import FacilitiesAdmin from "@/components/admin/FacilitiesAdmin";
import MinersAdmin from "@/components/admin/MinersAdmin";
import PlansAdmin from "@/components/admin/PlansAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mining Platform Admin</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="miners">Miners</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersAdmin />
        </TabsContent>
        
        <TabsContent value="facilities">
          <FacilitiesAdmin />
        </TabsContent>
        
        <TabsContent value="miners">
          <MinersAdmin />
        </TabsContent>
        
        <TabsContent value="plans">
          <PlansAdmin />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}