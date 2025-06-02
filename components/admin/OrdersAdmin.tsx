"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Order {
  id: string;
  user_id: string;
  plan_type: string;
  transaction_ids: string | null;
  subscription_id: string | null;
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]); // Ensure orders is initialized as an array
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        throw new Error("Invalid data format: orders is not an array");
      }
    } catch (error) {
      console.error("[OrdersAdmin] Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Order deleted successfully");
        fetchOrders(); // Refresh the orders list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete order");
      }
    } catch {
      toast.error("Error deleting order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">User ID</th>
              <th className="p-2 text-left">Plan Type</th>
              <th className="p-2 text-left">Transaction IDs</th>
              <th className="p-2 text-left">Subscription ID</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.user_id}</td>
                <td className="p-2">{order.plan_type}</td>
                <td className="p-2">{order.transaction_ids || "N/A"}</td>
                <td className="p-2">{order.subscription_id || "N/A"}</td>
                <td className="p-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteOrder(order.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}