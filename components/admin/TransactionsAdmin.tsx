"use client";
import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
}

interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  description: string;
  stripe_payment_id: string;
  created_at: string;
  users?: User;
  plans?: Plan;
}

export default function TransactionsAdmin() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/transactions", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [usersResponse, plansResponse] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/plans", { credentials: "include" })
      ]);
      
      if (!usersResponse.ok || !plansResponse.ok) 
        throw new Error("Failed to fetch related data");
      
      const usersData: User[] = await usersResponse.json();
      const plansData: Plan[] = await plansResponse.json();
      
      setUsers(usersData);
      setPlans(plansData);
    } catch {
      toast.error("Failed to fetch related data");
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchRelatedData();
  }, []);

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentTransaction({
      id: "",
      user_id: "",
      plan_id: "",
      amount: 0,
      status: "pending",
      description: "",
      stripe_payment_id: "",
      created_at: new Date().toISOString(),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Failed to delete transaction");
      
      toast.success("Transaction deleted successfully");
      fetchTransactions();
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransaction) return;
    
    try {
      const response = await fetch(`/api/admin/transactions/${currentTransaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(currentTransaction),
      });
      
      if (!response.ok) throw new Error("Failed to update transaction");
      
      toast.success("Transaction updated successfully");
      setIsEditDialogOpen(false);
      fetchTransactions();
    } catch {
      toast.error("Failed to update transaction");
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransaction) return;
    
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(currentTransaction),
      });
      
      if (!response.ok) throw new Error("Failed to create transaction");
      
      toast.success("Transaction created successfully");
      setIsCreateDialogOpen(false);
      fetchTransactions();
    } catch {
      toast.error("Failed to create transaction");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTransaction) return;
    
    const { name, value } = e.target;
    setCurrentTransaction({
      ...currentTransaction,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!currentTransaction) return;
    
    setCurrentTransaction({
      ...currentTransaction,
      [name]: value,
    });
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transactions Management</h2>
        <Button onClick={handleCreate}>Add New Transaction</Button>
      </div>

      <Table>
        <TableCaption>List of all transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id.substring(0, 8)}...</TableCell>
              <TableCell>{transaction.users?.email || "N/A"}</TableCell>
              <TableCell>{transaction.plans?.type} - {transaction.plans?.hashrate}TH/s</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transaction.status === "completed" ? "bg-green-100 text-green-800" :
                  transaction.status === "failed" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to the transaction details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_id" className="text-right">User</Label>
                <Select 
                  value={currentTransaction?.user_id} 
                  onValueChange={(value) => handleSelectChange("user_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email || `${user.first_name} ${user.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan_id" className="text-right">Plan</Label>
                <Select 
                  value={currentTransaction?.plan_id} 
                  onValueChange={(value) => handleSelectChange("plan_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.type} - {plan.hashrate}TH/s - ${plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={currentTransaction?.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                  value={currentTransaction?.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={currentTransaction?.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stripe_payment_id" className="text-right">Stripe ID</Label>
                <Input
                  id="stripe_payment_id"
                  name="stripe_payment_id"
                  value={currentTransaction?.stripe_payment_id || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>
              Add a new transaction to the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_id" className="text-right">User</Label>
                <Select 
                  value={currentTransaction?.user_id} 
                  onValueChange={(value) => handleSelectChange("user_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email || `${user.first_name} ${user.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan_id" className="text-right">Plan</Label>
                <Select 
                  value={currentTransaction?.plan_id} 
                  onValueChange={(value) => handleSelectChange("plan_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.type} - {plan.hashrate}TH/s - ${plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={currentTransaction?.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                  value={currentTransaction?.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={currentTransaction?.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stripe_payment_id" className="text-right">Stripe ID</Label>
                <Input
                  id="stripe_payment_id"
                  name="stripe_payment_id"
                  value={currentTransaction?.stripe_payment_id || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Create Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}