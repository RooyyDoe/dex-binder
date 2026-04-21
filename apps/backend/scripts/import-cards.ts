import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

type CsvRow = Record<string, string>;

type TcgApiCard = {
  images?: {
    large?: string;
    small?: string;
  };
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      if (current.length > 0 || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
      }
      current = '';
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  const [rawHeaders, ...entries] = rows;
  if (!rawHeaders?.length) {
    return [];
  }

  const headers = rawHeaders.map((header) => header.toLowerCase());

  return entries.map((entry) =>
    headers.reduce<CsvRow>((acc, key, index) => {
      acc[key] = entry[index] ?? '';
      return acc;
    }, {}),
  );
}

async function fetchCardImageData(externalId?: string) {
  if (!externalId) {
    return undefined;
  }

  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(externalId)}`,
    );

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { data?: TcgApiCard };
    return payload.data?.images;
  } catch {
    return undefined;
  }
}

function normalizeRow(row: CsvRow) {
  return {
    externalId: row.id || row.externalid || row.cardid || undefined,
    name: row.name || row.cardname || '',
    setName: row.set || row.setname || '',
    number: row.number || row.cardnumber || '',
    rarity: row.rarity || undefined,
    imageUrl: row.imageurl || row.image || undefined,
    imageSmallUrl: row.imagesmallurl || row.image_small || undefined,
  };
}

async function run() {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error('Usage: npm run import:cards -- <path-to-csv>');
  }

  const resolvedPath = resolve(process.cwd(), filePath);
  const content = await readFile(resolvedPath, 'utf-8');
  const rows = parseCsv(content);

  let imported = 0;

  for (const row of rows) {
    const normalized = normalizeRow(row);

    if (!normalized.name || !normalized.setName || !normalized.number) {
      continue;
    }

    const imageData = await fetchCardImageData(normalized.externalId);

    const payload = {
      ...normalized,
      imageUrl: imageData?.large ?? normalized.imageUrl,
      imageSmallUrl: imageData?.small ?? normalized.imageSmallUrl,
    };

    if (normalized.externalId) {
      await prisma.card.upsert({
        where: { externalId: normalized.externalId },
        create: payload,
        update: payload,
      });
    } else {
      await prisma.card.upsert({
        where: {
          set_number_name_unique: {
            setName: normalized.setName,
            number: normalized.number,
            name: normalized.name,
          },
        },
        create: payload,
        update: payload,
      });
    }

    imported += 1;
  }

  console.log(`Imported ${imported} cards from ${resolvedPath}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
