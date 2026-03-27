import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json(languages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, flag, isDefault } = body;

    const language = await prisma.language.create({
      data: {
        code,
        name,
        flag,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(language);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 });
  }
}
