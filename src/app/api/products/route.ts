import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const all = searchParams.get('all');
    
    // Check if user is admin for fetching all products including inactive
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MARKETING_MANAGER';
    
    const where: Record<string, unknown> = {};
    
    // Only filter by isActive if not fetching all (admin) or not admin
    if (all !== 'true' || !isAdmin) {
      where.isActive = true;
    }
    
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

// POST - Create a new product
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      name, 
      nameAm, 
      nameOr, 
      description, 
      descriptionAm, 
      descriptionOr,
      category, 
      specifications, 
      price, 
      images,
      isSerialized,
      featured 
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        nameAm: nameAm || null,
        nameOr: nameOr || null,
        description: description || null,
        descriptionAm: descriptionAm || null,
        descriptionOr: descriptionOr || null,
        category,
        specifications: specifications || null,
        price: price ? parseFloat(price) : null,
        images: images || null,
        isSerialized: isSerialized || false,
        featured: featured || false,
        isActive: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
