'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Search, ShoppingCart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductUnit {
  id: string;
  chassisNumber: string;
  product: { id: string; name: string; category: string; price: number | null };
  createdAt: string;
}

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  _count?: { sales: number };
}

function UnitsContent() {
  const router = useRouter();
  const { status } = useSession();
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<ProductUnit[]>([]);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [recordingSale, setRecordingSale] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?redirect=/portal');
    if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, customersRes] = await Promise.all([
        fetch('/api/agent/my-units'),
        fetch('/api/agent/customers')
      ]);
      if (unitsRes.ok) setUnits((await unitsRes.json()).units || []);
      if (customersRes.ok) setCustomers(await customersRes.json());
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(u =>
    u.chassisNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordSale = async () => {
    if (selectedUnits.length === 0 || !customerName || !customerPhone) {
      toast({ title: 'Error', description: 'Select units and fill customer details', variant: 'destructive' });
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
          customerPhone
        })
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Sale recorded' });
        setShowSaleDialog(false);
        setSelectedUnits([]);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setRecordingSale(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Units</h1>
        {selectedUnits.length > 0 && (
          <Button onClick={() => setShowSaleDialog(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold">
            <ShoppingCart className="w-4 h-4 mr-2" />Sell ({selectedUnits.length})
          </Button>
        )}
      </div>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by chassis or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 bg-white border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUnits.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No units assigned</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-10 px-4">
                    <Checkbox checked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                      onCheckedChange={(checked) => setSelectedUnits(checked ? filteredUnits : [])} />
                  </TableHead>
                  <TableHead className="font-bold">Chassis</TableHead>
                  <TableHead className="font-bold">Product</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Received</TableHead>
                  <TableHead className="font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-4">
                      <Checkbox checked={selectedUnits.some(u => u.id === unit.id)}
                        onCheckedChange={(checked) => setSelectedUnits(checked ? [...selectedUnits, unit] : selectedUnits.filter(u => u.id !== unit.id))} />
                    </TableCell>
                    <TableCell className="font-mono font-bold text-sm">{unit.chassisNumber}</TableCell>
                    <TableCell className="font-medium">{unit.product.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{unit.product.category}</Badge></TableCell>
                    <TableCell className="font-medium">{unit.product.price ? `${unit.product.price.toLocaleString()} ETB` : 'N/A'}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(unit.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-8 font-bold" onClick={() => { setSelectedUnits([unit]); setShowSaleDialog(true); }}>Sell</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sale Dialog */}
      {showSaleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
            <div className="bg-gray-900 p-6 text-white">
              <h2 className="text-xl font-bold">Record Sale</h2>
              <p className="text-gray-300 text-sm">{selectedUnits.length} unit(s) selected</p>
            </div>
            <div className="p-6 space-y-4">
              {selectedUnits.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 mb-1">Total</p>
                  <p className="text-lg font-bold">{selectedUnits.reduce((s, u) => s + (u.product.price || 0), 0).toLocaleString()} ETB</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Customer</label>
                <select className="w-full h-11 bg-white border border-gray-200 rounded-lg px-3"
                  value={selectedCustomerId} onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (e.target.value === 'new') { setCustomerName(''); setCustomerPhone(''); }
                    else {
                      const c = customers.find(c => c.id === e.target.value);
                      if (c) { setCustomerName(c.fullName); setCustomerPhone(c.phone); }
                    }
                  }}>
                  <option value="new">+ New Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Name *</label>
                  <Input value={customerName} onChange={(e) => { setCustomerName(e.target.value); setSelectedCustomerId(''); }}
                    className="h-11" placeholder="Customer name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone *</label>
                  <Input value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setSelectedCustomerId(''); }}
                    className="h-11" placeholder="+251..." />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSaleDialog(false)} className="h-10 px-4 font-bold">Cancel</Button>
              <Button onClick={handleRecordSale} disabled={recordingSale || !customerName || !customerPhone}
                className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-bold">
                {recordingSale ? 'Saving...' : `Complete Sale (${selectedUnits.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnitsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <UnitsContent />
    </Suspense>
  );
}