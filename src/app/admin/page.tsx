'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Cell
} from 'recharts';

interface DashboardStats {
  totalAgents: number;
  pendingAgents: number;
  approvedAgents: number;
  totalProducts: number;
  recentAgents: any[];
}

const mockChartData = [
  { month: 'Oct', applications: 12 },
  { month: 'Nov', applications: 18 },
  { month: 'Dec', applications: 15 },
  { month: 'Jan', applications: 25 },
  { month: 'Feb', applications: 32 },
  { month: 'Mar', applications: 28 },
];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

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
          value={stats?.pendingAgents || 0} 
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

      {/* Analytics & Table Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Registration Trends</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Monthly agent application volume</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-300" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    {mockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === mockChartData.length - 1 ? '#0369a1' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Summary Card */}
        <Card className="bg-white border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 pb-4 px-6">
            <CardTitle className="text-lg font-bold">Network Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Conversion Rate</span>
                <span className="text-lg font-black text-gray-900">68%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-deepSkyBlue rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Key Metrics</h4>
              <div className="flex items-center justify-between py-1 px-1">
                <span className="text-sm font-medium text-gray-600">Verification Speed</span>
                <span className="text-sm font-bold text-gray-900">2.4 Days</span>
              </div>
              <div className="flex items-center justify-between py-1 px-1">
                <span className="text-sm font-medium text-gray-600">Region Coverage</span>
                <span className="text-sm font-bold text-gray-900">12/15 Cities</span>
              </div>
              <div className="flex items-center justify-between py-1 px-1">
                <span className="text-sm font-medium text-gray-600">System Uptime</span>
                <span className="text-sm font-bold text-green-600">99.9%</span>
              </div>
            </div>

            <Link href="/admin/agents?status=PENDING" className="block pt-4">
              <Button className="w-full bg-deepSkyBlue text-white hover:bg-blue-600 font-bold h-12 rounded-lg">
                Manage Applications
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Applications Table */}
        <Card className="lg:col-span-3 border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-6">
            <div>
              <CardTitle className="text-lg font-bold">Latest Applications</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">The most recent submissions requiring your attention</p>
            </div>
            <Link href="/admin/agents">
              <Button variant="ghost" size="sm" className="text-deepSkyBlue font-bold hover:bg-gray-50">
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
                {stats?.recentAgents?.length ? (
                  stats.recentAgents.map((agent) => (
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
