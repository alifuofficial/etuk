'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Boxes, 
  Warehouse, 
  Users, 
  ArrowRightLeft, 
  Package,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  isSerialized: boolean;
  units?: { id: string; chassisNumber: string; currentAgentId: string | null; isSold: boolean }[];
}

interface InventoryItem {
  id: string;
  productId: string;
  agentId: string | null;
  quantity: number;
  product: Product;
  agent?: {
    firstName: string;
    lastName: string;
    businessName: string | null;
  } | null;
  updatedAt: string;
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [chassisInput, setChassisInput] = useState<string>('');
  const [stockMode, setStockMode] = useState<'ADD' | 'REMOVE' | 'REGISTER'>('ADD');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseStock = (productId: string) => {
    const item = inventory.find(i => i.productId === productId && i.agentId === null);
    return item ? item.quantity : 0;
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    if (stockAdjustment === 0 && stockMode !== 'REGISTER') return;

    const chassisNumbers = selectedProduct.isSerialized 
      ? chassisInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : null;

    const absQuantity = Math.abs(stockAdjustment);

    if (selectedProduct.isSerialized) {
      if (stockMode === 'ADD' && (!chassisNumbers || chassisNumbers.length !== stockAdjustment)) {
        toast({
          title: 'Input Error',
          description: `Please provide exactly ${stockAdjustment} chassis numbers.`,
          variant: 'destructive',
        });
        return;
      }
      if (stockMode === 'REMOVE' && (!chassisNumbers || chassisNumbers.length !== absQuantity)) {
        toast({
          title: 'Input Error',
          description: `Please provide exactly ${absQuantity} chassis numbers to remove.`,
          variant: 'destructive',
        });
        return;
      }
      if (stockMode === 'REGISTER' && (!chassisNumbers || chassisNumbers.length === 0)) {
        toast({
          title: 'Input Error',
          description: 'Please provide at least one chassis number to register.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setActionLoading(true);
    try {
      const endpoint = stockMode === 'REGISTER' ? '/api/inventory/register-units' : '/api/inventory';
      const actualQuantity = stockMode === 'REMOVE' ? -absQuantity : stockAdjustment;
      const body = stockMode === 'REGISTER' 
        ? { productId: selectedProduct.id, chassisNumbers }
        : {
            productId: selectedProduct.id,
            quantity: actualQuantity,
            notes: stockMode === 'REMOVE' ? 'Stock removal from inventory page' : 'Manual stock adjustment from inventory page',
            chassisNumbers
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: stockMode === 'REGISTER' ? 'Units Registered' : stockMode === 'REMOVE' ? 'Stock Removed' : 'Stock Updated',
          description: stockMode === 'REGISTER' 
            ? `Successfully registered ${chassisNumbers?.length} chassis numbers.`
            : stockMode === 'REMOVE'
            ? `Successfully removed ${absQuantity} units from ${selectedProduct.name}.`
            : `Successfully added ${stockAdjustment} units to ${selectedProduct.name}.`,
        });
        fetchInventory();
        setShowStockDialog(false);
        setStockAdjustment(0);
        setChassisInput('');
        setStockMode('ADD');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to update stock');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const totals = inventory.reduce((acc, item) => {
    if (item.agentId === null) {
      acc.warehouse += item.quantity;
    } else {
      acc.agents += item.quantity;
    }
    acc.total += item.quantity;
    return acc;
  }, { warehouse: 0, agents: 0, total: 0 });

  const filteredInventory = inventory.filter(item => {
    const searchLower = search.toLowerCase();
    const productName = item.product.name.toLowerCase();
    const holderName = item.agent 
      ? `${item.agent.firstName} ${item.agent.lastName} ${item.agent.businessName || ''}`.toLowerCase()
      : 'warehouse';
    
    return productName.includes(searchLower) || holderName.includes(searchLower);
  });

  const uniqueProducts = Array.from(
    new Map(inventory.map(item => [item.product.id, item.product])).values()
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-400">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Oversight</h1>
          <p className="text-sm text-gray-500 mt-1.5">Monitor unit distribution across central warehouse and agent network.</p>
        </div>
        <Button 
          className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-6 rounded-lg shadow-lg shadow-gray-200 transition-all"
          onClick={() => setShowStockDialog(true)}
        >
          <Boxes className="w-4 h-4 mr-2" />
          Manage Stock
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Boxes className="w-5 h-5 text-deep-sky-blue" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{totals.total}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">Across entire network</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Warehouse</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{totals.warehouse}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">Ready for distribution</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-2xl bg-green-50/30 border-green-100 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-green-700/50 uppercase tracking-widest">With Agents</span>
            </div>
            <p className="text-3xl font-black text-green-700">{totals.agents}</p>
            <p className="text-xs text-green-600/70 mt-1 font-medium italic">Currently in the field</p>
          </CardContent>
        </Card>
      </div>

      {/* Roster Table */}
      <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-gray-900">Distribution Ledger</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Product or holder name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">Product</TableHead>
                  <TableHead className="font-bold text-gray-700">Holder</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Type</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Quantity</TableHead>
                  <TableHead className="font-bold text-gray-700">Units / Chassis</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{item.product.name}</TableCell>
                    <TableCell>
                      {item.agent ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{item.agent.firstName} {item.agent.lastName}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{item.agent.businessName || 'Independent Agent'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-deep-sky-blue font-bold">
                          <Warehouse className="w-3.5 h-3.5" />
                          Central Warehouse
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.product.isSerialized ? (
                        <Badge className="bg-purple-50 text-purple-600 border-purple-100 font-bold text-[9px] uppercase tracking-widest">Serialized</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 font-medium text-[9px] uppercase tracking-widest">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-black text-gray-900">{item.quantity}</span>
                    </TableCell>
                    <TableCell>
                      {item.product.isSerialized ? (
                        <div className="flex flex-wrap gap-1 max-w-[250px] max-h-[60px] overflow-y-auto pr-2 custom-scrollbar">
                          {item.product.units?.filter((u: any) => u.currentAgentId === item.agentId && !u.isSold)
                            .map((unit: any) => (
                              <span key={unit.id} className="inline-block px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-black tabular-nums text-gray-500 hover:bg-white transition-colors" title={unit.chassisNumber}>
                                {unit.chassisNumber}
                              </span>
                            ))
                          }
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Bulk (non-serialized)</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-400 font-bold">
                      No matching inventory records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Manage Stock Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="max-w-md rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Boxes className="w-6 h-6 text-deep-sky-blue" />
            </div>
            <DialogTitle className="text-2xl font-bold">Manage Warehouse Stock</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Add stock or register chassis numbers for existing units.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Select Product</Label>
              <select
                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-medium focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = uniqueProducts.find(p => p.id === e.target.value);
                  setSelectedProduct(product || null);
                  setStockMode('ADD');
                  setChassisInput('');
                  setStockAdjustment(0);
                }}
              >
                <option value="">Choose a product...</option>
                {uniqueProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.isSerialized ? '(Serialized)' : '(Standard)'}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-sm font-bold text-gray-600">Current Warehouse Stock</span>
                  <span className="text-xl font-black text-gray-900">{getWarehouseStock(selectedProduct.id)}</span>
                </div>

                {selectedProduct.isSerialized && (
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                    <button
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'ADD' ? 'bg-white shadow text-deep-sky-blue' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => { setStockMode('ADD'); setStockAdjustment(0); setChassisInput(''); }}
                    >
                      Add Stock
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'REMOVE' ? 'bg-white shadow text-red-500' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => { setStockMode('REMOVE'); setStockAdjustment(0); setChassisInput(''); }}
                    >
                      Remove Stock
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'REGISTER' ? 'bg-white shadow text-deep-sky-blue' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => { setStockMode('REGISTER'); setChassisInput(''); }}
                    >
                      Register Units
                    </button>
                  </div>
                )}

                {!selectedProduct.isSerialized && (
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                    <button
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'ADD' ? 'bg-white shadow text-deep-sky-blue' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => { setStockMode('ADD'); setStockAdjustment(0); }}
                    >
                      Add Stock
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'REMOVE' ? 'bg-white shadow text-red-500' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => { setStockMode('REMOVE'); setStockAdjustment(0); }}
                    >
                      Remove Stock
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {(stockMode === 'ADD' || stockMode === 'REMOVE') && (
                    <>
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        {stockMode === 'ADD' ? 'Units to Add' : 'Units to Remove'}
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 150"
                        value={stockAdjustment || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setStockAdjustment(Math.abs(val));
                        }}
                        className={`h-12 bg-white border-gray-200 rounded-xl font-bold text-lg mb-4 ${stockMode === 'REMOVE' ? 'border-red-200 focus:border-red-400' : ''}`}
                        min="0"
                      />
                    </>
                  )}
                  
                  {selectedProduct.isSerialized && (stockMode === 'ADD' || stockMode === 'REMOVE' || stockMode === 'REGISTER') && (
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Chassis Numbers</Label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".txt,.csv"
                            className="hidden"
                            id="bulk-chassis-upload-inv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const text = event.target?.result as string;
                                  const lines = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                                  setChassisInput(lines.join('\n'));
                                  if (stockMode === 'ADD' || stockMode === 'REMOVE') {
                                    setStockAdjustment(lines.length);
                                  }
                                };
                                reader.readAsText(file);
                              }
                            }}
                          />
                          <Label 
                            htmlFor="bulk-chassis-upload-inv" 
                            className={`text-[10px] px-2 py-1 rounded cursor-pointer transition-colors ${stockMode === 'REMOVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-deep-sky-blue hover:bg-blue-100'}`}
                          >
                            Bulk Upload (CSV)
                          </Label>
                        </div>
                      </div>
                      <textarea
                        placeholder="Enter chassis numbers, one per line..."
                        value={chassisInput}
                        onChange={(e) => {
                          setChassisInput(e.target.value);
                          if (stockMode === 'ADD' || stockMode === 'REMOVE') {
                            const count = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
                            setStockAdjustment(count);
                          }
                        }}
                        className={`w-full h-32 p-3 bg-white border rounded-xl text-sm font-mono focus:ring-4 outline-none transition-all resize-none ${stockMode === 'REMOVE' ? 'border-red-200 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-deep-sky-blue focus:ring-deep-sky-blue/5'}`}
                      />
                      <p className="text-[10px] text-gray-400 font-medium italic">
                        Detected {chassisInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length} units.
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 font-medium pl-1 flex items-center gap-1 mt-4">
                    <AlertCircle className="w-3 h-3" />
                    {stockMode === 'ADD' && 'This will record an INITIAL_STOCK transaction and increment total stock.'}
                    {stockMode === 'REMOVE' && 'This will remove chassis numbers from warehouse stock and decrement quantity.'}
                    {stockMode === 'REGISTER' && 'This will associate chassis numbers with existing stock without increasing quantity.'}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => {
                setShowStockDialog(false);
                setSelectedProduct(null);
                setChassisInput('');
                setStockAdjustment(0);
                setStockMode('ADD');
              }}
            >
              Cancel
            </Button>
            <Button
              className={`h-12 flex-1 rounded-xl font-bold ${stockMode === 'REMOVE' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
              onClick={handleUpdateStock}
              disabled={actionLoading || !selectedProduct || (stockMode === 'ADD' && stockAdjustment === 0) || (stockMode === 'REMOVE' && stockAdjustment === 0) || (stockMode === 'REGISTER' && chassisInput.trim() === '')}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (stockMode === 'REGISTER' ? 'Register Units' : stockMode === 'REMOVE' ? 'Remove Stock' : 'Add Stock')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
