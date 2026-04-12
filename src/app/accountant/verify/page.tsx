'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Package,
  Calendar,
  Loader2,
  FileText,
  Clock,
  AlertCircle,
  Image,
  ExternalLink,
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
  paymentReceipt: string | null;
  paymentNotes: string | null;
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

export default function AccountantVerifyPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchPaymentPendingProformas();
  }, []);

  const fetchPaymentPendingProformas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proforma');
      if (res.ok) {
        const data = await res.json();
        // Filter only PAYMENT_PENDING proformas
        const pendingPayments = Array.isArray(data) 
          ? data.filter((p: Proforma) => p.status === 'PAYMENT_PENDING')
          : [];
        setProformas(pendingPayments);
      }
    } catch (error) {
      console.error('Failed to fetch proformas:', error);
    } finally {
      setLoading(false);
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
        fetchPaymentPendingProformas();
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
        fetchPaymentPendingProformas();
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve pending payment verifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{proformas.length}</p>
                <p className="text-xs text-amber-600 font-medium">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(proformas.reduce((sum, p) => {
                    const subtotal = p.items.reduce((s, i) => s + i.totalPrice, 0);
                    return sum + subtotal * (1 + VAT_RATE);
                  }, 0))}
                </p>
                <p className="text-xs text-blue-600 font-medium">Total Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {proformas.filter(p => {
                    const expiresAt = new Date(p.expiresAt);
                    const now = new Date();
                    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 3 && daysLeft > 0;
                  }).length}
                </p>
                <p className="text-xs text-emerald-600 font-medium">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proforma List */}
      <Card className="border-gray-200/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : proformas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <CheckCircle className="w-12 h-12 mb-4 text-emerald-400" />
              <p className="font-medium text-lg">All Clear!</p>
              <p className="text-sm">No pending payment verifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {proformas.map(proforma => {
                const subtotal = proforma.items.reduce((sum, item) => sum + item.totalPrice, 0);
                const vat = subtotal * VAT_RATE;
                const totalWithVat = subtotal + vat;
                const expiresAt = new Date(proforma.expiresAt);
                const now = new Date();
                const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;

                return (
                  <div
                    key={proforma.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        isExpiringSoon ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {isExpiringSoon ? (
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        ) : (
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{proforma.number}</span>
                          {isExpiringSoon && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {daysLeft}d left
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {proforma.agent.firstName} {proforma.agent.lastName}
                          </span>
                          {proforma.agent.businessName && (
                            <span className="text-gray-400">• {proforma.agent.businessName}</span>
                          )}
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleApprovePayment(proforma.id)}
                          disabled={verifyLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRejectPayment(proforma.id)}
                          disabled={verifyLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedProforma(proforma); setShowDetailDialog(true); }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
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
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      PENDING VERIFICATION
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

                  {selectedProforma.paymentReceipt && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Payment Receipt</p>
                      <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                        {/* Show image preview */}
                        <div className="border rounded-lg overflow-hidden bg-white">
                          <img 
                            src={selectedProforma.paymentReceipt} 
                            alt="Payment Receipt"
                            className="max-w-full max-h-64 mx-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="p-8 text-center text-gray-500">
                                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <p class="text-sm">Receipt file not found</p>
                                    <a href="${selectedProforma.paymentReceipt}" target="_blank" class="text-blue-600 text-xs hover:underline mt-2 inline-block">Try opening in new tab</a>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <a 
                            href={selectedProforma.paymentReceipt} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" /> Open in new tab
                          </a>
                        </div>
                        {selectedProforma.paymentRef && (
                          <div>
                            <p className="text-xs text-gray-500">Payment Reference</p>
                            <p className="text-sm font-medium">{selectedProforma.paymentRef}</p>
                          </div>
                        )}
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
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" className="text-red-600 border-red-200" onClick={() => handleRejectPayment(selectedProforma.id)} disabled={verifyLoading}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject Payment
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprovePayment(selectedProforma.id)} disabled={verifyLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Payment
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
