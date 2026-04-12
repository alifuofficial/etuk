'use client';

import { useEffect, useState, useRef } from 'react';
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
  Bell,
} from 'lucide-react';

const VAT_RATE = 0.15; // 15% VAT

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
  const printRef = useRef<HTMLDivElement>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
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
      } else {
        console.error('Failed to fetch proformas:', res.status, res.statusText);
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
          unitIds: selectedUnitIds.length > 0 ? selectedUnitIds : undefined,
          notes: proformaNotes,
          validityDays,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Proforma Created', description: `Proforma ${data.number} has been generated.` });
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

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await fetch('/api/proforma/send-reminders', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        toast({ 
          title: 'Reminders Sent', 
          description: `Sent ${data.remindersSent} reminder(s). ${data.expiredCount} proforma(s) expired.` 
        });
        fetchProformas();
      } else {
        throw new Error('Failed to send reminders');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSendingReminders(false);
    }
  };

  const handlePrint = (proforma: Proforma) => {
    setSelectedProforma(proforma);
    setShowPrintDialog(true);
  };

  const printProforma = () => {
    window.print();
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

  const calculateSubtotal = () => {
    return proformaItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (item.quantity * (product?.price || 0));
    }, 0);
  };

  const calculateVat = (subtotal: number) => subtotal * VAT_RATE;
  const calculateTotal = (subtotal: number) => subtotal + calculateVat(subtotal);

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
  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSendReminders} 
            disabled={sendingReminders}
            className="h-10 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            {sendingReminders ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Send Reminders
          </Button>
          <Button onClick={() => { resetCreateForm(); setShowCreateDialog(true); }} className="h-10 bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Proforma
          </Button>
        </div>
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
              {filteredProformas.map(proforma => {
                const subtotal = proforma.items.reduce((sum, item) => sum + item.totalPrice, 0);
                const vat = subtotal * VAT_RATE;
                const totalWithVat = subtotal + vat;
                
                return (
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
                        <p className="font-bold text-gray-900">{formatCurrency(totalWithVat)}</p>
                        <p className="text-xs text-gray-500">{formatDate(proforma.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(proforma)} title="Print">
                          <Printer className="w-4 h-4" />
                        </Button>
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
                );
              })}
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
                  {agents.length === 0 ? (
                    <SelectItem value="none" disabled>No approved agents available</SelectItem>
                  ) : (
                    agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName} {agent.businessName ? `(${agent.businessName})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {agents.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No approved agents found. Approve an agent first.</p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Products *</Label>
                <Button variant="outline" size="sm" onClick={addItem} disabled={products.length === 0}>
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>

              {products.length === 0 && (
                <p className="text-xs text-amber-600">No serialized products found. Create a serialized product first.</p>
              )}
              
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
                  <div className="text-right space-y-1">
                    <div className="flex justify-between gap-8">
                      <span className="text-sm text-gray-500">Subtotal</span>
                      <span className="text-sm font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="text-sm text-gray-500">VAT (15%)</span>
                      <span className="text-sm font-medium">{formatCurrency(calculateVat(calculateSubtotal()))}</span>
                    </div>
                    <div className="flex justify-between gap-8 pt-2 border-t">
                      <span className="text-sm font-bold">Total (incl. VAT)</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(calculateTotal(calculateSubtotal()))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chassis Selection */}
            {selectedAgentId && availableUnits.length > 0 && (() => {
              const totalQuantity = proformaItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
              const maxSelections = totalQuantity || 0;
              const canSelectMore = selectedUnitIds.length < maxSelections;
              
              return (
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Reserve Chassis Numbers (Optional)
                    {maxSelections > 0 && (
                      <span className="ml-2 text-deep-sky-blue font-medium">
                        - Select up to {maxSelections} units (based on total quantity)
                      </span>
                    )}
                  </Label>
                  <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2">
                    {availableUnits.slice(0, 50).map(unit => {
                      const isSelected = selectedUnitIds.includes(unit.id);
                      const isDisabled = !isSelected && !canSelectMore;
                      
                      return (
                        <label 
                          key={unit.id} 
                          className={`flex items-center gap-3 p-2 rounded-lg ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked && canSelectMore) {
                                setSelectedUnitIds([...selectedUnitIds, unit.id]);
                              } else if (!e.target.checked) {
                                setSelectedUnitIds(selectedUnitIds.filter(id => id !== unit.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm font-mono">{unit.chassisNumber}</span>
                          <span className="text-xs text-gray-500">{unit.product.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {selectedUnitIds.length} of {maxSelections || 'unlimited'} selected
                    </p>
                    {maxSelections > 0 && selectedUnitIds.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setSelectedUnitIds([])}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

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
          {selectedProforma && (() => {
            const subtotal = selectedProforma.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const vat = subtotal * VAT_RATE;
            const totalWithVat = subtotal + vat;
            
            return (
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
                            <td colSpan={3} className="px-4 py-2 text-sm text-right">Subtotal</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(subtotal)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm text-right">VAT (15%)</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(vat)}</td>
                          </tr>
                          <tr className="border-t-2 border-gray-300">
                            <td colSpan={3} className="px-4 py-3 text-sm font-bold text-right">Total (incl. VAT)</td>
                            <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(totalWithVat)}</td>
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
                  <Button variant="outline" onClick={() => handlePrint(selectedProforma)}>
                    <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
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
            );
          })()}
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
                <strong>Amount Due:</strong> {selectedProforma && formatCurrency(selectedProforma.items.reduce((sum, item) => sum + item.totalPrice, 0) * 1.15)}
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

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none p-0">
          {selectedProforma && (() => {
            const subtotal = selectedProforma.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const vat = subtotal * VAT_RATE;
            const totalWithVat = subtotal + vat;
            
            return (
              <>
                <DialogHeader className="print:hidden px-6 py-4 border-b sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <DialogTitle>Print Proforma</DialogTitle>
                    <Button onClick={printProforma} className="bg-gray-900 hover:bg-gray-800">
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                  </div>
                </DialogHeader>

                {/* Printable Content */}
                <div ref={printRef} className="bg-white p-8 print:p-0">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8 border-b pb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">PROFORMA INVOICE</h1>
                      <p className="text-lg font-semibold text-deep-sky-blue mt-1">{selectedProforma.number}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Date: {new Date(selectedProforma.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valid Until: {new Date(selectedProforma.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-gray-900">ETUK</h2>
                      <p className="text-sm text-gray-500">Electric Vehicles</p>
                      <p className="text-sm text-gray-500">Modjo, Oromia, Ethiopia</p>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To:</p>
                    <p className="font-bold text-gray-900">
                      {selectedProforma.agent.firstName} {selectedProforma.agent.lastName}
                      {selectedProforma.agent.businessName && ` (${selectedProforma.agent.businessName})`}
                    </p>
                    <p className="text-sm text-gray-600">{selectedProforma.agent.email}</p>
                    <p className="text-sm text-gray-600">{selectedProforma.agent.phone}</p>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-8 border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase border">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase border">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase border">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProforma.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 border">{item.productName}</td>
                          <td className="px-4 py-3 text-center border">{item.quantity}</td>
                          <td className="px-4 py-3 text-right border">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium border">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right border font-medium">Subtotal</td>
                        <td className="px-4 py-3 text-right border font-medium">{formatCurrency(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right border font-medium">VAT (15%)</td>
                        <td className="px-4 py-3 text-right border font-medium">{formatCurrency(vat)}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td colSpan={3} className="px-4 py-3 text-right border font-bold">TOTAL (incl. VAT)</td>
                        <td className="px-4 py-3 text-right border font-bold text-lg">{formatCurrency(totalWithVat)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Reserved Chassis */}
                  {selectedProforma.productUnits.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Reserved Units (Chassis Numbers):</p>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                        {selectedProforma.productUnits.map(unit => (
                          <span key={unit.id} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm font-mono">
                            {unit.chassisNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedProforma.notes && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes:</p>
                      <p className="text-sm text-gray-600">{selectedProforma.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500 print:pb-4">
                    <p>This is a proforma invoice. Payment must be made before the expiration date.</p>
                    <p className="mt-1">Thank you for your business!</p>
                  </div>
                </div>

                <DialogFooter className="print:hidden px-6 py-4 border-t sticky bottom-0 bg-white">
                  <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Close</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}