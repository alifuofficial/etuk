'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  Clock,
  Warehouse,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DashboardStats {
  totalAgents: number;
  pendingApplications: number;
  approvedAgents: number;
  totalProducts: number;
  recentApplications: any[];
  warehouseUnits?: number;
  assignedUnits?: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  isSerialized: boolean;
  _count?: {
    units: number;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWarehouseManager, setIsWarehouseManager] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'WAREHOUSE_MANAGER') {
      setIsWarehouseManager(true);
    }
    fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      if (session?.user?.role === 'WAREHOUSE_MANAGER') {
        // Fetch only warehouse-relevant data
        const [productsRes, agentsRes, unitsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/agents?status=APPROVED'),
          fetch('/api/inventory')
        ]);

        const productsData = await productsRes.json();
        const agentsData = await agentsRes.json();
        const unitsData = await unitsRes.json();

        setProducts(Array.isArray(productsData) ? productsData : []);
        
        const warehouseInventory = (Array.isArray(unitsData) ? unitsData : []).filter(
          (item: any) => item.agentId === null
        );
        const totalWarehouseUnits = warehouseInventory.reduce(
          (sum: number, item: any) => sum + item.quantity, 0
        );

        setStats({
          totalAgents: Array.isArray(agentsData) ? agentsData.length : 0,
          pendingApplications: 0,
          approvedAgents: Array.isArray(agentsData) ? agentsData.length : 0,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          recentApplications: [],
          warehouseUnits: totalWarehouseUnits,
        });
      } else {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setStats({
          ...data.stats,
          recentApplications: data.recentApplications,
          totalProducts: data.stats.totalProducts || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // Warehouse Manager Dashboard
  if (isWarehouseManager) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage inventory and assign units to agents.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <Warehouse className="w-5 h-5 text-deep-sky-blue" />
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Warehouse Units</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.warehouseUnits || 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Approved Agents</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.approvedAgents || 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Products</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.totalProducts || 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <Truck className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Quick Actions</p>
              </div>
              <Link href="/admin/warehouse" className="block">
                <p className="text-sm font-bold text-deep-sky-blue hover:underline">Assign Units →</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Products in Warehouse */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 pb-4 px-6">
            <CardTitle className="text-lg font-bold">Products in Warehouse</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Available products for distribution</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Product</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.slice(0, 10).map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50/50">
                      <TableCell className="px-6 py-4 font-bold text-gray-900">{product.name}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-600">{product.category}</TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          product.isSerialized 
                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                            : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {product.isSerialized ? 'Serialized' : 'Standard'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-gray-400 text-sm">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/admin/warehouse">
            <button className="bg-deep-sky-blue hover:bg-deep-sky-blue/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">
              Go to Warehouse Management
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Admin Dashboard (Original)
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back, {session?.user?.name}. Here's the latest update.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-100 px-3 py-2 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Agents" 
          value={stats?.totalAgents || 0} 
          icon={<Users className="w-5 h-5 text-blue-600" />}
          description="Registered pool"
          className="bg-white"
        />
        <StatCard 
          title="Pending Review" 
          value={stats?.pendingApplications || 0} 
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          description="Awaiting check"
          className="bg-white"
        />
        <StatCard 
          title="Approved Stock" 
          value={stats?.approvedAgents || 0} 
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          description="Active network"
          className="bg-white"
        />
        <StatCard 
          title="Product Line" 
          value={stats?.totalProducts || 0} 
          icon={<Package className="w-5 h-5 text-purple-600" />}
          description="Catalog items"
          className="bg-white"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, className }: { title: string, value: number, icon: any, description: string, className?: string }) {
  return (
    <Card className={`border border-gray-200 shadow-sm rounded-xl overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            {icon}
          </div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</p>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
