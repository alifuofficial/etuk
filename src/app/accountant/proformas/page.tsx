'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  DollarSign,
  User,
  Package,
  Calendar,
  Loader2,
  Printer,
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

const VAT_RATE = 0.15;

export default function AccountantProformasPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchProformas();
  }, []);

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

  const handleMarkPaymentPending = async (proformaId: string) => {
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/proforma/${proformaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAYMENT_PENDING', notes: verifyNotes }),
      });

      if (res.ok) {
        toast({ title: 'Payment Pending', description: 'Proforma marked for payment verification.' });
        setShowVerifyDialog(false);
        setVerifyNotes('');
        fetchProformas();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleApprovePayment = async (proformaId: string) => {
    if (!confirm('Approve this payment? Warehouse manager will be notified via SMS.')) return;

    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/proforma/${proformaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', action: 'approve' }),
      });

      if (res.ok) {
        toast({ title: 'Payment Approved', description: 'Warehouse manager has been notified via SMS.' });
        fetchProformas();
        setShowDetailDialog(false);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRejectPayment = async (proformaId: string) => {
    if (!confirm('Reject this payment? The proforma will be cancelled.')) return;

    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/proforma/${proformaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', action: 'reject' }),
      });

      if (res.ok) {
        toast({ title: 'Payment Rejected', description: 'Proforma has been cancelled.' });
        fetchProformas();
        setShowDetailDialog(false);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      PAYMENT_PENDING: 'bg-blue-50 text-blue-700 border-blue-200',
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
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
      p.agent.lastName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: proformas.length,
    PENDING: proformas.filter(p => p.status === 'PENDING').length,
    PAYMENT_PENDING: proformas.filter(p => p.status === 'PAYMENT_PENDING').length,
    PAID: proformas.filter(p => p.status === 'PAID').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proforma Management</h1>
        <p className="text-sm text-gray-500 mt-1">Verify payments and manage proforma invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All', count: statusCounts.all, color: 'gray' },
          { label: 'Pending', count: statusCounts.PENDING, color: 'amber' },
          { label: 'Verify Payment', count: statusCounts.PAYMENT_PENDING, color: 'blue' },
          { label: 'Paid', count: statusCounts.PAID, color: 'emerald' },
        ].map(stat => (
          <Card 
            key={stat.label} 
            className={`border-gray-200/60 cursor-pointer hover:border-gray-300 transition-colors ${statusFilter === (stat.label === 'All' ? 'all' : stat.label === 'Verify Payment' ? 'PAYMENT_PENDING' : stat.label.toUpperCase()) ? 'ring-2 ring-gray-900' : ''}`}
            onClick={() => setStatusFilter(stat.label === 'All' ? 'all' : stat.label === 'Verify Payment' ? 'PAYMENT_PENDING' : stat.label.toUpperCase())}
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        proforma.status === 'PAYMENT_PENDING' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {proforma.status === 'PAYMENT_PENDING' ? (
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{proforma.number}</span>
                          <Badge variant="outline" className={getStatusBadge(proforma.status)}>
                            {proforma.status === 'PAYMENT_PENDING' ? 'VERIFY' : proforma.status}
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
                            <Calendar className="w-3 h-3" /> {formatDate(proforma.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(totalWithVat)}</p>
                        <p className="text-xs text-gray-500">incl. VAT</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedProforma(proforma); setShowDetailDialog(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {proforma.status === 'PAYMENT_PENDING' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprovePayment(proforma.id)} title="Approve Payment">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleRejectPayment(proforma.id)} title="Reject Payment">
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
                        <p className="text-sm font-medium text-emerald-600">{formatDate(selectedProforma.paidAt)}</p>
                      </div>
                    )}
                    {selectedProforma.paymentRef && (
                      <div>
                        <p className="text-xs text-gray-500">Payment Reference</p>
                        <p className="text-sm font-medium">{selectedProforma.paymentRef}</p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  {selectedProforma.status === 'PAYMENT_PENDING' && (
                    <>
                      <Button variant="outline" className="text-red-600 border-red-200" onClick={() => handleRejectPayment(selectedProforma.id)} disabled={verifyLoading}>
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprovePayment(selectedProforma.id)} disabled={verifyLoading}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve Payment
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}