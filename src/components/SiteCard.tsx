'use client';

import React from 'react';
import { RecyclingSite } from '@/types/recycling';
import { MapPin, Clock, ExternalLink, Navigation, ShieldAlert } from 'lucide-react';
import { getDirectionsUrl } from '@/utils/geo';

interface SiteCardProps {
  site: RecyclingSite;
  isSelected: boolean;
  onSelect: (site: RecyclingSite) => void;
}

export default function SiteCard({
  site,
  isSelected,
  onSelect,
}: SiteCardProps) {
  const isDsny = site.facilityType === 'dsny_special_waste';

  return (
    <div
      onClick={() => onSelect(site)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
        isSelected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isDsny
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {isDsny ? 'DSNY Special Waste Site' : 'Electronics Drop-off'}
        </span>

        {site.distanceInMiles !== undefined && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
            {site.distanceInMiles} mi
          </span>
        )}
      </div>

      <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
        {site.name}
      </h3>

      <div className="flex items-start gap-1 text-xs text-slate-600 mb-2">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          {site.address}
          {site.neighborhood ? `, ${site.neighborhood}` : ''} ({site.borough})
        </span>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100 space-y-1">
        <div className="flex items-start gap-1">
          <Clock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <span>{site.hours}</span>
        </div>
        {site.requirements && (
          <div className="flex items-start gap-1 text-amber-800">
            <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-medium">{site.requirements}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <a
          href={getDirectionsUrl(site.coordinates.lat, site.coordinates.lng, site.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
        >
          <Navigation className="w-3 h-3" />
          <span>Navigate</span>
        </a>

        {site.website && (
          <a
            href={site.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            title="View Official Webpage"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
