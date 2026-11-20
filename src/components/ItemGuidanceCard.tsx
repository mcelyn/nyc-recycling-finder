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
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'batteries':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'electronics':
        return <Radio className="w-4 h-4 text-blue-600" />;
      case 'paint':
        return <Paintbrush className="w-4 h-4 text-indigo-600" />;
      case 'automotive':
        return <Car className="w-4 h-4 text-slate-700" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 md:p-6 mb-6 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 flex items-center justify-center">
            {getCategoryIcon(item.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Disposal Guide
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize font-medium">
                {item.category.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
          </div>
        </div>

        <button
          onClick={onClear}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Clear item selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        {item.disposalSummary}
      </p>

      {/* Rules Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border ${
            item.curbsideAllowed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {item.curbsideAllowed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="text-xs">
            <strong className="block font-semibold">Curbside Recycling Bin</strong>
            <span>
              {item.curbsideAllowed
                ? 'Allowed in curbside recycling bin'
                : 'Prohibited in curbside recycling bins'}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border ${
            item.canPutInTrash
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {item.canPutInTrash ? (
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="text-xs">
            <strong className="block font-semibold">Standard Household Trash</strong>
            <span>
              {item.canPutInTrash
                ? 'Permitted in regular trash with precautions'
                : 'Illegal or unsafe to toss in standard trash'}
            </span>
          </div>
        </div>
      </div>

      {/* Step by step */}
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Recommended Action Steps
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {item.stepByStepInstructions.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Handling Tips */}
      {item.handlingTips && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 mb-4">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Special Note: </strong>
            {item.handlingTips}
          </div>
        </div>
      )}

      {/* Filter status banner */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Map & List filtered to{' '}
            <strong className="text-slate-900">{matchingSitesCount} drop-off locations</strong>{' '}
            accepting this item.
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-emerald-700 font-semibold hover:underline"
        >
          Show All Locations
        </button>
      </div>
    </div>
  );
}
