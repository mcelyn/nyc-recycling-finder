'use client';

import React from 'react';
import { RecyclingSite } from '@/types/recycling';
import {
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Phone,
  Layers,
} from 'lucide-react';
import { getDirectionsUrl } from '@/utils/geo';

interface SiteCardProps {
  site: RecyclingSite;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function SiteCard({
  site,
  isExpanded,
  onToggleExpand,
}: SiteCardProps) {
  const isDsny = site.facilityType === 'dsny_special_waste';

  return (
    <div
      id={`site-card-${site.id}`}
      className={`rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
        isExpanded
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Clickable Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full p-4 text-left focus:outline-none transition-colors"
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

          <div className="flex items-center gap-1.5">
            {site.distanceInMiles !== undefined && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {site.distanceInMiles} mi
              </span>
            )}
            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-50">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
          {site.name}
        </h3>

        <div className="flex items-start gap-1 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {site.address}
            {site.neighborhood ? `, ${site.neighborhood}` : ''} ({site.borough})
          </span>
        </div>

        {!isExpanded && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{site.hours}</span>
          </div>
        )}
      </button>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-150">
          {/* Operating Hours */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-start gap-1.5 font-medium text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>Operating Hours:</span>
            </div>
            <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
              {site.hours}
            </p>
          </div>

          {/* Special Requirements */}
          {site.requirements && (
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-start gap-1.5 font-bold text-amber-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Requirements & Eligibility:</span>
              </div>
              <p className="pl-5 text-[11px] leading-relaxed text-amber-800">
                {site.requirements}
              </p>
            </div>
          )}

          {/* Accepted Materials List */}
          {site.acceptedItemsText && site.acceptedItemsText.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accepted Materials at this Location:</span>
              </div>
              <ul className="grid grid-cols-1 gap-1 pl-1">
                {site.acceptedItemsText.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons: Navigate & Official Webpage */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={getDirectionsUrl(site.coordinates.lat, site.coordinates.lng, site.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>

            {site.website && (
              <a
                href={site.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                title="View Official Webpage"
              >
                <span>DSNY Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                title={`Call ${site.phone}`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
