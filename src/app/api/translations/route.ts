import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Helper to flatten nested JSON object
function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>, newKey));
    }
  }
  
  return result;
}

// Helper to load translations from JSON files
function loadTranslationsFromJSON(locale: string): Record<string, string> | null {
  try {
    const filePath = path.join(process.cwd(), 'src', 'translations', `${locale}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(fileContent);
    
    return flattenTranslations(translations);
  } catch (error) {
    console.error(`Failed to load translations from JSON for ${locale}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');

    if (!locale) {
      return NextResponse.json({ error: 'Locale is required' }, { status: 400 });
    }

    // Try to fetch from database first
    try {
      const language = await prisma.language.findUnique({
        where: { code: locale },
        include: {
          translations: true,
        },
      });

      if (language && language.translations.length > 0) {
        // We have translations in the database
        const flatTranslations = language.translations.reduce((acc, t) => {
          acc[t.key] = t.value;
          return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(flatTranslations);
      }
    } catch (dbError) {
      console.log('Database lookup failed, falling back to JSON files');
    }

    // Fallback to JSON files
    let translations = loadTranslationsFromJSON(locale);
    
    if (!translations) {
      // Try English as fallback
      translations = loadTranslationsFromJSON('en');
      
      if (!translations) {
        return NextResponse.json({ error: 'Translations not found' }, { status: 404 });
      }
    }

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { locale, translations } = body; // translations: { [key]: value }

    if (!locale || !translations) {
      return NextResponse.json({ error: 'Locale and translations are required' }, { status: 400 });
    }

    // Ensure language exists
    let language = await prisma.language.findUnique({
      where: { code: locale },
    });

    if (!language) {
      // Create the language if it doesn't exist
      language = await prisma.language.create({
        data: {
          code: locale,
          name: locale === 'en' ? 'English' : locale === 'am' ? 'አማርኛ' : 'Afaan Oromoo',
          isDefault: locale === 'en',
        },
      });
    }

    const updates = Object.entries(translations).map(([key, value]) => {
      return prisma.translation.upsert({
        where: {
          key_languageId: {
            key,
            languageId: language.id,
          },
        },
        update: { value: value as string },
        create: {
          key,
          value: value as string,
          languageId: language.id,
        },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Translations updated successfully' });
  } catch (error) {
    console.error('Failed to update translations:', error);
    return NextResponse.json({ error: 'Failed to update translations' }, { status: 500 });
  }
}
