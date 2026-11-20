'use client';

import React, { useState, useEffect } from 'react';
import { RecyclingSite, RecyclingItem } from '@/types/recycling';
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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { getDirectionsUrl } from '@/utils/geo';

interface SiteCardProps {
  site: RecyclingSite;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedItem?: RecyclingItem | null;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function SiteCard({
  site,
  isExpanded,
  onToggleExpand,
  selectedItem,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}: SiteCardProps) {
  const isDsny = site.facilityType === 'dsny_special_waste';
  const [viewMode, setViewMode] = useState<'details' | 'guidance'>('details');

  // Reset to details view if card is collapsed
  useEffect(() => {
    if (!isExpanded) {
      setViewMode('details');
    }
  }, [isExpanded]);

  return (
    <div
      id={`site-card-${site.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
        isExpanded
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : isHovered
          ? 'bg-emerald-50/40 border-emerald-400 shadow-md translate-y-[-1px]'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
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
          {viewMode === 'details' ? (
            /* STEP 1: Facility Details View */
            <>
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

              {/* Action Buttons: Continue & Website/Phone */}
              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setViewMode('guidance')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

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
            </>
          ) : (
            /* STEP 2: Corresponding Guidance Card & Black "Get Directions" Button */
            <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-right-1 duration-150" onClick={(e) => e.stopPropagation()}>
              {/* Back to Site Details button on upper left */}
              <button
                type="button"
                onClick={() => setViewMode('details')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors -ml-1"
                title="Back to special waste site details"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                <span>Back to Site Details</span>
              </button>

              {/* Researched Item Guidance or Facility Preparation Guide */}
              {selectedItem ? (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-3 shadow-2xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Researched Item Disposal Guide
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {selectedItem.name}
                    </h4>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedItem.disposalSummary}
                  </p>

                  {/* Rules summary pills */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {selectedItem.curbsideAllowed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        Curbside: <strong>{selectedItem.curbsideAllowed ? 'Allowed' : 'Prohibited'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {selectedItem.canPutInTrash ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        Trash: <strong>{selectedItem.canPutInTrash ? 'Permitted' : 'Prohibited'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Step by step checklist */}
                  <div>
                    <div className="font-bold text-[11px] text-slate-800 uppercase tracking-wider mb-1.5">
                      Preparation Steps Before Drop-Off:
                    </div>
                    <ul className="space-y-1.5">
                      {selectedItem.stepByStepInstructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 bg-slate-50/70 p-2 rounded-lg">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Handling tips */}
                  {selectedItem.handlingTips && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-900">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{selectedItem.handlingTips}</span>
                    </div>
                  )}

                  {/* DSNY Residency Requirement Warning */}
                  {isDsny && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>NYC Residents Only:</strong> Remember to bring a valid NY State ID or driver license and proof of residency.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback if no item was searched: General drop-off guidance */
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Drop-Off Guidance for this Facility
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {site.name}
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {isDsny
                      ? 'DSNY Special Waste Drop-Off Sites accept hazardous household waste, batteries, motor oil, and electronics. NYC residents only—must present NY driver license and utility bill.'
                      : 'Electronics partners accept consumer electronics, computers, tablets, and phones. Retailers like Best Buy and Staples also accept rechargeable batteries.'}
                  </p>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-700 space-y-1">
                    <div className="font-bold">Destination Address:</div>
                    <div>{site.address}, {site.borough}, NY {site.zipCode}</div>
                    <div className="text-slate-500 font-medium">Hours: {site.hours}</div>
                  </div>
                </div>
              )}

              {/* Black "Get Directions" button */}
              <a
                href={getDirectionsUrl(site.coordinates.lat, site.coordinates.lng, site.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
