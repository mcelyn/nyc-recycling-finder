export interface ZipInfo {
  zip: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';
  neighborhood?: string;
  lat: number;
  lng: number;
}

// Major NYC ZIP code centroids
export const NYC_ZIP_MAP: Record<string, ZipInfo> = {
  // Manhattan
  '10001': { zip: '10001', borough: 'Manhattan', neighborhood: 'Chelsea / Midtown', lat: 40.7506, lng: -73.9972 },
  '10002': { zip: '10002', borough: 'Manhattan', neighborhood: 'Lower East Side', lat: 40.7158, lng: -73.9861 },
  '10003': { zip: '10003', borough: 'Manhattan', neighborhood: 'East Village', lat: 40.7317, lng: -73.9892 },
  '10009': { zip: '10009', borough: 'Manhattan', neighborhood: 'Alphabet City', lat: 40.7264, lng: -73.9785 },
  '10010': { zip: '10010', borough: 'Manhattan', neighborhood: 'Flatiron / Gramercy', lat: 40.7391, lng: -73.9826 },
  '10011': { zip: '10011', borough: 'Manhattan', neighborhood: 'Chelsea', lat: 40.7416, lng: -74.0006 },
  '10012': { zip: '10012', borough: 'Manhattan', neighborhood: 'SoHo / Greenwich Village', lat: 40.7256, lng: -73.9983 },
  '10013': { zip: '10013', borough: 'Manhattan', neighborhood: 'Tribeca / Chinatown', lat: 40.7202, lng: -74.0048 },
  '10014': { zip: '10014', borough: 'Manhattan', neighborhood: 'West Village', lat: 40.7336, lng: -74.0067 },
  '10016': { zip: '10016', borough: 'Manhattan', neighborhood: 'Murray Hill', lat: 40.7456, lng: -73.9777 },
  '10017': { zip: '10017', borough: 'Manhattan', neighborhood: 'Midtown East', lat: 40.7523, lng: -73.9725 },
  '10018': { zip: '10018', borough: 'Manhattan', neighborhood: 'Garment District', lat: 40.7554, lng: -73.9931 },
  '10019': { zip: '10019', borough: 'Manhattan', neighborhood: "Hell's Kitchen / Midtown", lat: 40.7654, lng: -73.9888 },
  '10021': { zip: '10021', borough: 'Manhattan', neighborhood: 'Upper East Side', lat: 40.7686, lng: -73.9587 },
  '10022': { zip: '10022', borough: 'Manhattan', neighborhood: 'Midtown East', lat: 40.7587, lng: -73.9675 },
  '10023': { zip: '10023', borough: 'Manhattan', neighborhood: 'Lincoln Square', lat: 40.7754, lng: -73.9828 },
  '10024': { zip: '10024', borough: 'Manhattan', neighborhood: 'Upper West Side', lat: 40.7892, lng: -73.9748 },
  '10025': { zip: '10025', borough: 'Manhattan', neighborhood: 'Manhattan Valley', lat: 40.7981, lng: -73.9664 },
  '10026': { zip: '10026', borough: 'Manhattan', neighborhood: 'South Harlem', lat: 40.8024, lng: -73.9529 },
  '10027': { zip: '10027', borough: 'Manhattan', neighborhood: 'Morningside Heights / Harlem', lat: 40.8116, lng: -73.9535 },
  '10028': { zip: '10028', borough: 'Manhattan', neighborhood: 'Yorkville', lat: 40.7766, lng: -73.9525 },
  '10029': { zip: '10029', borough: 'Manhattan', neighborhood: 'East Harlem', lat: 40.7917, lng: -73.9441 },
  '10031': { zip: '10031', borough: 'Manhattan', neighborhood: 'Hamilton Heights', lat: 40.8256, lng: -73.9499 },
  '10032': { zip: '10032', borough: 'Manhattan', neighborhood: 'Washington Heights', lat: 40.8389, lng: -73.9429 },
  '10033': { zip: '10033', borough: 'Manhattan', neighborhood: 'Washington Heights North', lat: 40.8497, lng: -73.9365 },
  '10034': { zip: '10034', borough: 'Manhattan', neighborhood: 'Inwood', lat: 40.8677, lng: -73.9212 },
  '10036': { zip: '10036', borough: 'Manhattan', neighborhood: 'Times Square / Clinton', lat: 40.7596, lng: -73.9912 },
  '10038': { zip: '10038', borough: 'Manhattan', neighborhood: 'Financial District / Seaport', lat: 40.7099, lng: -74.0019 },

  // Brooklyn
  '11201': { zip: '11201', borough: 'Brooklyn', neighborhood: 'Brooklyn Heights / DUMBO', lat: 40.6953, lng: -73.9902 },
  '11205': { zip: '11205', borough: 'Brooklyn', neighborhood: 'Fort Greene / Navy Yard', lat: 40.6934, lng: -73.9688 },
  '11206': { zip: '11206', borough: 'Brooklyn', neighborhood: 'Williamsburg / Bushwick', lat: 40.7018, lng: -73.9431 },
  '11211': { zip: '11211', borough: 'Brooklyn', neighborhood: 'Williamsburg', lat: 40.7121, lng: -73.9538 },
  '11214': { zip: '11214', borough: 'Brooklyn', neighborhood: 'Bensonhurst', lat: 40.5997, lng: -73.9983 },
  '11215': { zip: '11215', borough: 'Brooklyn', neighborhood: 'Park Slope', lat: 40.6669, lng: -73.9856 },
  '11217': { zip: '11217', borough: 'Brooklyn', neighborhood: 'Boerum Hill / Atlantic Center', lat: 40.6836, lng: -73.9821 },
  '11222': { zip: '11222', borough: 'Brooklyn', neighborhood: 'Greenpoint', lat: 40.7277, lng: -73.9478 },
  '11225': { zip: '11225', borough: 'Brooklyn', neighborhood: 'Crown Heights / Prospect Lefferts', lat: 40.6629, lng: -73.9539 },
  '11231': { zip: '11231', borough: 'Brooklyn', neighborhood: 'Red Hook / Carroll Gardens', lat: 40.6782, lng: -74.0039 },
  '11238': { zip: '11238', borough: 'Brooklyn', neighborhood: 'Prospect Heights / Clinton Hill', lat: 40.6793, lng: -73.9649 },

  // Queens
  '11101': { zip: '11101', borough: 'Queens', neighborhood: 'Long Island City', lat: 40.7468, lng: -73.9388 },
  '11102': { zip: '11102', borough: 'Queens', neighborhood: 'Astoria', lat: 40.7713, lng: -73.9261 },
  '11106': { zip: '11106', borough: 'Queens', neighborhood: 'Astoria / Broadway', lat: 40.7617, lng: -73.9312 },
  '11354': { zip: '11354', borough: 'Queens', neighborhood: 'Flushing', lat: 40.7687, lng: -73.8309 },
  '11375': { zip: '11375', borough: 'Queens', neighborhood: 'Forest Hills', lat: 40.7214, lng: -73.8454 },
  '11377': { zip: '11377', borough: 'Queens', neighborhood: 'Woodside', lat: 40.7454, lng: -73.9019 },
  '11385': { zip: '11385', borough: 'Queens', neighborhood: 'Ridgewood / Glendale', lat: 40.7001, lng: -73.8891 },

  // Bronx
  '10451': { zip: '10451', borough: 'Bronx', neighborhood: 'South Bronx / Grand Concourse', lat: 40.8208, lng: -73.9221 },
  '10454': { zip: '10454', borough: 'Bronx', neighborhood: 'Mott Haven', lat: 40.8066, lng: -73.9168 },
  '10458': { zip: '10458', borough: 'Bronx', neighborhood: 'Belmont / Fordham', lat: 40.8631, lng: -73.8882 },
  '10461': { zip: '10461', borough: 'Bronx', neighborhood: 'Pelham Bay / Morris Park', lat: 40.8468, lng: -73.8436 },
  '10474': { zip: '10474', borough: 'Bronx', neighborhood: 'Hunts Point', lat: 40.8123, lng: -73.8845 },

  // Staten Island
  '10301': { zip: '10301', borough: 'Staten Island', neighborhood: 'St. George / Tompkinsville', lat: 40.6301, lng: -74.0934 },
  '10306': { zip: '10306', borough: 'Staten Island', neighborhood: 'New Dorp', lat: 40.5694, lng: -74.1165 },
  '10312': { zip: '10312', borough: 'Staten Island', neighborhood: 'Eltingville / Annadale', lat: 40.5434, lng: -74.1798 },
  '10314': { zip: '10314', borough: 'Staten Island', neighborhood: 'Castleton Corners / Bloomfield', lat: 40.6044, lng: -74.1539 },
};

/**
 * Identify borough from ZIP prefix if exact coordinate not in dictionary
 */
export function getBoroughFromZip(zip: string): 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island' | null {
  if (NYC_ZIP_MAP[zip]) return NYC_ZIP_MAP[zip].borough;

  if (zip.startsWith('100') || zip.startsWith('101') || zip.startsWith('102')) return 'Manhattan';
  if (zip.startsWith('104')) return 'Bronx';
  if (zip.startsWith('112')) return 'Brooklyn';
  if (zip.startsWith('111') || zip.startsWith('113') || zip.startsWith('114') || zip.startsWith('116')) return 'Queens';
  if (zip.startsWith('103')) return 'Staten Island';

  return null;
}
