'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  User,
  Calendar,
  Eye,
  Banknote,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProformaItem {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

interface RecentProforma {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  totalWithVat: number;
  createdAt: string;
  expiresAt: string;
  verifiedAt: string | null;
  agent: {
    firstName: string;
    lastName: string;
    businessName: string | null;
  };
  items: ProformaItem[];
}

interface DashboardStats {
  total: number;
  pending: number;
  paymentPending: number;
  paid: number;
  expired: number;
  cancelled: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  recentPending: RecentProforma[];
  recentVerified: RecentProforma[];
}

export default function AccountantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/accountant/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (proformaId: string) => {
    if (!confirm('Approve this payment? Warehouse manager will be notified via SMS.')) return;

    setActionLoading(proformaId);
    try {
      const res = await fetch(`/api/proforma/${proformaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', action: 'approve' }),
      });

      if (res.ok) {
        toast({ title: 'Payment Approved', description: 'Warehouse manager has been notified via SMS.' });
        fetchStats();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (proformaId: string) => {
    if (!confirm('Reject this payment? The proforma will be cancelled.')) return;

    setActionLoading(proformaId);
    try {
      const res = await fetch(`/api/proforma/${proformaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', action: 'reject' }),
      });

      if (res.ok) {
        toast({ title: 'Payment Rejected', description: 'Proforma has been cancelled.' });
        fetchStats();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Verify payments and manage proforma invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/accountant/verify">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Verify Payments ({stats?.paymentPending || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verification */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Awaiting Verification</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{stats?.paymentPending || 0}</p>
                <p className="text-xs text-amber-600 mt-1">{formatCurrency(stats?.pendingAmount || 0)}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified/Paid */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Verified Payments</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats?.paid || 0}</p>
                <p className="text-xs text-emerald-600 mt-1">{formatCurrency(stats?.paidAmount || 0)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Proformas */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Proformas</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{stats?.total || 0}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats?.pending || 0} pending • {stats?.expired || 0} expired
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected/Cancelled */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected/Cancelled</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{(stats?.cancelled || 0) + (stats?.rejected || 0)}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats?.cancelled || 0} cancelled • {stats?.rejected || 0} rejected
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/accountant/verify">
          <Card className="border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Verify Payments</h3>
                  <p className="text-sm text-gray-500">Review and approve agent payments</p>
                </div>
                <div className="flex items-center gap-2">
                  {stats && stats.paymentPending > 0 && (
                    <Badge className="bg-blue-600">{stats.paymentPending} pending</Badge>
                  )}
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/accountant/proformas">
          <Card className="border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">All Proformas</h3>
                  <p className="text-sm text-gray-500">View and manage all proforma invoices</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Pending Verifications */}
      <Card className="border-gray-200/60">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Payments to Verify</h2>
              <p className="text-sm text-gray-500">Proformas awaiting payment verification</p>
            </div>
            <Link href="/accountant/verify">
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {!stats?.recentPending || stats.recentPending.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending payment verifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recentPending.map((proforma) => (
                <div key={proforma.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{proforma.number}</span>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">VERIFY</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {proforma.agent.firstName} {proforma.agent.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(proforma.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(proforma.totalWithVat)}</p>
                        <p className="text-xs text-gray-500">{proforma.items.length} items</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleApprovePayment(proforma.id)}
                          disabled={actionLoading === proforma.id}
                        >
                          {actionLoading === proforma.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRejectPayment(proforma.id)}
                          disabled={actionLoading === proforma.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Verified */}
      <Card className="border-gray-200/60">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Recently Verified</h2>
            <p className="text-sm text-gray-500">Payments verified in the last 7 days</p>
          </div>
          
          {!stats?.recentVerified || stats.recentVerified.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Banknote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No recent verifications</p>
              <p className="text-sm">Verified payments will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recentVerified.map((proforma) => (
                <div key={proforma.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{proforma.number}</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">PAID</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {proforma.agent.firstName} {proforma.agent.lastName}
                          </span>
                          {proforma.verifiedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Verified {formatDateTime(proforma.verifiedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{formatCurrency(proforma.totalWithVat)}</p>
                      <p className="text-xs text-gray-500">{proforma.items.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Payment Verification Workflow</h3>
              <ol className="text-sm text-blue-700 mt-2 space-y-1.5 list-decimal list-inside">
                <li>Agent creates a proforma and uploads payment receipt</li>
                <li>Review the uploaded receipt in the Verify Payments section</li>
                <li>Verify the payment in your bank account</li>
                <li>Approve to trigger warehouse notification via SMS</li>
                <li>Or reject if the payment is invalid (proforma will be cancelled)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
