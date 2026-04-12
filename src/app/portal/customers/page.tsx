'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Users, Search, Plus, Loader2, ShoppingCart } from 'lucide-react';

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  _count?: { sales: number };
}

function CustomersContent() {
  const router = useRouter();
  const { status } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?redirect=/portal');
    if (status === 'authenticated') fetchCustomers();
  }, [status, router]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/customers');
      if (res.ok) setCustomers(await res.json());
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load customers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const openDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setForm({ fullName: customer.fullName, phone: customer.phone, email: customer.email || '', address: customer.address || '', notes: customer.notes || '' });
    } else {
      setEditingCustomer(null);
      setForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone) {
      toast({ title: 'Error', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const url = editingCustomer ? `/api/agent/customers/${editingCustomer.id}` : '/api/agent/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        toast({ title: 'Success', description: editingCustomer ? 'Customer updated' : 'Customer created' });
        setShowDialog(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
        <Button onClick={() => openDialog()} className="bg-gray-900 hover:bg-gray-800 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" />Add Customer
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-white border-gray-200 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No customers yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Phone</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Purchases</TableHead>
                  <TableHead className="font-bold">Added</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{customer.phone}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{customer.email || '-'}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs font-bold">{customer._count?.sales || 0} sales</Badge></TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-8 font-bold mr-2" onClick={() => openDialog(customer)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden">
          <DialogHeader className="bg-gray-900 p-6 text-white">
            <DialogTitle className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'New Customer'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="h-11 bg-white border-gray-200 rounded-xl" placeholder="Customer name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 bg-white border-gray-200 rounded-xl font-mono" placeholder="+251..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Email (Optional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 bg-white border-gray-200 rounded-xl" placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Address (Optional)</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11 bg-white border-gray-200 rounded-xl" placeholder="Location" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white border-gray-200 rounded-xl min-h-[60px] resize-none" placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="h-11 px-6 rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.fullName || !form.phone}
              className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <CustomersContent />
    </Suspense>
  );
}