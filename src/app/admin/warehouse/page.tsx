'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Warehouse,
  Search,
  User,
  Truck,
  CheckCircle,
  Loader2,
  Package,
  ArrowRight,
} from 'lucide-react';

interface ProductUnit {
  id: string;
  chassisNumber: string;
  productId: string;
  product: {
    id: string;
    name: string;
    category: string;
  };
  createdAt: string;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  phone: string;
}

export default function WarehouseManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && !['ADMIN', 'WAREHOUSE_MANAGER'].includes(session?.user?.role || '')) {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [notes, setNotes] = useState('');
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/warehouse/assign-units');
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.chassisNumber.toLowerCase().includes(search.toLowerCase()) ||
      unit.product.name.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = !productFilter || unit.productId === productFilter;
    return matchesSearch && matchesProduct;
  });

  const uniqueProducts = Array.from(new Map(units.map(u => [u.productId, u.product])).values());

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleAllUnits = () => {
    if (selectedUnits.length === filteredUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(filteredUnits.map(u => u.id));
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent || selectedUnits.length === 0) return;

    setAssigning(true);
    try {
      const res = await fetch('/api/warehouse/assign-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          unitIds: selectedUnits,
          notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'Units Assigned',
          description: data.message,
        });
        fetchData();
        setShowAssignDialog(false);
        setSelectedUnits([]);
        setSelectedAgent('');
        setNotes('');
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to assign units');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign units',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-500">Loading warehouse data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Assign product units with chassis numbers to approved agents.</p>
        </div>
        {selectedUnits.length > 0 && (
          <Button 
            className="bg-deep-sky-blue hover:bg-deep-sky-blue/90 text-white font-bold h-11 px-6"
            onClick={() => setShowAssignDialog(true)}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Assign {selectedUnits.length} Unit{selectedUnits.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-deep-sky-blue" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Units</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{units.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 text-green-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved Agents</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{agents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{selectedUnits.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by chassis number or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-white border-gray-200 rounded-xl"
              />
            </div>
            <select
              className="h-10 bg-white border border-gray-200 rounded-xl px-4 font-medium focus:border-deep-sky-blue outline-none min-w-[200px]"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="">All Products</option>
              {uniqueProducts.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <CardTitle className="text-lg font-bold text-gray-900">Available Units in Warehouse</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUnits.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-medium">No units available</p>
              <p className="text-sm">All units have been assigned to agents.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                        onChange={toggleAllUnits}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead className="font-bold">Chassis Number</TableHead>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow 
                      key={unit.id} 
                      className={`hover:bg-gray-50/50 cursor-pointer ${selectedUnits.includes(unit.id) ? 'bg-blue-50/50' : ''}`}
                      onClick={() => toggleUnitSelection(unit.id)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUnits.includes(unit.id)}
                          onChange={() => toggleUnitSelection(unit.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-bold">{unit.chassisNumber}</TableCell>
                      <TableCell className="font-medium">{unit.product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{unit.product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(unit.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-deep-sky-blue/10 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-deep-sky-blue" />
            </div>
            <DialogTitle className="text-2xl font-bold">Assign Units to Agent</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Select an agent to receive {selectedUnits.length} unit{selectedUnits.length > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Select Agent *</Label>
              <select
                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-medium focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.firstName} {agent.lastName} {agent.businessName ? `(${agent.businessName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Notes (Optional)</Label>
              <textarea
                placeholder="Add any notes about this assignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all resize-none"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>{selectedUnits.length}</strong> unit{selectedUnits.length > 1 ? 's' : ''} will be transferred from warehouse to the selected agent.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => {
                setShowAssignDialog(false);
                setSelectedAgent('');
                setNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-deep-sky-blue hover:bg-deep-sky-blue/90 text-white font-bold"
              onClick={handleAssign}
              disabled={assigning || !selectedAgent}
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}