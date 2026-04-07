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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Package,
  User,
  Phone,
  Calendar,
  Search,
  Loader2,
  ShoppingCart,
  CheckCircle,
  Truck,
  DollarSign,
} from 'lucide-react';

interface ProductUnit {
  id: string;
  chassisNumber: string;
  productId: string;
  product: {
    id: string;
    name: string;
    category: string;
    price: number | null;
  };
  createdAt: string;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  soldAt: string;
  notes: string | null;
  productUnit: {
    id: string;
    chassisNumber: string;
    product: {
      name: string;
    };
  };
}

interface AgentData {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
}

export default function AgentPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState({ totalUnits: 0, totalValue: 0, totalSold: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [recordingSale, setRecordingSale] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/my-units');
      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
        setUnits(data.units || []);
        setSales(data.sales || []);
        setStats(data.stats || { totalUnits: 0, totalValue: 0, totalSold: 0 });
      } else if (res.status === 404) {
        toast({
          title: 'Access Denied',
          description: 'You are not registered as an agent.',
          variant: 'destructive',
        });
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.chassisNumber.toLowerCase().includes(search.toLowerCase()) ||
    unit.product.name.toLowerCase().includes(search.toLowerCase())
  );

  const openSaleDialog = (unit: ProductUnit) => {
    setSelectedUnit(unit);
    setCustomerName('');
    setCustomerPhone('');
    setSaleNotes('');
    setShowSaleDialog(true);
  };

  const handleRecordSale = async () => {
    if (!selectedUnit || !customerName || !customerPhone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setRecordingSale(true);
    try {
      const res = await fetch('/api/agent/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUnitId: selectedUnit.id,
          customerName,
          customerPhone,
          notes: saleNotes || null
        })
      });

      if (res.ok) {
        toast({
          title: 'Sale Recorded',
          description: `Successfully recorded sale to ${customerName}`,
        });
        fetchData();
        setShowSaleDialog(false);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record sale');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale',
        variant: 'destructive',
      });
    } finally {
      setRecordingSale(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-500">Loading your portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Portal</h1>
          <p className="text-gray-500 mt-1">Welcome back, {agent?.firstName} {agent?.lastName} {agent?.businessName ? `(${agent.businessName})` : ''}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-deep-sky-blue" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Units</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalUnits}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalValue.toLocaleString()} ETB</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units Sold</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalSold}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="units" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="units" className="rounded-lg data-[state=active]:bg-deep-sky-blue data-[state=active]:text-white">
              <Truck className="w-4 h-4 mr-2" />
              My Units ({units.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-deep-sky-blue data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales History ({sales.length})
            </TabsTrigger>
          </TabsList>

          {/* My Units Tab */}
          <TabsContent value="units">
            <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Assigned Units</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search units..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-10 bg-white border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredUnits.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium">No units assigned</p>
                    <p className="text-sm">Units assigned to you will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="font-bold">Chassis Number</TableHead>
                          <TableHead className="font-bold">Product</TableHead>
                          <TableHead className="font-bold">Category</TableHead>
                          <TableHead className="font-bold">Price</TableHead>
                          <TableHead className="font-bold">Date Assigned</TableHead>
                          <TableHead className="font-bold text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUnits.map((unit) => (
                          <TableRow key={unit.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-mono font-bold">{unit.chassisNumber}</TableCell>
                            <TableCell className="font-medium">{unit.product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{unit.product.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {unit.product.price ? `${unit.product.price.toLocaleString()} ETB` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {new Date(unit.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => openSaleDialog(unit)}
                              >
                                Record Sale
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales History Tab */}
          <TabsContent value="sales">
            <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold text-gray-900">Sales History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sales.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium">No sales recorded yet</p>
                    <p className="text-sm">Your sales history will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="font-bold">Date</TableHead>
                          <TableHead className="font-bold">Customer</TableHead>
                          <TableHead className="font-bold">Phone</TableHead>
                          <TableHead className="font-bold">Product</TableHead>
                          <TableHead className="font-bold">Chassis Number</TableHead>
                          <TableHead className="font-bold">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id} className="hover:bg-gray-50/50">
                            <TableCell className="text-gray-500">
                              {new Date(sale.soldAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">{sale.customerName}</TableCell>
                            <TableCell className="font-mono">{sale.customerPhone}</TableCell>
                            <TableCell>{sale.productUnit.product.name}</TableCell>
                            <TableCell className="font-mono font-bold">{sale.productUnit.chassisNumber}</TableCell>
                            <TableCell className="text-gray-500 text-sm">{sale.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Record Sale Dialog */}
        <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
          <DialogContent className="max-w-md rounded-2xl p-8 border-none shadow-2xl">
            <DialogHeader>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold">Record Sale</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">
                Record the sale of <strong>{selectedUnit?.product.name}</strong> (Chassis: {selectedUnit?.chassisNumber})
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Customer Name *</Label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Customer Phone *</Label>
                <Input
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-12 bg-white border-gray-200 rounded-xl"
                  type="tel"
                />
              </div>

              {selectedUnit?.product.price && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-800">
                    <strong>Unit Price:</strong> {selectedUnit.product.price.toLocaleString()} ETB
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Notes (Optional)</Label>
                <textarea
                  placeholder="Add any notes about this sale..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl font-bold border-gray-200"
                onClick={() => setShowSaleDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-12 flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={handleRecordSale}
                disabled={recordingSale || !customerName || !customerPhone}
              >
                {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Sale'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}