import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
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
      featured,
      isActive
    } = body;

    const product = await db.product.update({
      where: { id },
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
        isSerialized: isSerialized ?? false,
        featured: featured ?? false,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if product has inventory or units
    const inventory = await db.inventory.findFirst({
      where: { productId: id },
    });

    const units = await db.productUnit.findFirst({
      where: { productId: id },
    });

    if (inventory || units) {
      // Soft delete - just deactivate
      const product = await db.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ 
        message: 'Product deactivated (has associated inventory)',
        product 
      });
    }

    // Hard delete if no associations
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}