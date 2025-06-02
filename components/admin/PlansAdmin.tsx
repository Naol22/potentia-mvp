"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  created_at: string;
}

export default function PlansAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    type: "hashrate",
    hashrate: 100,
    price: 5.00,
    duration: "Monthly Recurring"
  });
  const [isCreating, setIsCreating] = useState(false);
  const { isLoaded, userId, getToken } = useAuth();

  const fetchPlans = async () => {
    try {
      // Get the session token to include in the request
      const token = await getToken();
      const response = await fetch("/api/admin/plans", {

          credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data: Plan[] = await response.json();
      setPlans(data);
    } catch {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const createPlan = async () => {
    try {
      if (!newPlan.type || !newPlan.hashrate || !newPlan.price || !newPlan.duration) {
        toast.error("All plan fields are required");
        return;
      }

      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPlan),
      });
      
      if (response.ok) {
        toast.success("Plan created successfully");
        fetchPlans();
        setNewPlan({
          type: "hashrate",
          hashrate: 100,
          price: 5.00,
          duration: "Monthly Recurring"
        });
        setIsCreating(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create plan");
      }
    } catch {
      toast.error("Error creating plan");
    }
  };

  const updatePlan = async () => {
    if (!editingPlan || !editingPlan.id) return;
    
    try {
      if (!editingPlan.type || !editingPlan.hashrate || !editingPlan.price || !editingPlan.duration) {
        toast.error("All plan fields are required");
        return;
      }

      const response = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingPlan),
      });
      
      if (response.ok) {
        toast.success("Plan updated successfully");
        fetchPlans();
        setEditingPlan(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update plan");
      }
    } catch {
      toast.error("Error updating plan");
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        toast.success("Plan deleted successfully");
        fetchPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete plan");
      }
    } catch {
      toast.error("Error deleting plan");
    }
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Mining Plans Management</h2>
        <Button onClick={() => {
          setIsCreating(true);
          setEditingPlan(null);
        }}>Add New Plan</Button>
      </div>

      {(editingPlan || isCreating) && (
        <div className="bg-black p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {isCreating ? "Create New Plan" : "Edit Plan"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="type">Plan Type</Label>
              <Select 
                value={isCreating ? newPlan.type : editingPlan?.type} 
                onValueChange={(value) => {
                  if (isCreating) {
                    setNewPlan({...newPlan, type: value});
                  } else {
                    setEditingPlan({...editingPlan, type: value});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hosting">Hosting</SelectItem>
                  <SelectItem value="hashrate">Hashrate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hashrate">Hashrate (TH/s)</Label>
              <Input
                id="hashrate"
                type="number"
                value={isCreating ? newPlan.hashrate || 0 : editingPlan?.hashrate || 0}
                onChange={(e) => {
                  if (isCreating) {
                    setNewPlan({...newPlan, hashrate: parseInt(e.target.value)});
                  } else {
                    setEditingPlan({...editingPlan, hashrate: parseInt(e.target.value)});
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={isCreating ? newPlan.price || 0 : editingPlan?.price || 0}
                onChange={(e) => {
                  if (isCreating) {
                    setNewPlan({...newPlan, price: parseFloat(e.target.value)});
                  } else {
                    setEditingPlan({...editingPlan, price: parseFloat(e.target.value)});
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={isCreating ? newPlan.duration || "Monthly Recurring" : editingPlan?.duration || "Monthly Recurring"}
                onChange={(e) => {
                  if (isCreating) {
                    setNewPlan({...newPlan, duration: e.target.value});
                  } else {
                    setEditingPlan({...editingPlan, duration: e.target.value});
                  }
                }}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={isCreating ? createPlan : updatePlan}>
              {isCreating ? "Create" : "Update"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
                setNewPlan({
                  type: "hashrate",
                  hashrate: 100,
                  price: 5.00,
                  duration: "Monthly Recurring"
                });
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
            <tr className="bg-black">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Hashrate (TH/s)</th>
              <th className="p-2 text-left">Price (USD)</th>
              <th className="p-2 text-left">Duration</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b">
                <td className="p-2">{plan.type}</td>
                <td className="p-2">{plan.hashrate}</td>
                <td className="p-2">${plan.price.toFixed(2)}</td>
                <td className="p-2">{plan.duration}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsCreating(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
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