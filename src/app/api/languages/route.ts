import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// Default languages to fallback to
const defaultLanguages = [
  { code: 'en', name: 'English', flag: null, isDefault: true, isActive: true },
  { code: 'am', name: 'አማርኛ', flag: null, isDefault: false, isActive: true },
  { code: 'or', name: 'Afaan Oromoo', flag: null, isDefault: false, isActive: true },
];

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { isDefault: 'desc' },
    });

    // If no languages in database, return defaults
    if (languages.length === 0) {
      return NextResponse.json(defaultLanguages);
    }

    return NextResponse.json(languages);
  } catch (error) {
    // If database error, return default languages
    console.error('Failed to fetch languages from database, returning defaults:', error);
    return NextResponse.json(defaultLanguages);
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
