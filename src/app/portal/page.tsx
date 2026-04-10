'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  MapPin,
  Plus,
  Eye,
  Clock,
} from 'lucide-react';

interface ProductUnit {
  id: string;
  chassisNumber: string;
  product: { id: string; name: string; category: string; price: number | null };
  createdAt: string;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  soldAt: string;
  productUnit: { product: { name: string; category: string; price: number | null }; chassisNumber: string };
}

interface Stats {
  totalUnits: number;
  totalValue: number;
  totalSold: number;
  totalCustomers: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
}

interface AgentData {
  firstName: string;
  lastName: string;
  businessName: string | null;
  city: string;
  region: string;
}

function DashboardContent() {
  const router = useRouter();
  const { status } = useSession();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalUnits: 0, totalValue: 0, totalSold: 0,
    totalCustomers: 0, monthlyRevenue: 0, lastMonthRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/portal');
      return;
    }
    if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, salesRes, customersRes] = await Promise.all([
        fetch('/api/agent/my-units'),
        fetch('/api/agent/sales'),
        fetch('/api/agent/customers')
      ]);

      if (unitsRes.status === 401) { router.push('/auth/login?redirect=/portal'); return; }
      if (unitsRes.status === 403) { toast({ title: 'Account Not Approved', variant: 'destructive' }); router.push('/'); return; }
      if (unitsRes.status === 404) { toast({ title: 'Access Denied', variant: 'destructive' }); router.push('/'); return; }

      const unitsData = await unitsRes.json();
      const salesData = await salesRes.json();
      const customersData = await customersRes.json();

      setAgent(unitsData.agent);
      setUnits(unitsData.units || []);
      setSales(salesData.sales || []);
      setCustomersCount(customersData.length || 0);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const monthlyRevenue = (salesData.sales || [])
        .filter((s: Sale) => new Date(s.soldAt) >= monthStart)
        .reduce((sum: number, s: Sale) => sum + (s.productUnit.product.price || 0), 0);

      const lastMonthRevenue = (salesData.sales || [])
        .filter((s: Sale) => { const d = new Date(s.soldAt); return d >= lastMonthStart && d <= lastMonthEnd; })
        .reduce((sum: number, s: Sale) => sum + (s.productUnit.product.price || 0), 0);

      setStats({
        totalUnits: unitsData.stats?.totalUnits || 0,
        totalValue: unitsData.stats?.totalValue || 0,
        totalSold: unitsData.stats?.totalSold || 0,
        totalCustomers: customersData.length || 0,
        monthlyRevenue,
        lastMonthRevenue
      });
    } catch (error) {
      console.error('Failed to fetch:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const revenueChange = stats.lastMonthRevenue > 0 
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {agent?.firstName}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {agent?.businessName ? `${agent.businessName} · ` : ''}{agent?.city}, {agent?.region}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-100 px-3 py-2 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><Package className="w-4 h-4 text-blue-600" /></div>
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
              <div className="p-2 rounded-lg bg-green-50"><DollarSign className="w-4 h-4 text-green-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Value</p>
                <p className="text-xl font-black text-gray-900">{(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50"><ShoppingCart className="w-4 h-4 text-purple-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Sold</p>
                <p className="text-xl font-black text-gray-900">{stats.totalSold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50"><Users className="w-4 h-4 text-amber-600" /></div>
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
              <div className="p-2 rounded-lg bg-cyan-50"><TrendingUp className="w-4 h-4 text-cyan-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">This Month</p>
                <p className="text-xl font-black text-gray-900">{(stats.monthlyRevenue / 1000).toFixed(1)}K</p>
                {Number(revenueChange) !== 0 && (
                  <p className={`text-[10px] font-bold ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(revenueChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(revenueChange))}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50"><BarChart3 className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Conv. Rate</p>
                <p className="text-xl font-black text-gray-900">
                  {stats.totalUnits + stats.totalSold > 0 ? Math.round((stats.totalSold / (stats.totalSold + stats.totalUnits)) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Sales */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Button onClick={() => router.push('/portal/units')} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold justify-start">
              <ShoppingCart className="w-4 h-4 mr-3" />Record a Sale
            </Button>
            <Button onClick={() => router.push('/portal/customers')} variant="outline" className="w-full h-12 font-bold justify-start">
              <Plus className="w-4 h-4 mr-3" />Add New Customer
            </Button>
            <Button onClick={() => router.push('/portal/units')} variant="outline" className="w-full h-12 font-bold justify-start">
              <Eye className="w-4 h-4 mr-3" />View My Inventory
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Recent Sales</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/portal/sales')} className="text-sm font-medium text-gray-600">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {sales.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{sale.productUnit.product.name}</p>
                        <p className="text-xs text-gray-500">{sale.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {sale.productUnit.product.price ? `${sale.productUnit.product.price.toLocaleString()} ETB` : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(sale.soldAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Category */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-bold">Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {units.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">No inventory assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(units.reduce((acc, u) => {
                acc[u.product.category] = (acc[u.product.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => {
                  const percentage = (count / units.length) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgentDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}