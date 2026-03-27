import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', isDefault: true },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹', isDefault: false },
    { code: 'or', name: 'Afaan Oromoo', flag: '🇪🇹', isDefault: false },
  ];

  for (const lang of languages) {
    console.log(`Processing ${lang.name} (${lang.code})...`);
    
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      update: lang,
      create: lang,
    });

    const filePath = path.join(process.cwd(), 'src', 'translations', `${lang.code}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}`);
      continue;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const flattenTranslations = (obj: any, prefix = '') => {
      let translations: { key: string; value: string }[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          translations = [...translations, ...flattenTranslations(value, fullKey)];
        } else {
          translations.push({ key: fullKey, value: String(value) });
        }
      }
      return translations;
    };

    const flatTranslations = flattenTranslations(content);

    console.log(`Syncing ${flatTranslations.length} translations for ${lang.name}...`);

    // Use a transaction for better performance if possible, or just sequential upserts
    for (const { key, value } of flatTranslations) {
      await prisma.translation.upsert({
        where: {
          key_languageId: {
            key,
            languageId: language.id,
          },
        },
        update: { value },
        create: {
          key,
          value,
          languageId: language.id,
        },
      });
    }
  }

  console.log('Sync complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
