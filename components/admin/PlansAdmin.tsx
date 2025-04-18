"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [isCreating, setIsCreating] = useState(false);

  // Fetch plans
  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans");
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Create plan
  const createPlan = async () => {
    try {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      });
      
      if (response.ok) {
        toast.success("Plan created successfully");
        fetchPlans();
        setEditingPlan(null);
        setIsCreating(false);
      } else {
        toast.error("Failed to create plan");
      }
    } catch (error) {
      toast.error("Error creating plan");
    }
  };

  // Update plan
  const updatePlan = async () => {
    try {
      const response = await fetch(`/api/admin/plans/${editingPlan?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      });
      
      if (response.ok) {
        toast.success("Plan updated successfully");
        fetchPlans();
        setEditingPlan(null);
      } else {
        toast.error("Failed to update plan");
      }
    } catch (error) {
      toast.error("Error updating plan");
    }
  };

  // Delete plan
  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Plan deleted successfully");
        fetchPlans();
      } else {
        toast.error("Failed to delete plan");
      }
    } catch (error) {
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
          setEditingPlan({
            type: "hashrate",
            hashrate: 100,
            price: 5.00,
            duration: "Monthly Recurring"
          });
        }}>Add New Plan</Button>
      </div>

      {/* Edit/Create Form */}
      {editingPlan && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {isCreating ? "Create New Plan" : "Edit Plan"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="type">Plan Type</Label>
              <Select 
                value={editingPlan.type} 
                onValueChange={(value) => setEditingPlan({...editingPlan, type: value})}
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
                value={editingPlan.hashrate || 0}
                onChange={(e) => setEditingPlan({...editingPlan, hashrate: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editingPlan.price || 0}
                onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={editingPlan.duration || "Monthly Recurring"}
                onChange={(e) => setEditingPlan({...editingPlan, duration: e.target.value})}
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
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Plans Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
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
                      onClick={() => setEditingPlan(plan)}
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