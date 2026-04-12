'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Printer,
  Send,
  Trash2,
  DollarSign,
  Package,
  User,
  Calendar,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ProformaItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ProformaUnit {
  id: string;
  chassisNumber: string;
  status: string;
  product: { name: string };
}

interface Proforma {
  id: string;
  number: string;
  agentId: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  expiresAt: string;
  paidAt: string | null;
  paymentRef: string | null;
  createdAt: string;
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessName: string | null;
  };
  items: ProformaItem[];
  productUnits: ProformaUnit[];
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  status: string;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  isSerialized: boolean;
}

interface AvailableUnit {
  id: string;
  chassisNumber: string;
  product: {
    id: string;
    name: string;
    price: number | null;
  };
}

export default function ProformaPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);
  
  // Create form state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [proformaItems, setProformaItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [proformaNotes, setProformaNotes] = useState('');
  const [validityDays, setValidityDays] = useState(7);
  const [creating, setCreating] = useState(false);
  
  // Payment state
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchProformas();
    fetchAgents();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      fetchAvailableUnits();
    }
  }, [selectedAgentId]);

  const fetchProformas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proforma');
      if (res.ok) {
        const data = await res.json();
        setProformas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch proformas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents?status=APPROVED');
      if (res.ok) {
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?all=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data.filter((p: Product) => p.isSerialized) : []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchAvailableUnits = async () => {
    try {
      const res = await fetch('/api/proforma/available-units');
      if (res.ok) {
        const data = await res.json();
        setAvailableUnits(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch available units:', error);
    }
  };

  const handleCreateProforma = async () => {
    if (!selectedAgentId || proformaItems.length === 0) {
      toast({ title: 'Error', description: 'Select an agent and add at least one item.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/proforma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          items: proformaItems,
          unitIds: selectedUnitIds,
          notes: proformaNotes,
          validityDays,
        }),
      });

      if (res.ok) {
        toast({ title: 'Proforma Created', description: 'New proforma has been generated.' });
        setShowCreateDialog(false);
        resetCreateForm();
        fetchProformas();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create proforma');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedProforma) return;

    setPaymentLoading(true);
    try {
      const res = await fetch(`/api/proforma/${selectedProforma.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', paymentRef }),
      });

      if (res.ok) {
        toast({ title: 'Payment Recorded', description: 'Warehouse manager has been notified via SMS.' });
        setShowPaymentDialog(false);
        setPaymentRef('');
        fetchProformas();
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelProforma = async (proformaId: string) => {
    if (!confirm('Cancel this proforma? Reserved chassis numbers will be released.')) return;

    try {
      const res = await fetch(`/api/proforma/${proformaId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: 'Proforma Cancelled' });
        fetchProformas();
      } else {
        throw new Error('Failed to cancel proforma');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetCreateForm = () => {
    setSelectedAgentId('');
    setProformaItems([]);
    setSelectedUnitIds([]);
    setProformaNotes('');
    setValidityDays(7);
  };

  const addItem = () => {
    if (products.length > 0) {
      setProformaItems([...proformaItems, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...proformaItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setProformaItems(newItems);
  };

  const removeItem = (index: number) => {
    setProformaItems(proformaItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return proformaItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (item.quantity * (product?.price || 0));
    }, 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString()}`;

  const filteredProformas = proformas.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = 
      p.number.toLowerCase().includes(q) ||
      p.agent.firstName.toLowerCase().includes(q) ||
      p.agent.lastName.toLowerCase().includes(q) ||
      p.agent.businessName?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: proformas.length,
    PENDING: proformas.filter(p => p.status === 'PENDING').length,
    PAID: proformas.filter(p => p.status === 'PAID').length,
    EXPIRED: proformas.filter(p => p.status === 'EXPIRED').length,
    CANCELLED: proformas.filter(p => p.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proformas</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agent proforma invoices</p>
        </div>
        <Button onClick={() => { resetCreateForm(); setShowCreateDialog(true); }} className="h-10 bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Proforma
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'All', count: statusCounts.all, filter: 'all' },
          { label: 'Pending', count: statusCounts.PENDING, filter: 'PENDING' },
          { label: 'Paid', count: statusCounts.PAID, filter: 'PAID' },
          { label: 'Expired', count: statusCounts.EXPIRED, filter: 'EXPIRED' },
          { label: 'Cancelled', count: statusCounts.CANCELLED, filter: 'CANCELLED' },
        ].map(stat => (
          <Card 
            key={stat.label} 
            className={`border-gray-200/60 cursor-pointer hover:border-gray-300 transition-colors ${statusFilter === stat.filter ? 'ring-2 ring-gray-900' : ''}`}
            onClick={() => setStatusFilter(stat.filter)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by proforma number, agent name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-10 pl-10 bg-white"
        />
      </div>

      {/* Proforma List */}
      <Card className="border-gray-200/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredProformas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p className="font-medium">No proformas found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProformas.map(proforma => (
                <div
                  key={proforma.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{proforma.number}</span>
                        <Badge variant="outline" className={getStatusBadge(proforma.status)}>
                          {proforma.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {proforma.agent.firstName} {proforma.agent.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {proforma.items.length} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Expires {formatDate(proforma.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(proforma.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{formatDate(proforma.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedProforma(proforma); setShowDetailDialog(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {proforma.status === 'PENDING' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => { setSelectedProforma(proforma); setShowPaymentDialog(true); }}>
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleCancelProforma(proforma.id)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Proforma Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Proforma</DialogTitle>
            <DialogDescription>Generate a new proforma invoice for an approved agent</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Agent Selection */}
            <div>
              <Label className="text-xs text-gray-500">Select Agent *</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose approved agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.firstName} {agent.lastName} {agent.businessName ? `(${agent.businessName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Products *</Label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>
              
              {proformaItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Select 
                      value={item.productId} 
                      onValueChange={(v) => updateItem(index, 'productId', v)}
                    >
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {formatCurrency(p.price || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-24"
                      placeholder="Qty"
                    />
                    <span className="text-sm font-medium w-24 text-right">
                      {formatCurrency(item.quantity * (product?.price || 0))}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}

              {proformaItems.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chassis Selection */}
            {selectedAgentId && availableUnits.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Reserve Chassis Numbers (Optional)</Label>
                <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2">
                  {availableUnits.slice(0, 50).map(unit => (
                    <label key={unit.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUnitIds.includes(unit.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUnitIds([...selectedUnitIds, unit.id]);
                          } else {
                            setSelectedUnitIds(selectedUnitIds.filter(id => id !== unit.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-mono">{unit.chassisNumber}</span>
                      <span className="text-xs text-gray-500">{unit.product.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Selected: {selectedUnitIds.length} units</p>
              </div>
            )}

            {/* Validity & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Validity (Days)</Label>
                <Select value={validityDays.toString()} onValueChange={(v) => setValidityDays(parseInt(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Notes</Label>
                <Input value={proformaNotes} onChange={(e) => setProformaNotes(e.target.value)} className="mt-1" placeholder="Optional notes..." />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateProforma} disabled={creating || !selectedAgentId || proformaItems.length === 0} className="bg-gray-900 hover:bg-gray-800">
              {creating ? 'Creating...' : 'Create Proforma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProforma && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedProforma.number}</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedProforma.agent.firstName} {selectedProforma.agent.lastName}
                      {selectedProforma.agent.businessName && ` (${selectedProforma.agent.businessName})`}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusBadge(selectedProforma.status)}>
                    {selectedProforma.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Agent Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedProforma.agent.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedProforma.agent.phone}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Items</p>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Product</th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-500">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedProforma.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-bold text-right">Total</td>
                          <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(selectedProforma.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Reserved Chassis */}
                {selectedProforma.productUnits.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Reserved Chassis Numbers</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProforma.productUnits.map(unit => (
                        <span key={unit.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-mono font-medium">
                          {unit.chassisNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(selectedProforma.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expires</p>
                    <p className="text-sm font-medium">{formatDate(selectedProforma.expiresAt)}</p>
                  </div>
                  {selectedProforma.paidAt && (
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-sm font-medium">{formatDate(selectedProforma.paidAt)}</p>
                    </div>
                  )}
                  {selectedProforma.paymentRef && (
                    <div>
                      <p className="text-xs text-gray-500">Payment Reference</p>
                      <p className="text-sm font-medium">{selectedProforma.paymentRef}</p>
                    </div>
                  )}
                </div>

                {selectedProforma.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{selectedProforma.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {selectedProforma.status === 'PENDING' && (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-200" onClick={() => { handleCancelProforma(selectedProforma.id); setShowDetailDialog(false); }}>
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setShowDetailDialog(false); setShowPaymentDialog(true); }}>
                      <DollarSign className="w-4 h-4 mr-2" /> Record Payment
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Mark {selectedProforma?.number} as paid. Warehouse manager will be notified via SMS.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Payment Reference</Label>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g., Bank transfer reference, check number..."
                className="mt-1"
              />
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-800">
                <strong>Amount Due:</strong> {formatCurrency(selectedProforma?.totalAmount || 0)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleMarkAsPaid} disabled={paymentLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {paymentLoading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}