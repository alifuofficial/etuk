'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Building2,
  MapPin,
  Warehouse,
  MessageSquare,
  Boxes
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPie,
  Pie,
  Legend,
} from 'recharts';
import EthiopiaMap from './components/EthiopiaMap';
import WarehouseDashboard from './warehouse/dashboard';

interface DashboardStats {
  totalAgents: number;
  pendingApplications: number;
  approvedAgents: number;
  rejectedAgents: number;
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  conversionRate: number;
  warehouseUnits: number;
  distributedUnits: number;
  agentsWithWarehouse: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  uniqueRegions: number;
  uniqueCities: number;
  recentSmsCount: number;
  successfulSms: number;
  serializedProducts: number;
  nonSerializedProducts: number;
  recentApplications: any[];
  monthlyTrend: { month: string; applications: number }[];
  agentsByCity: any[];
  agentsByRegion: { region: string; _count: { id: number } }[];
  agentsByStatus: { status: string; _count: { id: number } }[];
  agentsByBusinessType: { businessType: string; _count: { id: number } }[];
  productsByCategory: { category: string; _count: { id: number } }[];
  warehouseInventory?: any[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (session?.user?.role === 'WAREHOUSE_MANAGER') {
    return <WarehouseDashboard />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats({
        totalAgents: data.stats?.totalAgents || 0,
        pendingApplications: data.stats?.pendingApplications || 0,
        approvedAgents: data.stats?.approvedAgents || 0,
        rejectedAgents: data.stats?.rejectedAgents || 0,
        totalUsers: data.stats?.totalUsers || 0,
        totalProducts: data.stats?.totalProducts || 0,
        activeProducts: data.stats?.activeProducts || 0,
        conversionRate: data.stats?.conversionRate || 0,
        warehouseUnits: data.stats?.warehouseUnits || 0,
        distributedUnits: data.stats?.distributedUnits || 0,
        agentsWithWarehouse: data.stats?.agentsWithWarehouse || 0,
        approvedThisMonth: data.stats?.approvedThisMonth || 0,
        rejectedThisMonth: data.stats?.rejectedThisMonth || 0,
        uniqueRegions: data.stats?.uniqueRegions || 0,
        uniqueCities: data.stats?.uniqueCities || 0,
        recentSmsCount: data.stats?.recentSmsCount || 0,
        successfulSms: data.stats?.successfulSms || 0,
        serializedProducts: data.stats?.serializedProducts || 0,
        nonSerializedProducts: data.stats?.nonSerializedProducts || 0,
        recentApplications: data.recentApplications || [],
        monthlyTrend: data.monthlyTrend || [],
        agentsByCity: data.agentsByCity || [],
        agentsByRegion: data.agentsByRegion || [],
        agentsByStatus: data.agentsByStatus || [],
        agentsByBusinessType: data.agentsByBusinessType || [],
        productsByCategory: data.productsByCategory || [],
        warehouseInventory: data.warehouseInventory || [],
      });
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

  const statusChartData = (stats?.agentsByStatus || []).map((item) => ({
    name: item.status,
    value: item._count.id,
    color: item.status === 'APPROVED' ? '#10b981' : item.status === 'PENDING' ? '#f59e0b' : '#ef4444',
  }));

  const businessTypeChartData = (stats?.agentsByBusinessType || []).map((item) => ({
    name: item.businessType || 'Unknown',
    value: item._count.id,
  }));

  const regionChartData = (stats?.agentsByRegion || []).slice(0, 6).map((item) => ({
    name: item.region.length > 10 ? item.region.slice(0, 10) + '...' : item.region,
    fullName: item.region,
    value: item._count.id,
  }));

  const productCategoryData = (stats?.productsByCategory || []).slice(0, 6).map((item) => ({
    name: item.category || 'Other',
    value: item._count.id,
  }));

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

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Total Agents" 
          value={stats?.totalAgents || 0} 
          icon={<Users className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        <StatCard 
          title="Pending" 
          value={stats?.pendingApplications || 0} 
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard 
          title="Approved" 
          value={stats?.approvedAgents || 0} 
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard 
          title="Rejected" 
          value={stats?.rejectedAgents || 0} 
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="red"
        />
        <StatCard 
          title="Products" 
          value={stats?.totalProducts || 0} 
          icon={<Package className="w-5 h-5 text-purple-600" />}
          color="purple"
        />
        <StatCard 
          title="Warehouse" 
          value={stats?.warehouseUnits || 0} 
          icon={<Boxes className="w-5 h-5 text-cyan-600" />}
          color="cyan"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Conversion Rate</p>
                <p className="text-xl font-black text-gray-900">{stats?.conversionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Regions Covered</p>
                <p className="text-xl font-black text-gray-900">{stats?.uniqueRegions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Warehouse className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">With Warehouse</p>
                <p className="text-xl font-black text-gray-900">{stats?.agentsWithWarehouse || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Building2 className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cities Active</p>
                <p className="text-xl font-black text-gray-900">{stats?.uniqueCities || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Registration Trends */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Registration Trends</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Monthly agent application volume</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-300" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar 
                    dataKey="applications" 
                    fill="#0ea5e9" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  >
                    {(stats?.monthlyTrend || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (stats?.monthlyTrend?.length || 0) - 1 ? '#0369a1' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Distribution */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 pb-4 px-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              <CardTitle className="text-lg font-bold">Status Distribution</CardTitle>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Agent application statuses</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  <span className="text-xs font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Regions */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Top Regions</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Agent distribution by region</p>
            </div>
            <MapPin className="w-5 h-5 text-gray-300" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {(stats?.agentsByRegion || []).slice(0, 6).map((item, index) => {
                const maxVal = (stats?.agentsByRegion?.[0]?._count?.id) || 1;
                const percentage = (item._count.id / maxVal) * 100;
                return (
                  <div key={item.region} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 truncate" title={item.region}>{item.region}</span>
                      <span className="text-sm font-bold text-gray-900">{item._count.id}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Business Type Distribution */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Business Types</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Agent business category breakdown</p>
            </div>
            <Building2 className="w-5 h-5 text-gray-300" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={businessTypeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {businessTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map and Inventory */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EthiopiaMap className="h-[50vh] min-h-[450px]" />
        
        {/* Inventory Summary */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Inventory Overview</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Warehouse distribution summary</p>
            </div>
            <Boxes className="w-5 h-5 text-gray-300" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Warehouse Units</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{(stats?.warehouseUnits || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Distributed</p>
                <p className="text-2xl font-black text-green-900 mt-1">{(stats?.distributedUnits || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Serialized Products</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{stats?.serializedProducts || 0}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Standard Products</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{stats?.nonSerializedProducts || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Product Categories</p>
              <div className="flex flex-wrap gap-2">
                {(stats?.productsByCategory || []).slice(0, 6).map((cat, index) => (
                  <span 
                    key={cat.category}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{ 
                      backgroundColor: `${COLORS[index % COLORS.length]}15`,
                      borderColor: `${COLORS[index % COLORS.length]}40`,
                      color: COLORS[index % COLORS.length]
                    }}
                  >
                    {cat.category} ({cat._count.id})
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity & Recent Applications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Summary */}
        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 pb-4 px-6">
            <CardTitle className="text-lg font-bold">This Month</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Review activity summary</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Approved</span>
              </div>
              <span className="text-lg font-bold text-green-700">{stats?.approvedThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Rejected</span>
              </div>
              <span className="text-lg font-bold text-red-700">{stats?.rejectedThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Pending</span>
              </div>
              <span className="text-lg font-bold text-amber-700">{stats?.pendingApplications || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">SMS Sent (7d)</span>
              </div>
              <span className="text-lg font-bold text-blue-700">{stats?.successfulSms || 0}/{stats?.recentSmsCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Latest Applications</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Recent submissions requiring attention</p>
            </div>
            <Link href="/admin/agents">
              <Button variant="ghost" size="sm" className="text-deep-sky-blue font-bold hover:bg-gray-50">
                View List <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Applicant</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Location</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentApplications?.length ? (
                  stats.recentApplications.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-gray-50/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{agent.firstName} {agent.lastName}</span>
                          <span className="text-xs text-gray-500">{agent.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col text-sm text-gray-700 font-medium">
                          <span>{agent.city}</span>
                          <span className="text-xs text-gray-500 font-normal">{agent.region}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          agent.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                          agent.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {agent.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-medium text-gray-500">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                      No recent applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
    green: 'bg-green-50 border-green-100',
    red: 'bg-red-50 border-red-100',
    purple: 'bg-purple-50 border-purple-100',
    cyan: 'bg-cyan-50 border-cyan-100',
  };

  return (
    <Card className={`border shadow-sm rounded-xl ${colorClasses[color] || 'bg-white'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}