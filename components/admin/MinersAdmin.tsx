"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@clerk/nextjs";

interface Miner {
  id: string;
  name: string;
  created_at: string;
}

export default function MinersAdmin() {
  const [miners, setMiners] = useState<Miner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMiner, setEditingMiner] = useState<Partial<Miner> | null>(null);
  const [newMiner, setNewMiner] = useState<Partial<Miner>>({ name: "" });
  const [isCreating, setIsCreating] = useState(false);
  const { isLoaded, userId, getToken } = useAuth();
  const fetchMiners = async () => {
    try {
      const token = await getToken();

      const response = await fetch("/api/admin/miners", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setMiners(data);
    } catch {
      toast.error("Failed to fetch miners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiners();
  }, []);

  const createMiner = async () => {
    try {
      if (!newMiner.name) {
        toast.error("Miner name is required");
        return;
      }

      const response = await fetch("/api/admin/miners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newMiner),
      });
      
      if (response.ok) {
        toast.success("Miner created successfully");
        fetchMiners();
        setNewMiner({ name: "" });
        setIsCreating(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create miner");
      }
    } catch {
      toast.error("Error creating miner");
    }
  };

  const updateMiner = async () => {
    try {
      if (!editingMiner?.name) {
        toast.error("Miner name is required");
        return;
      }

      const response = await fetch(`/api/admin/miners/${editingMiner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingMiner),
      });
      
      if (response.ok) {
        toast.success("Miner updated successfully");
        fetchMiners();
        setEditingMiner(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update miner");
      }
    } catch {
      toast.error("Error updating miner");
    }
  };

  const deleteMiner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this miner? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/admin/miners/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        toast.success("Miner deleted successfully");
        fetchMiners();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete miner");
      }
    } catch {
      toast.error("Error deleting miner");
    }
  };

  if (loading) return <div>Loading miners...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Miners Management</h2>
        <Button onClick={() => setIsCreating(true)}>Add Miner</Button>
      </div>

      {isCreating && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Miner</h3>
          <div className="grid gap-4 mb-4">
            <div>
              <Label htmlFor="name">Miner Name</Label>
              <Input
                id="name"
                value={newMiner.name || ""}
                onChange={(e) => setNewMiner({...newMiner, name: e.target.value})}
                placeholder="e.g., Antminer S21"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={createMiner}>Create</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setNewMiner({ name: "" });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {editingMiner && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Miner</h3>
          <div className="grid gap-4 mb-4">
            <div>
              <Label htmlFor="edit-name">Miner Name</Label>
              <Input
                id="edit-name"
                value={editingMiner.name || ""}
                onChange={(e) => setEditingMiner({...editingMiner, name: e.target.value})}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={updateMiner}>Update</Button>
            <Button 
              variant="outline" 
              onClick={() => setEditingMiner(null)}
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
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {miners.map((miner) => (
              <tr key={miner.id} className="border-b">
                <td className="p-2">{miner.name}</td>
                <td className="p-2">{format(new Date(miner.created_at), "MMM d, yyyy")}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingMiner(miner)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteMiner(miner.id)}
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