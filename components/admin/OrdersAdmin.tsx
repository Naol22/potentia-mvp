"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  clerk_user_id: string;
}

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
}

interface Facility {
  id: string;
  name: string;
}

interface Miner {
  id: string;
  name: string;
}

interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  facility_id: string | null;
  miner_id: string | null;
  btc_address: string;
  stripe_payment_id: string | null;
  status: string;
  created_at: string;
  users: User;
  plans: Plan;
  facilities: Facility | null;
  miners: Miner | null;
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [miners, setMiners] = useState<Miner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    status: "pending",
    btc_address: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const { isLoaded, userId, getToken } = useAuth();

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/orders", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include"
      });
      const data = await response.json();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans", {
        credentials: "include"
      });
      const data = await response.json();
      setPlans(data);
    } catch {
      toast.error("Failed to fetch plans");
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await fetch("/api/admin/facilities", {
        credentials: "include"
      });
      const data = await response.json();
      setFacilities(data);
    } catch {
      toast.error("Failed to fetch facilities");
    }
  };

  const fetchMiners = async () => {
    try {
      const response = await fetch("/api/admin/miners", {
        credentials: "include"
      });
      const data = await response.json();
      setMiners(data);
    } catch {
      toast.error("Failed to fetch miners");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchPlans();
    fetchFacilities();
    fetchMiners();
  }, []);

  const handlePlanTypeChange = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (selectedPlan) {
      setSelectedPlanType(selectedPlan.type);
      
      if (selectedPlan.type === "hosting") {
        setNewOrder({
          ...newOrder,
          plan_id: planId,
          miner_id: null
        });
      } else {
        setNewOrder({
          ...newOrder,
          plan_id: planId,
          facility_id: null
        });
      }
    }
  };

  const handleEditPlanTypeChange = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (selectedPlan && editingOrder) {
      setSelectedPlanType(selectedPlan.type);
      
      if (selectedPlan.type === "hosting") {
        setEditingOrder({
          ...editingOrder,
          plan_id: planId,
          miner_id: null
        });
      } else {
        setEditingOrder({
          ...editingOrder,
          plan_id: planId,
          facility_id: null
        });
      }
    }
  };

  const createOrder = async () => {
    try {
      if (!newOrder.user_id || !newOrder.plan_id || !newOrder.btc_address) {
        toast.error("User, plan, and BTC address are required");
        return;
      }

      const selectedPlan = plans.find(plan => plan.id === newOrder.plan_id);
      if (selectedPlan?.type === "hosting" && !newOrder.facility_id) {
        toast.error("Facility is required for hosting plans");
        return;
      }
      
      if (selectedPlan?.type === "hashrate" && !newOrder.miner_id) {
        toast.error("Miner is required for hashrate plans");
        return;
      }

      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newOrder),
      });
      
      if (response.ok) {
        toast.success("Order created successfully");
        fetchOrders();
        setNewOrder({
          status: "pending",
          btc_address: ""
        });
        setIsCreating(false);
        setSelectedPlanType(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create order");
      }
    } catch {
      toast.error("Error creating order");
    }
  };

  const updateOrder = async () => {
    try {
      if (!editingOrder?.user_id || !editingOrder?.plan_id || !editingOrder?.btc_address) {
        toast.error("User, plan, and BTC address are required");
        return;
      }

      const selectedPlan = plans.find(plan => plan.id === editingOrder.plan_id);
      if (selectedPlan?.type === "hosting" && !editingOrder.facility_id) {
        toast.error("Facility is required for hosting plans");
        return;
      }
      
      if (selectedPlan?.type === "hashrate" && !editingOrder.miner_id) {
        toast.error("Miner is required for hashrate plans");
        return;
      }

      const response = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingOrder),
      });
      
      if (response.ok) {
        toast.success("Order updated successfully");
        fetchOrders();
        setEditingOrder(null);
        setSelectedPlanType(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update order");
      }
    } catch {
      toast.error("Error updating order");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        toast.success("Order deleted successfully");
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete order");
      }
    } catch {
      toast.error("Error deleting order");
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <Button onClick={() => setIsCreating(true)}>Add Order</Button>
      </div>

      {isCreating && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Order</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="user_id">User</Label>
              <Select 
                onValueChange={(value) => setNewOrder({...newOrder, user_id: value})}
                value={newOrder.user_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.clerk_user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="plan_id">Plan</Label>
              <Select 
                onValueChange={(value) => handlePlanTypeChange(value)}
                value={newOrder.plan_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.type} - {plan.hashrate} TH/s - ${plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlanType === "hosting" && (
              <div>
                <Label htmlFor="facility_id">Facility</Label>
                <Select 
                  onValueChange={(value) => setNewOrder({...newOrder, facility_id: value})}
                  value={newOrder.facility_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedPlanType === "hashrate" && (
              <div>
                <Label htmlFor="miner_id">Miner</Label>
                <Select 
                  onValueChange={(value) => setNewOrder({...newOrder, miner_id: value})}
                  value={newOrder.miner_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Miner" />
                  </SelectTrigger>
                  <SelectContent>
                    {miners.map(miner => (
                      <SelectItem key={miner.id} value={miner.id}>
                        {miner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="btc_address">BTC Address</Label>
              <Input
                id="btc_address"
                value={newOrder.btc_address || ""}
                onChange={(e) => setNewOrder({...newOrder, btc_address: e.target.value})}
                placeholder="Enter Bitcoin address"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                onValueChange={(value) => setNewOrder({...newOrder, status: value})}
                value={newOrder.status || "pending"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="stripe_payment_id">Stripe Payment ID (Optional)</Label>
              <Input
                id="stripe_payment_id"
                value={newOrder.stripe_payment_id || ""}
                onChange={(e) => setNewOrder({...newOrder, stripe_payment_id: e.target.value})}
                placeholder="Enter Stripe payment ID"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={createOrder}>Create</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setNewOrder({
                  status: "pending",
                  btc_address: ""
                });
                setSelectedPlanType(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Order</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="edit_user_id">User</Label>
              <Select 
                onValueChange={(value) => setEditingOrder({...editingOrder, user_id: value})}
                value={editingOrder.user_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.clerk_user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_plan_id">Plan</Label>
              <Select 
                onValueChange={(value) => handleEditPlanTypeChange(value)}
                value={editingOrder.plan_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.type} - {plan.hashrate} TH/s - ${plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(selectedPlanType === "hosting" || editingOrder.facilities) && (
              <div>
                <Label htmlFor="edit_facility_id">Facility</Label>
                <Select 
                  onValueChange={(value) => setEditingOrder({...editingOrder, facility_id: value})}
                  value={editingOrder.facility_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(selectedPlanType === "hashrate" || editingOrder.miners) && (
              <div>
                <Label htmlFor="edit_miner_id">Miner</Label>
                <Select 
                  onValueChange={(value) => setEditingOrder({...editingOrder, miner_id: value})}
                  value={editingOrder.miner_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Miner" />
                  </SelectTrigger>
                  <SelectContent>
                    {miners.map(miner => (
                      <SelectItem key={miner.id} value={miner.id}>
                        {miner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="edit_btc_address">BTC Address</Label>
              <Input
                id="edit_btc_address"
                value={editingOrder.btc_address || ""}
                onChange={(e) => setEditingOrder({...editingOrder, btc_address: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select 
                onValueChange={(value) => setEditingOrder({...editingOrder, status: value})}
                value={editingOrder.status || "pending"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit_stripe_payment_id">Stripe Payment ID</Label>
              <Input
                id="edit_stripe_payment_id"
                value={editingOrder.stripe_payment_id || ""}
                onChange={(e) => setEditingOrder({...editingOrder, stripe_payment_id: e.target.value})}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={updateOrder}>Update</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingOrder(null);
                setSelectedPlanType(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Facility/Miner</th>
              <th className="p-2 text-left">BTC Address</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.users?.clerk_user_id}</td>
                <td className="p-2">
                  {order.plans?.type} - {order.plans?.hashrate} TH/s - ${order.plans?.price}
                </td>
                <td className="p-2">
                  {order.facilities?.name || order.miners?.name || "N/A"}
                </td>
                <td className="p-2">
                  <span className="truncate block max-w-[150px]">{order.btc_address}</span>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === "completed" ? "bg-green-100 text-green-800" : 
                    order.status === "failed" ? "bg-red-100 text-red-800" : 
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-2">{format(new Date(order.created_at), "MMM d, yyyy")}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingOrder(order);
                        setSelectedPlanType(order.plans?.type);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}