"use client";
import React, { useState, useEffect } from 'react';
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

interface Hosting {
  id: string;
  miner_id: string;
  facility_id: string;
  price: number;
  duration: string;
  created_at: string;
  miners?: {
    id: string;
    name: string;
  };
  facilities?: {
    id: string;
    name: string;
  };
}

export default function HostingAdmin() {
  const [hostingPlans, setHostingPlans] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentHosting, setCurrentHosting] = useState<Hosting | null>(null);
  const [miners, setMiners] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  // Update fetchHostingPlans
  const fetchHostingPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hosting', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch hosting plans');
      const data = await response.json();
      setHostingPlans(data);
    } catch (error) {
      console.error('Error fetching hosting plans:', error);
      toast.error("Failed to load hosting plans");
    } finally {
      setLoading(false);
    }
  };

  // Update fetchRelatedData
  const fetchRelatedData = async () => {
    try {
      const [minersResponse, facilitiesResponse] = await Promise.all([
        fetch('/api/miners', { credentials: 'include' }),
        fetch('/api/facilities', { credentials: 'include' })
      ]);
      
      if (!minersResponse.ok || !facilitiesResponse.ok) 
        throw new Error('Failed to fetch related data');
      
      const minersData = await minersResponse.json();
      const facilitiesData = await facilitiesResponse.json();
      
      setMiners(minersData);
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  useEffect(() => {
    fetchHostingPlans();
    fetchRelatedData();
  }, []);

  const handleEdit = (hosting: Hosting) => {
    setCurrentHosting(hosting);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentHosting({
      id: '',
      miner_id: '',
      facility_id: '',
      price: 0,
      duration: 'Monthly Recurring',
      created_at: new Date().toISOString(),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hosting plan?')) return;
    
    try {
      const response = await fetch(`/api/admin/hosting/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete hosting plan');
      
      toast.success("Hosting plan deleted successfully");
      
      fetchHostingPlans();
    } catch (error) {
      console.error('Error deleting hosting plan:', error);
      toast.error("Failed to delete hosting plan");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHosting) return;
    
    try {
      const response = await fetch(`/api/admin/hosting/${currentHosting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentHosting),
      });
      
      if (!response.ok) throw new Error('Failed to update hosting plan');
      
      toast.success("Hosting plan updated successfully");
      
      setIsEditDialogOpen(false);
      fetchHostingPlans();
    } catch (error) {
      console.error('Error updating hosting plan:', error);
      toast.error("Failed to update hosting plan");
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHosting) return;
    
    try {
      const response = await fetch('/api/admin/hosting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentHosting),
      });
      
      if (!response.ok) throw new Error('Failed to create hosting plan');
      
      toast.success("Hosting plan created successfully");
      
      setIsCreateDialogOpen(false);
      fetchHostingPlans();
    } catch (error) {
      console.error('Error creating hosting plan:', error);
      toast.error("Failed to create hosting plan");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentHosting) return;
    
    const { name, value } = e.target;
    setCurrentHosting({
      ...currentHosting,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!currentHosting) return;
    
    setCurrentHosting({
      ...currentHosting,
      [name]: value,
    });
  };

  if (loading) return <div>Loading hosting plans...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hosting Plans Management</h2>
        <Button onClick={handleCreate}>Add New Hosting Plan</Button>
      </div>

      <Table>
        <TableCaption>List of all hosting plans</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Miner</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hostingPlans.map((hosting) => (
            <TableRow key={hosting.id}>
              <TableCell className="font-medium">{hosting.id.substring(0, 8)}...</TableCell>
              <TableCell>{hosting.miners?.name || 'N/A'}</TableCell>
              <TableCell>{hosting.facilities?.name || 'N/A'}</TableCell>
              <TableCell>${hosting.price}</TableCell>
              <TableCell>{hosting.duration}</TableCell>
              <TableCell>{new Date(hosting.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(hosting)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(hosting.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hosting Plan</DialogTitle>
            <DialogDescription>
              Make changes to the hosting plan details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="miner_id" className="text-right">Miner</Label>
                <Select 
                  value={currentHosting?.miner_id} 
                  onValueChange={(value) => handleSelectChange('miner_id', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="facility_id" className="text-right">Facility</Label>
                <Select 
                  value={currentHosting?.facility_id} 
                  onValueChange={(value) => handleSelectChange('facility_id', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={currentHosting?.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration</Label>
                <Select 
                  value={currentHosting?.duration} 
                  onValueChange={(value) => handleSelectChange('duration', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Recurring">Monthly Recurring</SelectItem>
                    <SelectItem value="3 Months">3 Months</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="12 Months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hosting Plan</DialogTitle>
            <DialogDescription>
              Add a new hosting plan to the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="miner_id" className="text-right">Miner</Label>
                <Select 
                  value={currentHosting?.miner_id} 
                  onValueChange={(value) => handleSelectChange('miner_id', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="facility_id" className="text-right">Facility</Label>
                <Select 
                  value={currentHosting?.facility_id} 
                  onValueChange={(value) => handleSelectChange('facility_id', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={currentHosting?.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration</Label>
                <Select 
                  value={currentHosting?.duration} 
                  onValueChange={(value) => handleSelectChange('duration', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Recurring">Monthly Recurring</SelectItem>
                    <SelectItem value="3 Months">3 Months</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="12 Months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Create Hosting Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}