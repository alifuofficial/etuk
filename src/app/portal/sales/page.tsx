'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  soldAt: string;
  productUnit: { product: { name: string; category: string; price: number | null }; chassisNumber: string };
}

function SalesContent() {
  const router = useRouter();
  const { status } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?redirect=/portal');
    if (status === 'authenticated') fetchSales();
  }, [status, router]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/sales');
      if (res.ok) setSales((await res.json()).sales || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load sales', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {sales.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No sales recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Phone</TableHead>
                  <TableHead className="font-bold">Product</TableHead>
                  <TableHead className="font-bold">Chassis</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-gray-500 text-sm">{new Date(sale.soldAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell className="font-mono text-sm">{sale.customerPhone}</TableCell>
                    <TableCell>{sale.productUnit.product.name}</TableCell>
                    <TableCell className="font-mono font-bold text-sm">{sale.productUnit.chassisNumber}</TableCell>
                    <TableCell className="font-medium">{sale.productUnit.product.price ? `${sale.productUnit.product.price.toLocaleString()} ETB` : 'N/A'}</TableCell>
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

export default function SalesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <SalesContent />
    </Suspense>
  );
}