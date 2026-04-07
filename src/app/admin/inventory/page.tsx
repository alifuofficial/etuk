'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Boxes, 
  Warehouse, 
  Users, 
  ArrowRightLeft, 
  Package,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = inventory.reduce((acc, item) => {
    if (item.agentId === null) {
      acc.warehouse += item.quantity;
    } else {
      acc.agents += item.quantity;
    }
    acc.total += item.quantity;
    return acc;
  }, { warehouse: 0, agents: 0, total: 0 });

  const filteredInventory = inventory.filter(item => {
    const searchLower = search.toLowerCase();
    const productName = item.product.name.toLowerCase();
    const holderName = item.agent 
      ? `${item.agent.firstName} ${item.agent.lastName} ${item.agent.businessName || ''}`.toLowerCase()
      : 'warehouse';
    
    return productName.includes(searchLower) || holderName.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
        <p className="text-sm text-gray-400">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Oversight</h1>
        <p className="text-sm text-gray-500 mt-1.5">Monitor unit distribution across central warehouse and agent network.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Boxes className="w-5 h-5 text-deep-sky-blue" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{totals.total}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">Across entire network</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Warehouse</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{totals.warehouse}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">Ready for distribution</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-2xl bg-green-50/30 border-green-100 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-green-700/50 uppercase tracking-widest">With Agents</span>
            </div>
            <p className="text-3xl font-black text-green-700">{totals.agents}</p>
            <p className="text-xs text-green-600/70 mt-1 font-medium italic">Currently in the field</p>
          </CardContent>
        </Card>
      </div>

      {/* Roster Table */}
      <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-gray-900">Distribution Ledger</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Product or holder name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white border border-gray-200 rounded-xl text-sm focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">Product</TableHead>
                  <TableHead className="font-bold text-gray-700">Holder</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Type</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Quantity</TableHead>
                  <TableHead className="font-bold text-gray-700">Units / Chassis</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{item.product.name}</TableCell>
                    <TableCell>
                      {item.agent ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{item.agent.firstName} {item.agent.lastName}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{item.agent.businessName || 'Independent Agent'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-deep-sky-blue font-bold">
                          <Warehouse className="w-3.5 h-3.5" />
                          Central Warehouse
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.product.isSerialized ? (
                        <Badge className="bg-purple-50 text-purple-600 border-purple-100 font-bold text-[9px] uppercase tracking-widest">Serialized</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 font-medium text-[9px] uppercase tracking-widest">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-black text-gray-900">{item.quantity}</span>
                    </TableCell>
                    <TableCell>
                      {item.product.isSerialized ? (
                        <div className="flex flex-wrap gap-1 max-w-[250px] max-h-[60px] overflow-y-auto pr-2 custom-scrollbar">
                          {item.product.units
                            .filter((u: any) => u.currentAgentId === item.agentId && !u.isSold)
                            .map((unit: any) => (
                              <span key={unit.id} className="inline-block px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-black tabular-nums text-gray-500 hover:bg-white transition-colors" title={unit.chassisNumber}>
                                {unit.chassisNumber}
                              </span>
                            ))
                          }
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Bulk (non-serialized)</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-400 font-bold">
                      No matching inventory records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
