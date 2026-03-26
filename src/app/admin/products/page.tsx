'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Edit, Star, StarOff, Zap } from 'lucide-react';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case '3W':
        return <Badge className="bg-sky-500">3-Wheeler</Badge>;
      case 'SPARE_PARTS':
        return <Badge className="bg-green-500">Spare Parts</Badge>;
      case 'ACCESSORIES':
        return <Badge className="bg-purple-500">Accessories</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage ETUK product catalog</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const specs = parseSpecs(product.specifications);
          
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
                <svg viewBox="0 0 200 150" className="w-40 h-32">
                  <defs>
                    <linearGradient id="prodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#87ceeb" />
                      <stop offset="100%" stopColor="#5fb8d9" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="100" cy="130" rx="70" ry="10" fill="rgba(0,0,0,0.1)" />
                  <path d="M30 100 L50 70 L150 70 L170 100 L170 110 L30 110 Z" fill="url(#prodGrad)" stroke="#0077B6" strokeWidth="2"/>
                  <path d="M50 70 L70 45 L130 45 L150 70 Z" fill="white" stroke="#0077B6" strokeWidth="2"/>
                  <circle cx="60" cy="115" r="18" fill="#333"/>
                  <circle cx="140" cy="115" r="18" fill="#333"/>
                  <text x="100" y="92" textAnchor="middle" fill="#0077B6" fontSize="12" fontWeight="bold">ETUK</text>
                </svg>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.nameAm && (
                      <p className="text-sm text-gray-500">{product.nameAm}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {product.featured && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {getCategoryBadge(product.category)}
                  {product.isActive ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-400">Inactive</Badge>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Quick Specs */}
                {specs && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                    {specs.engine && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Motor:</span>
                        <span className="font-medium">{specs.engine.motorPower}</span>
                      </div>
                    )}
                    {specs.performance && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Range:</span>
                        <span className="font-medium">{specs.performance.maxRange}</span>
                      </div>
                    )}
                    {specs.battery && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Battery:</span>
                        <span className="font-medium">{specs.battery.capacity}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={product.featured ? 'text-yellow-600' : 'text-gray-400'}
                  >
                    {product.featured ? (
                      <StarOff className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No products yet</h3>
            <p className="text-gray-500">Products will appear here once added.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
