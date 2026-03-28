'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Edit, 
  Star, 
  Zap, 
  BatteryCharging,
  Gauge,
  Plus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAm: string | null;
  nameOr: string | null;
  description: string | null;
  category: string;
  specifications: string | null;
  price: number | null;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('API response is not an array:', data);
          setProducts([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch products:', errorData);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-[10px] font-bold uppercase">
        Inactive
      </span>
    );
  };

  const parseSpecs = (specsJson: string | null) => {
    if (!specsJson) return null;
    try {
      return JSON.parse(specsJson);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
        <p className="text-sm text-gray-500">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the Soreti product catalog and specifications.</p>
        </div>
        <Button className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-6 rounded-lg shadow-lg shadow-gray-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products.map((product) => {
          const specs = parseSpecs(product.specifications);
          
          return (
            <Card key={product.id} className="group overflow-hidden bg-white border-gray-200 rounded-xl hover:shadow-md transition-shadow outline-none flex flex-col">
              {/* Image Placeholder */}
              <div className="h-48 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
                <Package className="w-16 h-16 text-gray-200" />
                <div className="absolute top-4 left-4">
                   <span className="bg-white/80 backdrop-blur-sm border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 uppercase">
                    {product.category}
                  </span>
                </div>
                {product.featured && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                )}
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
                  {getStatusBadge(product.isActive)}
                </div>
                
                {product.nameAm && (
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                    {product.nameAm}
                  </p>
                )}

                {product.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Specs Summary */}
                {specs && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Motor</p>
                      <p className="text-xs font-bold text-gray-900">{specs.engine?.motorPower || '4000W'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Range</p>
                      <p className="text-xs font-bold text-gray-900">{specs.performance?.maxRange || '180KM'}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" className="flex-1 h-10 rounded-lg border-gray-200 text-sm font-bold hover:bg-gray-50">
                    <Edit className="w-4 h-4 mr-2 text-deepSkyBlue" />
                    Edit
                  </Button>
                  <Button variant="outline" className={`w-10 h-10 rounded-lg border-gray-200 ${product.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-400'}`}>
                    <Star className={`w-4 h-4 ${product.featured ? 'fill-amber-500' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-24 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Catalogue Empty</h3>
            <p className="text-gray-500 text-sm mt-2">No products have been added to the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
