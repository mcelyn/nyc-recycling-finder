import { NextResponse } from 'next/server';
import itemsData from '@/data/items.json';
import { RecyclingItem } from '@/types/recycling';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  const items = itemsData as RecyclingItem[];

  if (!q) {
    return NextResponse.json({ total: items.length, items });
  }

  const fuse = new Fuse(items, {
    keys: ['name', 'aliases', 'category', 'disposalSummary'],
    threshold: 0.35,
  });

  const results = fuse.search(q).map((r) => r.item);

  return NextResponse.json({
    query: q,
    total: results.length,
    items: results,
  });
}
