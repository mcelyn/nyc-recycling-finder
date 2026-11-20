'use client';

import React from 'react';
import { RecyclingItem, Borough } from '@/types/recycling';
import { Flame, Radio, MapPin, Sparkles } from 'lucide-react';

interface ResultsSummaryCardProps {
  totalCount: number;
  dsnyCount: number;
  electronicsCount: number;
  selectedItem: RecyclingItem | null;
  selectedBorough: Borough | 'All';
  selectedZip: string | null;
  hasUserLocation: boolean;
}

export default function ResultsSummaryCard({
  totalCount,
  dsnyCount,
  electronicsCount,
  selectedItem,
  selectedBorough,
  selectedZip,
  hasUserLocation,
}: ResultsSummaryCardProps) {
  // Determine if the researched item targets DSNY Special Waste or Electronics Drop Off
  const isDsnySpecialWaste = selectedItem
    ? selectedItem.acceptedFacilityTypes.includes('dsny_special_waste') &&
      !selectedItem.acceptedFacilityTypes.includes('electronics_partner')
    : false;

  const isElectronicsOrBattery = selectedItem
    ? !isDsnySpecialWaste
    : false;

  // Selected location label
  const locationLabel = hasUserLocation
    ? 'Near Your Location'
    : selectedZip
    ? `ZIP ${selectedZip}`
    : selectedBorough !== 'All'
    ? selectedBorough
    : 'All 5 Boroughs';

  // Mode 1: Researched item requires DSNY Special Waste (Amber theme)
  if (selectedItem && isDsnySpecialWaste) {
    return (
      <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 shadow-xs text-amber-950 transition-all animate-in fade-in duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800 flex items-center gap-1">
                <span>Facility Type</span>
                <span>&bull;</span>
                <span>DSNY Special Waste</span>
              </div>
              <div className="text-sm font-extrabold text-amber-950">
                {dsnyCount} {dsnyCount === 1 ? 'Location' : 'Locations'} Available
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold bg-white/80 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
            <MapPin className="w-3 h-3 text-amber-600" />
            <span>{locationLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  // Mode 2: Researched item is Electronics / Batteries (Blue theme)
  if (selectedItem && isElectronicsOrBattery) {
    return (
      <div className="bg-blue-50 border border-blue-300/80 rounded-2xl p-3.5 shadow-xs text-blue-950 transition-all animate-in fade-in duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-800 flex items-center gap-1">
                <span>Facility Type</span>
                <span>&bull;</span>
                <span>Electronics & Battery Drop-Off</span>
              </div>
              <div className="text-sm font-extrabold text-blue-950">
                {totalCount} {totalCount === 1 ? 'Location' : 'Locations'} Available
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold bg-white/80 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>{locationLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  // Mode 3: General view (All facility types showing)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
            Drop-Off Facilities in {locationLabel}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              {dsnyCount} Special Waste
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {electronicsCount} Electronics & Batteries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{totalCount} Total Locations</span>
        </div>
      </div>
    </div>
  );
}
