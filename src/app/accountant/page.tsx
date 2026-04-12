'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

interface DashboardStats {
  total: number;
  pending: number;
  paymentPending: number;
  paid: number;
  expired: number;
  cancelled: number;
  totalAmount: number;
}

export default function AccountantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Verify payments and manage proforma invoices</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-gray-200/60 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{stats?.pending || 0}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats?.paymentPending || 0}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Verify</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats?.paid || 0}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{stats?.expired || 0}</p>
                <p className="text-[10px] font-bold text-red-600 uppercase">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-purple-700">ETB {(stats?.totalAmount || 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-purple-600 uppercase">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 hover:border-blue-300 transition-colors cursor-pointer">
          <Link href="/accountant/verify">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Verify Payments</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats?.paymentPending || 0} proformas awaiting verification
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
          <Link href="/accountant/proformas">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-2xl">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">All Proformas</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      View and manage all proforma invoices
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800">Payment Verification Process</h3>
              <ol className="text-sm text-amber-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Agent creates a proforma and makes payment to the bank account</li>
                <li>Agent notifies admin about the payment</li>
                <li>You verify the payment has been received in the bank account</li>
                <li>Approve the payment to trigger warehouse notification</li>
                <li>Warehouse manager receives SMS with chassis numbers to prepare</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}