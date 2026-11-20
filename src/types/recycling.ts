export type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';

export type FacilityType =
  | 'dsny_special_waste'
  | 'electronics_partner'
  | 'textile_dropoff'
  | 'retail_takeback';

export type WasteCategory =
  | 'hazardous'
  | 'electronics'
  | 'batteries'
  | 'paint'
  | 'automotive'
  | 'textiles'
  | 'mercury_lighting'
  | 'appliances';

export interface RecyclingSite {
  id: string;
  name: string;
  facilityType: FacilityType;
  address: string;
  borough: Borough;
  neighborhood?: string;
  zipCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  acceptedCategories: WasteCategory[];
  acceptedItemsText: string[];
  hours: string;
  requirements: string;
  phone?: string;
  website?: string;
  sourceDataset: string;
  distanceInMiles?: number;
}

export interface RecyclingItem {
  id: string;
  name: string;
  aliases: string[];
  category: WasteCategory;
  curbsideAllowed: boolean;
  canPutInTrash: boolean;
  disposalSummary: string;
  stepByStepInstructions: string[];
  handlingTips?: string;
  acceptedFacilityTypes: FacilityType[];
}
