import { NextResponse } from 'next/server';
import sitesData from '@/data/sites.json';
import { RecyclingSite, Borough, WasteCategory } from '@/types/recycling';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const borough = searchParams.get('borough');
  const category = searchParams.get('category');

  let sites = sitesData as RecyclingSite[];

  if (borough && borough.toLowerCase() !== 'all') {
    sites = sites.filter(
      (s) => s.borough.toLowerCase() === borough.toLowerCase()
    );
  }

  if (category) {
    sites = sites.filter((s) =>
      s.acceptedCategories.includes(category as WasteCategory)
    );
  }

  return NextResponse.json({
    total: sites.length,
    sites,
  });
}
