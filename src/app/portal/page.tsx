'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Users,
  Search,
  Loader2,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
  customerId: string | null;
  productUnit: {
    id: string;
    chassisNumber: string;
    product: {
      name: string;
      category: string;
      price: number | null;
    };
  };
  customer?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
}

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  _count?: {
    sales: number;
  };
}

interface AgentData {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
}

interface Stats {
  totalUnits: number;
  totalValue: number;
  totalSold: number;
  totalCustomers: number;
  recentSales: number;
  monthlyRevenue: number;
}

function PortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUnits: 0,
    totalValue: 0,
    totalSold: 0,
    totalCustomers: 0,
    recentSales: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Sale dialog state
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<ProductUnit[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState('');
  const [recordingSale, setRecordingSale] = useState(false);

  // Customer dialog state
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/portal');
      return;
    }
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, salesRes, customersRes] = await Promise.all([
        fetch('/api/agent/my-units'),
        fetch('/api/agent/sales'),
        fetch('/api/agent/customers')
      ]);

      if (unitsRes.status === 401) {
        router.push('/auth/login?redirect=/portal');
        return;
      }
      if (unitsRes.status === 403) {
        toast({ title: 'Account Not Approved', description: 'Your agent account has not been approved yet.', variant: 'destructive' });
        router.push('/');
        return;
      }
      if (unitsRes.status === 404) {
        toast({ title: 'Access Denied', description: 'You are not registered as an agent.', variant: 'destructive' });
        router.push('/');
        return;
      }

      const unitsData = await unitsRes.json();
      const salesData = await salesRes.json();
      const customersData = await customersRes.json();

      setAgent(unitsData.agent);
      setUnits(unitsData.units || []);
      setSales(salesData.sales || []);
      setCustomers(customersData || []);

      // Calculate monthly revenue
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = (salesData.sales || [])
        .filter((s: Sale) => new Date(s.soldAt) >= monthStart)
        .reduce((sum: number, s: Sale) => sum + (s.productUnit.product.price || 0), 0);

      setStats({
        totalUnits: unitsData.stats?.totalUnits || 0,
        totalValue: unitsData.stats?.totalValue || 0,
        totalSold: unitsData.stats?.totalSold || 0,
        totalCustomers: customersData.length || 0,
        recentSales: salesData.sales?.slice(0, 5).length || 0,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Error', description: 'Failed to load your data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.chassisNumber.toLowerCase().includes(search.toLowerCase()) ||
    unit.product.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const openSaleDialog = (units: ProductUnit[]) => {
    setSelectedUnits(units);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setSaleNotes('');
    setShowSaleDialog(true);
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setSelectedCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerId(customer.id);
        setCustomerName(customer.fullName);
        setCustomerPhone(customer.phone);
      }
    }
  };

  const handleRecordSale = async () => {
    if (selectedUnits.length === 0 || !customerName || !customerPhone) {
      toast({ title: 'Validation Error', description: 'Please select units and fill customer details', variant: 'destructive' });
      return;
    }

    setRecordingSale(true);
    try {
      const res = await fetch('/api/agent/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUnitIds: selectedUnits.map(u => u.id),
          customerId: selectedCustomerId || null,
          customerName,
          customerPhone,
          notes: saleNotes || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Sale Recorded', description: `${data.count} unit(s) sold to ${customerName}` });
        fetchData();
        setShowSaleDialog(false);
        setSelectedUnits([]);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record sale');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to record sale', variant: 'destructive' });
    } finally {
      setRecordingSale(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.fullName || !customerForm.phone) {
      toast({ title: 'Validation Error', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }

    setSavingCustomer(true);
    try {
      const url = editingCustomer ? `/api/agent/customers/${editingCustomer.id}` : '/api/agent/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });

      if (res.ok) {
        toast({ title: 'Success', description: editingCustomer ? 'Customer updated' : 'Customer created' });
        fetchData();
        setShowCustomerDialog(false);
        setEditingCustomer(null);
        setCustomerForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save customer');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingCustomer(false);
    }
  };

  const openCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
    }
    setShowCustomerDialog(true);
  };

  const calculateSaleTotal = () => {
    return selectedUnits.reduce((sum, u) => sum + (u.product.price || 0), 0);
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
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-500 mt-1">{agent?.firstName} {agent?.lastName} {agent?.businessName ? `· ${agent.businessName}` : ''}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Available</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Inventory Value</p>
                  <p className="text-xl font-black text-gray-900">{(stats.totalValue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Sold</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalSold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Customers</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">This Month</p>
                  <p className="text-xl font-black text-gray-900">{(stats.monthlyRevenue / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Conv. Rate</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalUnits > 0 ? Math.round((stats.totalSold / (stats.totalSold + stats.totalUnits)) * 100) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="units" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="units" className="rounded-lg data-[state=active]:bg-deep-sky-blue data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Units ({units.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-deep-sky-blue data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales ({sales.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-deep-sky-blue data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Customers ({customers.length})
            </TabsTrigger>
          </TabsList>

          {/* Units Tab */}
          <TabsContent value="units">
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold text-gray-900">My Units</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search units..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-9 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    {selectedUnits.length > 0 && (
                      <Button
                        onClick={() => openSaleDialog(selectedUnits)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Sell ({selectedUnits.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredUnits.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium">No units assigned</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="w-10 px-4">
                            <Checkbox
                              checked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUnits(filteredUnits);
                                } else {
                                  setSelectedUnits([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="font-bold">Chassis</TableHead>
                          <TableHead className="font-bold">Product</TableHead>
                          <TableHead className="font-bold">Category</TableHead>
                          <TableHead className="font-bold">Price</TableHead>
                          <TableHead className="font-bold">Received</TableHead>
                          <TableHead className="font-bold text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUnits.map((unit) => (
                          <TableRow key={unit.id} className="hover:bg-gray-50/50">
                            <TableCell className="px-4">
                              <Checkbox
                                checked={selectedUnits.some(u => u.id === unit.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUnits([...selectedUnits, unit]);
                                  } else {
                                    setSelectedUnits(selectedUnits.filter(u => u.id !== unit.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-mono font-bold text-sm">{unit.chassisNumber}</TableCell>
                            <TableCell className="font-medium">{unit.product.name}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{unit.product.category}</Badge></TableCell>
                            <TableCell className="font-medium">{unit.product.price ? `${unit.product.price.toLocaleString()} ETB` : 'N/A'}</TableCell>
                            <TableCell className="text-gray-500 text-sm">{new Date(unit.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                              <Button size="sm" variant="outline" className="h-8" onClick={() => openSaleDialog([unit])}>
                                Sell
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

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold text-gray-900">Sales History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sales.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium">No sales recorded yet</p>
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
                          <TableHead className="font-bold">Chassis</TableHead>
                          <TableHead className="font-bold">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id} className="hover:bg-gray-50/50">
                            <TableCell className="text-gray-500 text-sm">{new Date(sale.soldAt).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{sale.customerName}</TableCell>
                            <TableCell className="font-mono text-sm">{sale.customerPhone}</TableCell>
                            <TableCell>{sale.productUnit.product.name}</TableCell>
                            <TableCell className="font-mono font-bold text-sm">{sale.productUnit.chassisNumber}</TableCell>
                            <TableCell className="font-medium">{sale.productUnit.product.price ? `${sale.productUnit.product.price.toLocaleString()} ETB` : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold text-gray-900">My Customers</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10 h-9 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <Button onClick={() => openCustomerDialog()} className="bg-deep-sky-blue hover:bg-blue-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredCustomers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium">No customers yet</p>
                    <p className="text-sm mt-1">Add customers to track your sales</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="font-bold">Name</TableHead>
                          <TableHead className="font-bold">Phone</TableHead>
                          <TableHead className="font-bold">Email</TableHead>
                          <TableHead className="font-bold">Purchases</TableHead>
                          <TableHead className="font-bold">Added</TableHead>
                          <TableHead className="font-bold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium">{customer.fullName}</TableCell>
                            <TableCell className="font-mono text-sm">{customer.phone}</TableCell>
                            <TableCell className="text-gray-500 text-sm">{customer.email || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{customer._count?.sales || 0} sales</Badge>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button size="sm" variant="outline" className="h-8" onClick={() => openCustomerDialog(customer)}>
                                  Edit
                                </Button>
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                                  setSelectedCustomerId(customer.id);
                                  setCustomerName(customer.fullName);
                                  setCustomerPhone(customer.phone);
                                  setShowSaleDialog(true);
                                  setSelectedUnits([]);
                                }}>
                                  Sell
                                </Button>
                              </div>
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
        </Tabs>

        {/* Sale Dialog */}
        <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
          <DialogContent className="max-w-lg rounded-xl p-0 overflow-hidden">
            <DialogHeader className="bg-gray-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Record Sale</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {selectedUnits.length > 0 ? `${selectedUnits.length} unit(s) selected` : 'Quick sale'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-5">
              {/* Selected Units Summary */}
              {selectedUnits.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Selected Units</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUnits.map((unit) => (
                      <Badge key={unit.id} variant="outline" className="font-mono text-xs">
                        {unit.chassisNumber} - {unit.product.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-right mt-2 text-lg font-bold text-gray-900">
                    Total: {calculateSaleTotal().toLocaleString()} ETB
                  </p>
                </div>
              )}

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                    <SelectValue placeholder="Choose existing or enter new" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.phone})</SelectItem>
                    ))}
                    <SelectItem value="new">+ New Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Customer Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => { setCustomerName(e.target.value); setSelectedCustomerId(''); }}
                    className="h-11 bg-white border-gray-200 rounded-xl"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Phone *</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => { setCustomerPhone(e.target.value); setSelectedCustomerId(''); }}
                    className="h-11 bg-white border-gray-200 rounded-xl font-mono"
                    placeholder="+251..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Notes (Optional)</Label>
                <Textarea
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="bg-white border-gray-200 rounded-xl min-h-[80px] resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 gap-3">
              <Button variant="outline" onClick={() => setShowSaleDialog(false)} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={handleRecordSale}
                disabled={recordingSale || !customerName || !customerPhone}
              >
                {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : `Complete Sale (${selectedUnits.length || 1})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Dialog */}
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden">
            <DialogHeader className="bg-gray-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'New Customer'}</DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Full Name *</Label>
                <Input
                  value={customerForm.fullName}
                  onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                  className="h-11 bg-white border-gray-200 rounded-xl"
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</Label>
                <Input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="h-11 bg-white border-gray-200 rounded-xl font-mono"
                  placeholder="+251..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Email (Optional)</Label>
                <Input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="h-11 bg-white border-gray-200 rounded-xl"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Address (Optional)</Label>
                <Input
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="h-11 bg-white border-gray-200 rounded-xl"
                  placeholder="Location"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Notes</Label>
                <Textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="bg-white border-gray-200 rounded-xl min-h-[60px] resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 gap-3">
              <Button variant="outline" onClick={() => { setShowCustomerDialog(false); setEditingCustomer(null); }} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                className="h-11 px-6 bg-deep-sky-blue hover:bg-blue-600 text-white rounded-xl"
                onClick={handleSaveCustomer}
                disabled={savingCustomer || !customerForm.fullName || !customerForm.phone}
              >
                {savingCustomer ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function AgentPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}