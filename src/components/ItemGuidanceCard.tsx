'use client';

import React from 'react';
import { RecyclingItem } from '@/types/recycling';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  X,
  MapPin,
  Flame,
  Zap,
  Radio,
  Paintbrush,
  Car,
  ShieldAlert,
  ArrowDown,
} from 'lucide-react';

interface ItemGuidanceCardProps {
  item: RecyclingItem;
  onClear: () => void;
  matchingSitesCount: number;
}

export default function ItemGuidanceCard({
  item,
  onClear,
  matchingSitesCount,
}: ItemGuidanceCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hazardous':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'batteries':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'electronics':
        return <Radio className="w-5 h-5 text-blue-600" />;
      case 'paint':
        return <Paintbrush className="w-5 h-5 text-indigo-600" />;
      case 'automotive':
        return <Car className="w-5 h-5 text-slate-700" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const isDsnySpecialWaste = item.acceptedFacilityTypes.includes('dsny_special_waste');

  const scrollToResults = () => {
    const el = document.getElementById('results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-emerald-200/90 shadow-sm p-5 md:p-7 mb-6 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header with Title, Category & Close Button */}
      <div className="flex items-start justify-between gap-4 mb-3.5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
            {getCategoryIcon(item.category)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Official Disposal Guide
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold capitalize">
                {item.category.replace('_', ' ')}
              </span>
              {!item.curbsideAllowed && !item.canPutInTrash && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  Special Drop-Off Required
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {item.name}
            </h2>
          </div>
        </div>

        <button
          onClick={onClear}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          title="Clear item selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Box */}
      <div className="text-xs md:text-sm text-slate-700 mb-5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
        {item.disposalSummary}
      </div>

      {/* Primary Rules Verdict Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Curbside Bin Rule */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
            item.curbsideAllowed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          {item.curbsideAllowed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <strong className="block font-bold text-sm mb-0.5">
              Curbside Recycling Bin
            </strong>
            <span className="leading-snug opacity-90">
              {item.curbsideAllowed
                ? 'Allowed in standard curbside blue/green recycling bins.'
                : 'Prohibited in regular curbside recycling bins.'}
            </span>
          </div>
        </div>

        {/* Standard Household Trash Rule */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
            item.canPutInTrash
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          {item.canPutInTrash ? (
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <strong className="block font-bold text-sm mb-0.5">
              Standard Household Trash
            </strong>
            <span className="leading-snug opacity-90">
              {item.canPutInTrash
                ? 'Permitted in regular black bag trash with listed precautions.'
                : 'Illegal or unsafe to discard in standard trash.'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Steps Section */}
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
          Step-by-Step Disposal Instructions
        </h3>
        <div className="space-y-2">
          {item.stepByStepInstructions.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800"
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px] shadow-2xs">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DSNY Residency & ID Callout if hazardous/special waste */}
      {isDsnySpecialWaste && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 mb-4">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">DSNY Site Eligibility: </strong>
            NYC residents only (non-commercial). Please remember to bring a valid NY State ID or driver license and proof of residency (e.g. utility bill).
          </div>
        </div>
      )}

      {/* Handling Tips */}
      {item.handlingTips && (
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 mb-5">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Pro Tip: </strong>
            {item.handlingTips}
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Map and list filtered to{' '}
            <strong className="text-slate-900 font-bold">
              {matchingSitesCount} authorized {matchingSitesCount === 1 ? 'location' : 'locations'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollToResults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
          >
            <span>View Locations ({matchingSitesCount})</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          >
            Clear Item
          </button>
        </div>
      </div>
    </div>
  );
}
