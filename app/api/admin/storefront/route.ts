import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';
import { ensureStorefrontTable, mapStorefrontRow } from '@/lib/storefront';

function sanitizePayload(input: Record<string, unknown>) {
  const title = String(input.title || '').trim();
  const subtitle = String(input.subtitle || '').trim();
  const priceLabel = String(input.price_label || '').trim();
  const ctaLabel = String(input.cta_label || '').trim();
  const ctaUrl = String(input.cta_url || '').trim();
  const mediaUrl = String(input.media_url || '').trim();
  const mediaType = input.media_type === 'video' || input.media_type === 'image' ? input.media_type : 'none';
  const badge = String(input.badge || '').trim();
  const active = input.active ? 1 : 0;
  const sortOrder = Number(input.sort_order ?? 100);

  return {
    title,
    subtitle: subtitle || null,
    priceLabel: priceLabel || null,
    ctaLabel: ctaLabel || null,
    ctaUrl: ctaUrl || null,
    mediaUrl: mediaUrl || null,
    mediaType,
    badge: badge || null,
    active,
    sortOrder: Number.isFinite(sortOrder) ? Math.max(0, Math.floor(sortOrder)) : 100,
  };
}

export async function GET() {
  try {
    await ensureStorefrontTable();
    const result = await client.execute({
      sql: 'SELECT * FROM storefront_items ORDER BY sort_order ASC, id ASC',
      args: [],
    });

    return NextResponse.json({ items: result.rows.map(mapStorefrontRow) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch storefront items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureStorefrontTable();
    const body = await req.json();
    const payload = sanitizePayload(body || {});

    if (!payload.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    await client.execute({
      sql: `
        INSERT INTO storefront_items
        (title, subtitle, price_label, cta_label, cta_url, media_url, media_type, badge, active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        payload.title,
        payload.subtitle,
        payload.priceLabel,
        payload.ctaLabel,
        payload.ctaUrl,
        payload.mediaUrl,
        payload.mediaType,
        payload.badge,
        payload.active,
        payload.sortOrder,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create storefront item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureStorefrontTable();
    const body = await req.json();
    const id = Number(body?.id);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Valid id is required' }, { status: 400 });
    }

    const payload = sanitizePayload(body || {});
    if (!payload.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    await client.execute({
      sql: `
        UPDATE storefront_items
        SET
          title = ?,
          subtitle = ?,
          price_label = ?,
          cta_label = ?,
          cta_url = ?,
          media_url = ?,
          media_type = ?,
          badge = ?,
          active = ?,
          sort_order = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        payload.title,
        payload.subtitle,
        payload.priceLabel,
        payload.ctaLabel,
        payload.ctaUrl,
        payload.mediaUrl,
        payload.mediaType,
        payload.badge,
        payload.active,
        payload.sortOrder,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update storefront item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureStorefrontTable();
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Valid id is required' }, { status: 400 });
    }

    await client.execute({ sql: 'DELETE FROM storefront_items WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete storefront item' }, { status: 500 });
  }
}
