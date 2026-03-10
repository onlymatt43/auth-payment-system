import client from '@/lib/turso';

export type StorefrontMediaType = 'none' | 'image' | 'video';

export interface StorefrontItem {
  id: number;
  title: string;
  subtitle: string | null;
  price_label: string | null;
  cta_label: string | null;
  cta_url: string | null;
  media_url: string | null;
  media_type: StorefrontMediaType;
  badge: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

let initialized = false;

export async function ensureStorefrontTable() {
  if (initialized) return;

  await client.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS storefront_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        price_label TEXT,
        cta_label TEXT,
        cta_url TEXT,
        media_url TEXT,
        media_type TEXT NOT NULL DEFAULT 'none',
        badge TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });

  await client.execute({
    sql: 'CREATE INDEX IF NOT EXISTS idx_storefront_items_active_sort ON storefront_items(active, sort_order, id)',
    args: [],
  });

  initialized = true;
}

function normalizeMediaType(value: unknown): StorefrontMediaType {
  if (value === 'image' || value === 'video' || value === 'none') {
    return value;
  }
  return 'none';
}

export function mapStorefrontRow(row: any): StorefrontItem {
  return {
    id: Number(row.id),
    title: String(row.title || ''),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    price_label: row.price_label ? String(row.price_label) : null,
    cta_label: row.cta_label ? String(row.cta_label) : null,
    cta_url: row.cta_url ? String(row.cta_url) : null,
    media_url: row.media_url ? String(row.media_url) : null,
    media_type: normalizeMediaType(row.media_type),
    badge: row.badge ? String(row.badge) : null,
    active: Number(row.active ?? 1) ? 1 : 0,
    sort_order: Number(row.sort_order ?? 100),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
  };
}
