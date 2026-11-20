import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DSNY_SPECIAL_WASTE_URL = 'https://data.cityofnewyork.us/resource/242c-ru4i.json?$limit=100';
const ELECTRONICS_URL = 'https://data.cityofnewyork.us/resource/wshr-5vic.json?$limit=500';

const BORO_CODE_MAP = {
  '1': 'Manhattan',
  '2': 'Bronx',
  '3': 'Brooklyn',
  '4': 'Queens',
  '5': 'Staten Island',
};

async function syncData() {
  console.log('Fetching NYC Open Data datasets...');

  const [specialWasteRes, electronicsRes] = await Promise.all([
    fetch(DSNY_SPECIAL_WASTE_URL),
    fetch(ELECTRONICS_URL),
  ]);

  if (!specialWasteRes.ok || !electronicsRes.ok) {
    throw new Error('Failed to fetch data from NYC Open Data APIs');
  }

  const specialWasteData = await specialWasteRes.json();
  const electronicsData = await electronicsRes.json();

  console.log(`Fetched ${specialWasteData.length} special waste sites and ${electronicsData.length} electronics sites.`);

  const sites = [];

  // Process DSNY Special Waste Sites
  for (const item of specialWasteData) {
    const coords = item.point?.coordinates;
    if (!coords || coords.length < 2) continue;

    const [lng, lat] = coords;
    const boro = BORO_CODE_MAP[item.boro] || 'Manhattan';

    sites.push({
      id: `dsny-special-${item.fid || item.globalid}`,
      name: `DSNY Special Waste Drop-Off (${boro})`,
      facilityType: 'dsny_special_waste',
      address: item.address,
      borough: boro,
      neighborhood: item.city || boro,
      zipCode: item.zip,
      coordinates: {
        lat: Number(lat),
        lng: Number(lng),
      },
      acceptedCategories: [
        'hazardous',
        'electronics',
        'batteries',
        'paint',
        'automotive',
        'mercury_lighting',
      ],
      acceptedItemsText: [
        'Hazardous household chemicals & nail polish',
        'Rechargeable & lithium-ion batteries',
        'Car / automotive lead-acid batteries',
        'Motor oil, transmission fluid, and antifreeze',
        'Oil-based and latex paint',
        'Fluorescent bulbs and tubes',
        'Electronics (computers, TVs, monitors, phones)',
        'Small camping propane cylinders',
        'Up to 4 passenger vehicle tires',
      ],
      hours: 'Saturdays & the last Friday of every month: 10:00 AM – 5:00 PM (Closed on legal holidays)',
      requirements: 'NYC residents only. Non-commercial waste only. Must present NY State driver license and proof of residency (e.g. utility bill).',
      phone: '311',
      website: 'https://www.nyc.gov/assets/dsny/site/services/harmful-products/special-waste-drop-offs',
      sourceDataset: 'DSNY Special Waste Drop-off Sites (242c-ru4i)',
    });
  }

  // Process Electronics Sites
  for (const item of electronicsData) {
    let lat = Number(item.latitude || (item.point?.coordinates ? item.point.coordinates[1] : null));
    let lng = Number(item.longitude || (item.point?.coordinates ? item.point.coordinates[0] : null));

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

    const boro = item.borough || 'Manhattan';
    const siteName = item.dropoff_sitename || 'Electronics Drop-Off Partner';

    const isRetail = /best buy|staples|apple|target|home depot/i.test(siteName);
    const facilityType = isRetail ? 'retail_takeback' : 'electronics_partner';

    sites.push({
      id: `electronics-${item.objectid || Math.random().toString(36).substring(7)}`,
      name: `${siteName} - ${item.address}`,
      facilityType,
      address: item.address,
      borough: boro,
      neighborhood: item.ntaname || '',
      zipCode: item.zipcode || '',
      coordinates: {
        lat,
        lng,
      },
      acceptedCategories: ['electronics', 'batteries'],
      acceptedItemsText: [
        'Computers, laptops, monitors, tablets',
        'Cell phones, chargers, cables, keyboards',
        'Printers, scanners, video equipment',
        'Rechargeable batteries (retailers)',
      ],
      hours: isRetail ? 'Store business hours' : 'Regular operating hours; call ahead',
      requirements: 'Drop-off accepted during operational hours. Check store policy for size/quantity limits.',
      phone: '311',
      sourceDataset: 'Electronics Drop-Off Locations in NYC (wshr-5vic)',
    });
  }

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'sites.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(sites, null, 2), 'utf-8');

  console.log(`Successfully normalized and saved ${sites.length} sites to ${outputPath}`);
}

syncData().catch((err) => {
  console.error('Error syncing data:', err);
  process.exit(1);
});
