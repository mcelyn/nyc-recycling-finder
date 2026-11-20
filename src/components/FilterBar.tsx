'use client';

import React from 'react';
import { Borough } from '@/types/recycling';
import { Navigation, Compass, Loader2 } from 'lucide-react';

interface FilterBarProps {
  selectedBorough: Borough | 'All';
  onSelectBorough: (borough: Borough | 'All') => void;
  onRequestLocation: () => void;
  isLocating: boolean;
  hasUserLocation: boolean;
  totalResults: number;
}

const BOROUGHS: (Borough | 'All')[] = [
  'All',
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
];

export default function FilterBar({
  selectedBorough,
  onSelectBorough,
  onRequestLocation,
  isLocating,
  hasUserLocation,
  totalResults,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Borough Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {BOROUGHS.map((boro) => (
          <button
            key={boro}
            onClick={() => onSelectBorough(boro)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedBorough === boro
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {boro}
          </button>
        ))}
      </div>

      {/* Near Me Button & Counter */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-xs text-slate-500 font-medium">
          {totalResults} {totalResults === 1 ? 'location' : 'locations'}
        </span>

        <button
          onClick={onRequestLocation}
          disabled={isLocating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            hasUserLocation
              ? 'bg-sky-50 text-sky-700 border-sky-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          title="Sort facilities by proximity to your current location"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
          ) : hasUserLocation ? (
            <Navigation className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{hasUserLocation ? 'Sorted by Distance' : 'Near Me'}</span>
        </button>
      </div>
    </div>
  );
}
