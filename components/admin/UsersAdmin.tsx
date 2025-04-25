"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include"
      });
      const data: User[] = await response.json();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${editingUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingUser),
      });
      
      if (response.ok) {
        toast.success("User updated successfully");
        fetchUsers();
        setEditingUser(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update user");
      }
    } catch {
      toast.error("Error updating user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Users Management</h2>
      </div>

      {editingUser && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit User</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editingUser.email || ""}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_admin"
                checked={editingUser.is_admin || false}
                onCheckedChange={(checked) => 
                  setEditingUser({...editingUser, is_admin: checked === true})
                }
              />
              <Label htmlFor="is_admin">Admin Access</Label>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={updateUser}>Update</Button>
            <Button 
              variant="outline" 
              onClick={() => setEditingUser(null)}
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
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Updated</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${user.is_admin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                </td>
                <td className="p-2">{format(new Date(user.created_at), "MMM d, yyyy")}</td>
                <td className="p-2">{format(new Date(user.updated_at), "MMM d, yyyy")}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteUser(user.id)}
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