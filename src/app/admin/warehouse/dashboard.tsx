'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Boxes,
  CheckCircle,
  Truck,
  Users,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

interface WarehouseStats {
  totalUnits: number;
  totalProducts: number;
  approvedAgents: number;
  recentTransfers: number;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  status: string;
}

export default function WarehouseDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, agentsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/agents?status=APPROVED'),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUnits: statsData.stats?.warehouseUnits || 0,
          totalProducts: statsData.stats?.totalProducts || 0,
          approvedAgents: statsData.stats?.approvedAgents || 0,
          recentTransfers: statsData.stats?.recentSmsCount || 0,
        });
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Boxes className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Warehouse Units</p>
                <p className="text-2xl font-black text-gray-900">{stats?.totalUnits.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Products</p>
                <p className="text-2xl font-black text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Agents</p>
                <p className="text-2xl font-black text-gray-900">{stats?.approvedAgents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Transfers</p>
                <p className="text-2xl font-black text-gray-900">{stats?.recentTransfers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Link href="/admin/warehouse">
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold justify-start">
              <Truck className="w-4 h-4 mr-3" />
              Manage Warehouse Inventory
            </Button>
          </Link>
          <Link href="/admin/agents">
            <Button variant="outline" className="w-full h-12 font-bold justify-start">
              <Users className="w-4 h-4 mr-3" />
              View Approved Agents
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Approved Agents */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Approved Agents</CardTitle>
          <Link href="/admin/agents?status=APPROVED">
            <Button variant="ghost" size="sm" className="text-deep-sky-blue font-bold">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {agents.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No approved agents</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Phone</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{agent.firstName} {agent.lastName}</TableCell>
                    <TableCell>{agent.city}, {agent.region}</TableCell>
                    <TableCell className="font-mono text-sm">{agent.phone}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-600 border-green-100">Approved</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}