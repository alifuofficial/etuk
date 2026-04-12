'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  Eye,
  Clock,
  Search,
  DollarSign,
  Package,
  Calendar,
  Loader2,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Upload,
  Image,
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
  status: string;
  totalAmount: number;
  notes: string | null;
  expiresAt: string;
  paidAt: string | null;
  paymentRef: string | null;
  paymentReceipt: string | null;
  paymentNotes: string | null;
  createdAt: string;
  items: ProformaItem[];
  productUnits: ProformaUnit[];
}

const VAT_RATE = 0.15;

export default function AgentProformasPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/proformas');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'PAYMENT_PENDING':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'EXPIRED':
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      PAYMENT_PENDING: 'Payment Pending',
      PAID: 'Paid',
      EXPIRED: 'Expired',
      CANCELLED: 'Cancelled',
      REJECTED: 'Rejected',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const filteredProformas = proformas.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = p.number.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: proformas.length,
    PENDING: proformas.filter(p => p.status === 'PENDING').length,
    PAYMENT_PENDING: proformas.filter(p => p.status === 'PAYMENT_PENDING').length,
    PAID: proformas.filter(p => p.status === 'PAID').length,
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image (JPEG, PNG, GIF, WebP) or PDF',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadPayment = async () => {
    if (!selectedProforma || !selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      formData.append('paymentRef', paymentRef);
      formData.append('notes', uploadNotes);

      const res = await fetch(`/api/proforma/${selectedProforma.id}/upload-payment`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast({
          title: 'Payment Uploaded',
          description: 'Your payment receipt has been submitted for verification.',
        });
        setShowUploadDialog(false);
        setSelectedFile(null);
        setPaymentRef('');
        setUploadNotes('');
        fetchProformas();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload payment');
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const openUploadDialog = (proforma: Proforma) => {
    setSelectedProforma(proforma);
    setSelectedFile(null);
    setPaymentRef('');
    setUploadNotes('');
    setShowUploadDialog(true);
  };

  const handlePrint = (proforma: Proforma) => {
    const subtotal = proforma.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const vat = subtotal * VAT_RATE;
    const totalWithVat = subtotal + vat;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proforma Invoice - ${proforma.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #16a34a; }
          .invoice-title { font-size: 18px; margin-top: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .info-value { font-size: 14px; font-weight: 500; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.grand { border-top: 2px solid #333; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-${proforma.status.toLowerCase()} { background: ${proforma.status === 'PAID' ? '#d1fae5' : proforma.status === 'PENDING' ? '#fef3c7' : '#fee2e2'}; color: ${proforma.status === 'PAID' ? '#059669' : proforma.status === 'PENDING' ? '#d97706' : '#dc2626'}; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SORETI ETHIOPIA</div>
          <div class="invoice-title">PROFORMA INVOICE</div>
          <div style="margin-top: 10px;">
            <span class="status-badge status-${proforma.status.toLowerCase()}">${getStatusLabel(proforma.status)}</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Proforma Number</div>
            <div class="info-value">${proforma.number}</div>
            <div class="info-label" style="margin-top: 10px;">Date Issued</div>
            <div class="info-value">${formatDate(proforma.createdAt)}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Valid Until</div>
            <div class="info-value">${formatDate(proforma.expiresAt)}</div>
            ${proforma.paidAt ? `
              <div class="info-label" style="margin-top: 10px;">Paid On</div>
              <div class="info-value">${formatDate(proforma.paidAt)}</div>
            ` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${proforma.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>VAT (15%)</span>
            <span>${formatCurrency(vat)}</span>
          </div>
          <div class="total-row grand">
            <span>Total (incl. VAT)</span>
            <span>${formatCurrency(totalWithVat)}</span>
          </div>
        </div>

        ${proforma.productUnits.length > 0 ? `
          <div style="margin-top: 30px;">
            <strong>Reserved Chassis Numbers:</strong>
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
              ${proforma.productUnits.map(u => `<span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-family: monospace;">${u.chassisNumber}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${proforma.notes ? `
          <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <strong>Notes:</strong> ${proforma.notes}
          </div>
        ` : ''}

        <div class="footer">
          <p>This is a computer-generated document. No signature required.</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Proformas</h1>
        <p className="text-sm text-gray-500 mt-1">View and track your proforma invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All', count: statusCounts.all, color: 'gray' },
          { label: 'Pending', count: statusCounts.PENDING, color: 'amber' },
          { label: 'Payment Due', count: statusCounts.PAYMENT_PENDING, color: 'blue' },
          { label: 'Paid', count: statusCounts.PAID, color: 'emerald' },
        ].map(stat => (
          <Card 
            key={stat.label} 
            className={`border-gray-200/60 cursor-pointer hover:border-gray-300 transition-colors ${statusFilter === (stat.label === 'All' ? 'all' : stat.label === 'Payment Due' ? 'PAYMENT_PENDING' : stat.label.toUpperCase()) ? 'ring-2 ring-gray-900' : ''}`}
            onClick={() => setStatusFilter(stat.label === 'All' ? 'all' : stat.label === 'Payment Due' ? 'PAYMENT_PENDING' : stat.label.toUpperCase())}
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
          placeholder="Search by proforma number..."
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
                const expiresAt = new Date(proforma.expiresAt);
                const now = new Date();
                const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysLeft <= 3 && daysLeft > 0 && proforma.status !== 'PAID';
                
                return (
                  <div
                    key={proforma.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        proforma.status === 'PAID' ? 'bg-emerald-100' : 
                        proforma.status === 'PAYMENT_PENDING' ? 'bg-blue-100' :
                        isExpiringSoon ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        {getStatusIcon(proforma.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{proforma.number}</span>
                          <Badge variant="outline" className={getStatusBadge(proforma.status)}>
                            {getStatusLabel(proforma.status)}
                          </Badge>
                          {isExpiringSoon && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {daysLeft}d left
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {proforma.items.length} items
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(proforma.createdAt)}
                          </span>
                          {proforma.productUnits.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {proforma.productUnits.length} chassis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(totalWithVat)}</p>
                        <p className="text-xs text-gray-500">incl. VAT</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {proforma.status === 'PENDING' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => openUploadDialog(proforma)}
                          >
                            <Upload className="w-4 h-4 mr-1" /> Pay
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedProforma(proforma); setShowDetailDialog(true); }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrint(proforma)}
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
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
                        Created {formatDate(selectedProforma.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusBadge(selectedProforma.status)}>
                      {getStatusLabel(selectedProforma.status)}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500">Valid Until</p>
                      <p className="text-sm font-medium">{formatDate(selectedProforma.expiresAt)}</p>
                    </div>
                    {selectedProforma.paidAt && (
                      <div>
                        <p className="text-xs text-gray-500">Paid On</p>
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
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <a 
                          href={selectedProforma.paymentReceipt} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Image className="w-5 h-5" />
                          <span className="text-sm font-medium">View Uploaded Receipt</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedProforma.notes && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm mt-1">{selectedProforma.notes}</p>
                    </div>
                  )}

                  {selectedProforma.status === 'PAYMENT_PENDING' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-700">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">Payment Verification Pending</p>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Your payment is being verified by our accounting team. You will be notified once approved.
                      </p>
                    </div>
                  )}

                  {selectedProforma.status === 'PAID' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Payment Verified</p>
                      </div>
                      <p className="text-sm text-emerald-600 mt-1">
                        Your payment has been verified. Your units will be prepared for delivery.
                      </p>
                    </div>
                  )}

                  {selectedProforma.status === 'REJECTED' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <p className="font-medium">Payment Rejected</p>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        {selectedProforma.paymentNotes || 'Your payment was rejected. Please contact support for more information.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  {selectedProforma.status === 'PENDING' && (
                    <Button onClick={() => openUploadDialog(selectedProforma)}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Payment
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => handlePrint(selectedProforma)}>
                    <Printer className="w-4 h-4 mr-2" /> Print Invoice
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Upload Payment Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Receipt</DialogTitle>
            <DialogDescription>
              Upload your payment receipt for proforma {selectedProforma?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700">
                <strong>Total to Pay:</strong> {selectedProforma && formatCurrency(
                  selectedProforma.items.reduce((sum, item) => sum + item.totalPrice, 0) * (1 + VAT_RATE)
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Receipt *</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-emerald-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP or PDF (max 5MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentRef">Payment Reference</Label>
              <Input
                id="paymentRef"
                placeholder="e.g., Bank transfer reference number"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploadNotes">Notes (Optional)</Label>
              <Textarea
                id="uploadNotes"
                placeholder="Any additional notes about your payment..."
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUploadPayment} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Submit Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
