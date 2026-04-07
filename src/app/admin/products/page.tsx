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
  AlertCircle,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [stockMode, setStockMode] = useState<'ADD' | 'REMOVE' | 'REGISTER'>('ADD');
  const [actionLoading, setActionLoading] = useState(false);

  // New Product State
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    nameAm: '',
    nameOr: '',
    category: '',
    price: '',
    description: '',
    isSerialized: false,
    featured: false,
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Edit Product State
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    nameAm: '',
    nameOr: '',
    category: '',
    price: '',
    description: '',
    isSerialized: false,
    featured: false,
    isActive: true,
  });
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // Delete Product State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
            notes: stockMode === 'REMOVE' ? 'Stock removal from admin panel' : 'Manual stock adjustment from admin panel',
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

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      toast({
        title: 'Validation Error',
        description: 'Name and category are required.',
        variant: 'destructive',
      });
      return;
    }

    setAddingProduct(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          nameAm: newProduct.nameAm || null,
          nameOr: newProduct.nameOr || null,
          category: newProduct.category,
          price: newProduct.price || null,
          description: newProduct.description || null,
          isSerialized: newProduct.isSerialized,
          featured: newProduct.featured,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Product Created',
          description: `Successfully added ${newProduct.name} to the catalog.`,
        });
        fetchData();
        setShowAddProductDialog(false);
        setNewProduct({
          name: '',
          nameAm: '',
          nameOr: '',
          category: '',
          price: '',
          description: '',
          isSerialized: false,
          featured: false,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingProduct(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      nameAm: product.nameAm || '',
      nameOr: product.nameOr || '',
      category: product.category,
      price: product.price?.toString() || '',
      description: product.description || '',
      isSerialized: product.isSerialized,
      featured: product.featured,
      isActive: product.isActive,
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editProductData.name || !editProductData.category) {
      toast({
        title: 'Validation Error',
        description: 'Name and category are required.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingProduct(true);
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProductData.name,
          nameAm: editProductData.nameAm || null,
          nameOr: editProductData.nameOr || null,
          category: editProductData.category,
          price: editProductData.price || null,
          description: editProductData.description || null,
          isSerialized: editProductData.isSerialized,
          featured: editProductData.featured,
          isActive: editProductData.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Product Updated',
          description: `Successfully updated ${editProductData.name}.`,
        });
        fetchData();
        setShowEditDialog(false);
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProduct(false);
    }
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Product Deleted',
          description: data.message || `Successfully deleted ${deletingProduct.name}.`,
        });
        fetchData();
        setShowDeleteDialog(false);
        setDeletingProduct(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
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
        <Button 
          className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-6 rounded-lg shadow-lg shadow-gray-200 transition-all"
          onClick={() => setShowAddProductDialog(true)}
        >
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
                  <Button 
                    variant="outline" 
                    className="w-10 h-10 rounded-lg border-gray-200 text-gray-400 hover:text-deep-sky-blue hover:border-deep-sky-blue"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-10 h-10 rounded-lg border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="w-4 h-4" />
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

            {!selectedProduct?.isSerialized && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
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

            <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
              <span className="text-sm font-bold text-gray-600">Current Warehouse Stock</span>
              <span className="text-xl font-black text-gray-900">{selectedProduct ? getWarehouseStock(selectedProduct.id) : 0}</span>
            </div>

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
              
              {selectedProduct?.isSerialized && (stockMode === 'ADD' || stockMode === 'REMOVE' || stockMode === 'REGISTER') && (
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
                              if (stockMode === 'ADD' || stockMode === 'REMOVE') {
                                setStockAdjustment(lines.length);
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <Label 
                        htmlFor="bulk-chassis-upload" 
                        className={`text-[10px] px-2 py-1 rounded cursor-pointer hover: transition-colors ${stockMode === 'REMOVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-deep-sky-blue hover:bg-blue-100'}`}
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
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => {
                setShowStockDialog(false);
                setStockAdjustment(0);
                setChassisInput('');
                setStockMode('ADD');
              }}
            >
              Cancel
            </Button>
            <Button
              className={`h-12 flex-1 rounded-xl font-bold ${stockMode === 'REMOVE' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
              onClick={handleUpdateStock}
              disabled={actionLoading || (stockMode === 'ADD' && stockAdjustment === 0) || (stockMode === 'REMOVE' && stockAdjustment === 0) || (stockMode === 'REGISTER' && chassisInput.trim() === '')}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (stockMode === 'REGISTER' ? 'Register Units' : stockMode === 'REMOVE' ? 'Remove Stock' : 'Add Stock')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Add a new product to the catalog. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Product Name *</Label>
              <Input
                placeholder="e.g., ETUK Pro Max"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="h-12 bg-white border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Name (Amharic)</Label>
                <Input
                  placeholder="e.g., ኢቱክ ፕሮ ማክስ"
                  value={newProduct.nameAm}
                  onChange={(e) => setNewProduct({ ...newProduct, nameAm: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Name (Oromo)</Label>
                <Input
                  placeholder="e.g., ETUK Pro Max"
                  value={newProduct.nameOr}
                  onChange={(e) => setNewProduct({ ...newProduct, nameOr: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Category *</Label>
                <select
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-medium focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  <option value="SCOOTER">Electric Scooter</option>
                  <option value="MOTORCYCLE">Electric Motorcycle</option>
                  <option value="TRICYCLE">Electric Tricycle</option>
                  <option value="3-WHEELER">3-Wheeler</option>
                  <option value="BICYCLE">Electric Bicycle</option>
                  <option value="ACCESSORY">Accessories</option>
                  <option value="SPARE_PART">Spare Parts</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Price (ETB)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 45000"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</Label>
              <textarea
                placeholder="Product description..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.isSerialized}
                  onChange={(e) => setNewProduct({ ...newProduct, isSerialized: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-deep-sky-blue focus:ring-deep-sky-blue"
                />
                <span className="text-sm font-medium text-gray-700">Serialized Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>

            <p className="text-[10px] text-gray-400 font-medium pl-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Serialized products require unique chassis numbers for each unit.
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => {
                setShowAddProductDialog(false);
                setNewProduct({
                  name: '',
                  nameAm: '',
                  nameOr: '',
                  category: '',
                  price: '',
                  description: '',
                  isSerialized: false,
                  featured: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleAddProduct}
              disabled={addingProduct || !newProduct.name || !newProduct.category}
            >
              {addingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Edit className="w-6 h-6 text-deep-sky-blue" />
            </div>
            <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Update the details for <strong>{editingProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Product Name *</Label>
              <Input
                placeholder="e.g., ETUK Pro Max"
                value={editProductData.name}
                onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                className="h-12 bg-white border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Name (Amharic)</Label>
                <Input
                  placeholder="e.g., ኢቱክ ፕሮ ማክስ"
                  value={editProductData.nameAm}
                  onChange={(e) => setEditProductData({ ...editProductData, nameAm: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Name (Oromo)</Label>
                <Input
                  placeholder="e.g., ETUK Pro Max"
                  value={editProductData.nameOr}
                  onChange={(e) => setEditProductData({ ...editProductData, nameOr: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Category *</Label>
                <select
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-medium focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
                  value={editProductData.category}
                  onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  <option value="SCOOTER">Electric Scooter</option>
                  <option value="MOTORCYCLE">Electric Motorcycle</option>
                  <option value="TRICYCLE">Electric Tricycle</option>
                  <option value="3-WHEELER">3-Wheeler</option>
                  <option value="BICYCLE">Electric Bicycle</option>
                  <option value="ACCESSORY">Accessories</option>
                  <option value="SPARE_PART">Spare Parts</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Price (ETB)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 45000"
                  value={editProductData.price}
                  onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</Label>
              <textarea
                placeholder="Product description..."
                value={editProductData.description}
                onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProductData.isSerialized}
                  onChange={(e) => setEditProductData({ ...editProductData, isSerialized: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-deep-sky-blue focus:ring-deep-sky-blue"
                />
                <span className="text-sm font-medium text-gray-700">Serialized</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProductData.featured}
                  onChange={(e) => setEditProductData({ ...editProductData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProductData.isActive}
                  onChange={(e) => setEditProductData({ ...editProductData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold border-gray-200"
              onClick={() => {
                setShowEditDialog(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl bg-deep-sky-blue hover:bg-deep-sky-blue/90 text-white font-bold"
              onClick={handleUpdateProduct}
              disabled={updatingProduct || !editProductData.name || !editProductData.category}
            >
              {updatingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-center">
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
              {deletingProduct?.isSerialized && (
                <span className="block mt-2 text-amber-600 text-sm">
                  This is a serialized product with chassis tracking. The product will be deactivated instead.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl font-bold border-gray-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-12 flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleDeleteProduct}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
