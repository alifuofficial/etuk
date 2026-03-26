import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    
    const where: Record<string, unknown> = { isActive: true };
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    if (category) {
      where.category = category;
    }
    
    const products = await db.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
