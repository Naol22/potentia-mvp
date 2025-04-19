"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

interface Facility {
  id: string;
  name: string;
  created_at: string;
}

export default function FacilitiesAdmin() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState<Partial<Facility> | null>(null);
  const [newFacility, setNewFacility] = useState<Partial<Facility>>({ name: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch facilities
  // Update fetchFacilities
  const fetchFacilities = async () => {
    try {
      const response = await fetch("/api/admin/facilities", {
        credentials: 'include'
      });
      const data = await response.json();
      setFacilities(data);
    } catch (error) {
      toast.error("Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Create facility
  const createFacility = async () => {
    try {
      if (!newFacility.name) {
        toast.error("Facility name is required");
        return;
      }

      const response = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newFacility),
      });
      
      if (response.ok) {
        toast.success("Facility created successfully");
        fetchFacilities();
        setNewFacility({ name: "" });
        setIsCreating(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create facility");
      }
    } catch (error) {
      toast.error("Error creating facility");
    }
  };

  // Update facility
  const updateFacility = async () => {
    try {
      if (!editingFacility?.name) {
        toast.error("Facility name is required");
        return;
      }

      const response = await fetch(`/api/admin/facilities/${editingFacility.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(editingFacility),
      });
      
      if (response.ok) {
        toast.success("Facility updated successfully");
        fetchFacilities();
        setEditingFacility(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update facility");
      }
    } catch (error) {
      toast.error("Error updating facility");
    }
  };

  // Delete facility
  const deleteFacility = async (id: string) => {
    if (!confirm("Are you sure you want to delete this facility? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/admin/facilities/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success("Facility deleted successfully");
        fetchFacilities();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete facility");
      }
    } catch (error) {
      toast.error("Error deleting facility");
    }
  };

  if (loading) return <div>Loading facilities...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Facilities Management</h2>
        <Button onClick={() => setIsCreating(true)}>Add Facility</Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Facility</h3>
          <div className="grid gap-4 mb-4">
            <div>
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                value={newFacility.name || ""}
                onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                placeholder="e.g., Ethiopia, Dubai, Texas"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={createFacility}>Create</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setNewFacility({ name: "" });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingFacility && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Facility</h3>
          <div className="grid gap-4 mb-4">
            <div>
              <Label htmlFor="edit-name">Facility Name</Label>
              <Input
                id="edit-name"
                value={editingFacility.name || ""}
                onChange={(e) => setEditingFacility({...editingFacility, name: e.target.value})}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={updateFacility}>Update</Button>
            <Button 
              variant="outline" 
              onClick={() => setEditingFacility(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Facilities Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id} className="border-b">
                <td className="p-2">{facility.name}</td>
                <td className="p-2">{format(new Date(facility.created_at), 'MMM d, yyyy')}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingFacility(facility)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteFacility(facility.id)}
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