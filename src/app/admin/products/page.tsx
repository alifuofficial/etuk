'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Edit, 
  Star, 
  Plus,
  Boxes,
  Loader2,
  AlertCircle
} from 'lucide-react';
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
  nameAm: string | null;
  nameOr: string | null;
  description: string | null;
  category: string;
  specifications: string | null;
  price: number | null;
  isActive: boolean;
  featured: boolean;
  isSerialized: boolean;
  createdAt: string;
}

interface InventoryItem {
  productId: string;
  agentId: string | null;
  quantity: number;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stock Management State
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [chassisInput, setChassisInput] = useState<string>('');
  const [stockMode, setStockMode] = useState<'ADD' | 'REGISTER'>('ADD');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory')
      ]);

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      }
      
      if (inventoryRes.ok) {
        const invData = await inventoryRes.json();
        setInventory(Array.isArray(invData) ? invData : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    if (stockMode === 'ADD' && stockAdjustment === 0) return;

    const chassisNumbers = selectedProduct.isSerialized 
      ? chassisInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : null;

    if (selectedProduct.isSerialized) {
      if (stockMode === 'ADD' && (!chassisNumbers || chassisNumbers.length !== stockAdjustment)) {
        toast({
          title: 'Input Error',
          description: `Please provide exactly ${stockAdjustment} chassis numbers.`,
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
      const body = stockMode === 'REGISTER' 
        ? { productId: selectedProduct.id, chassisNumbers }
        : {
            productId: selectedProduct.id,
            quantity: stockAdjustment,
            notes: 'Manual stock adjustment from admin panel',
            chassisNumbers
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: stockMode === 'REGISTER' ? 'Units Registered' : 'Stock Updated',
          description: stockMode === 'REGISTER' 
            ? `Successfully registered ${chassisNumbers?.length} chassis numbers.`
            : `Successfully added ${stockAdjustment} units to ${selectedProduct.name}.`,
        });
        fetchData();
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

  const getWarehouseStock = (productId: string) => {
    const item = inventory.find(i => i.productId === productId && i.agentId === null);
    return item ? item.quantity : 0;
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-[10px] font-bold uppercase">
        Inactive
      </span>
    );
  };

  const parseSpecs = (specsJson: string | null) => {
    if (!specsJson) return null;
    try {
      return JSON.parse(specsJson);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-500">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the ETUK product catalog and track unit distribution.</p>
        </div>
        <Button className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-6 rounded-lg shadow-lg shadow-gray-200 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const specs = parseSpecs(product.specifications);
          const stock = getWarehouseStock(product.id);
          
          return (
            <Card key={product.id} className="group overflow-hidden bg-white border-gray-200 rounded-xl hover:shadow-md transition-shadow outline-none flex flex-col">
              {/* Image Placeholder */}
              <div className="h-48 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
                <Package className="w-16 h-16 text-gray-200" />
                <div className="absolute top-4 left-4">
                   <span className="bg-white/80 backdrop-blur-sm border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 uppercase">
                    {product.category}
                  </span>
                </div>
                {product.featured && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                )}
                
                {/* Stock Tag */}
                <div className="absolute bottom-4 right-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${stock > 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <Boxes className={`w-3.5 h-3.5 ${stock > 0 ? 'text-deep-sky-blue' : 'text-red-500'}`} />
                    <span className="text-xs font-black">{stock} <span className="font-bold opacity-60">Units</span></span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
                  {getStatusBadge(product.isActive)}
                </div>
                
                {product.nameAm && (
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                    {product.nameAm}
                  </p>
                )}

                {/* Specs Summary */}
                {specs && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 text-xs">Motor Power</p>
                      <p className="text-xs font-bold text-gray-900">{specs.engine?.motorPower || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 text-xs">Max Range</p>
                      <p className="text-xs font-bold text-gray-900">{specs.performance?.maxRange || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 rounded-lg border-gray-200 text-xs font-bold hover:bg-gray-50"
                    onClick={() => {
                      setSelectedProduct(product);
                      setStockMode('ADD');
                      setShowStockDialog(true);
                    }}
                  >
                    <Boxes className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
                    Manage Stock
                  </Button>
                  <Button variant="outline" className="w-10 h-10 rounded-lg border-gray-200 text-gray-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-24 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Catalogue Empty</h3>
            <p className="text-gray-500 text-sm mt-2">No products have been added to the system yet.</p>
          </div>
        )}
      </div>

      {/* Manual Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="max-w-md rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Boxes className="w-6 h-6 text-deep-sky-blue" />
            </div>
            <DialogTitle className="text-2xl font-bold">Adjust Warehouse Stock</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Update the available units for <strong>{selectedProduct?.name}</strong> in the central warehouse.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {selectedProduct?.isSerialized && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'ADD' ? 'bg-white shadow text-deep-sky-blue' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setStockMode('ADD')}
                >
                  Add New Stock
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stockMode === 'REGISTER' ? 'bg-white shadow text-deep-sky-blue' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setStockMode('REGISTER')}
                >
                  Register Existing Units
                </button>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
              <span className="text-sm font-bold text-gray-600">Current Warehouse Stock</span>
              <span className="text-xl font-black text-gray-900">{selectedProduct ? getWarehouseStock(selectedProduct.id) : 0}</span>
            </div>

            <div className="space-y-2 pt-2">
              {stockMode === 'ADD' && (
                <>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Units to Add</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={stockAdjustment || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setStockAdjustment(val);
                    }}
                    className="h-12 bg-white border-gray-200 rounded-xl font-bold text-lg mb-4"
                  />
                </>
              )}
              
              {selectedProduct?.isSerialized && (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Chassis Numbers</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".txt,.csv"
                        className="hidden"
                        id="bulk-chassis-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const text = event.target?.result as string;
                              const lines = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                              setChassisInput(lines.join('\n'));
                              if (stockMode === 'ADD') {
                                setStockAdjustment(lines.length);
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <Label 
                        htmlFor="bulk-chassis-upload" 
                        className="text-[10px] bg-blue-50 text-deep-sky-blue px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors"
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
                      if (stockMode === 'ADD') {
                        const count = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
                        setStockAdjustment(count);
                      }
                    }}
                    className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all resize-none"
                  />
                  <p className="text-[10px] text-gray-400 font-medium italic">
                    Detected {chassisInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length} units.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-gray-400 font-medium pl-1 flex items-center gap-1 mt-4">
                <AlertCircle className="w-3 h-3" />
                {stockMode === 'ADD' 
                  ? 'This will record an INITIAL_STOCK transaction and increment total stock.' 
                  : 'This will associate chassis numbers with existing stock without increasing quantity.'}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => setShowStockDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
              onClick={handleUpdateStock}
              disabled={actionLoading || (stockMode === 'ADD' && stockAdjustment === 0) || (stockMode === 'REGISTER' && chassisInput.trim() === '')}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (stockMode === 'REGISTER' ? 'Register Units' : 'Confirm Adjustment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
