import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');

    if (!locale) {
      return NextResponse.json({ error: 'Locale is required' }, { status: 400 });
    }

    const language = await prisma.language.findUnique({
      where: { code: locale },
      include: {
        translations: true,
      },
    });

    if (!language) {
      // Fallback to English if the requested locale doesn't exist
      const fallbackLanguage = await prisma.language.findUnique({
        where: { code: 'en' },
        include: {
          translations: true,
        },
      });

      if (!fallbackLanguage) {
        return NextResponse.json({ error: 'Language not found' }, { status: 404 });
      }

      const flatTranslations = fallbackLanguage.translations.reduce((acc, t) => {
        acc[t.key] = t.value;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(flatTranslations);
    }

    const flatTranslations = language.translations.reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(flatTranslations);
  } catch (error) {
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

    const language = await prisma.language.findUnique({
      where: { code: locale },
    });

    if (!language) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Failed to update translations' }, { status: 500 });
  }
}
