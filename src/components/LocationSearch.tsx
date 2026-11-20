'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Borough } from '@/types/recycling';
import { MapPin, Navigation, Loader2, X, ChevronDown, Check } from 'lucide-react';
import { NYC_ZIP_MAP, getBoroughFromZip } from '@/utils/zipCodes';

interface LocationSearchProps {
  selectedBorough: Borough | 'All';
  onSelectBorough: (borough: Borough | 'All') => void;
  selectedZip: string | null;
  onSelectZip: (zip: string | null) => void;
  onRequestLocation: () => void;
  isLocating: boolean;
  hasUserLocation: boolean;
  onClearLocation: () => void;
}

const BOROUGHS: (Borough | 'All')[] = [
  'All',
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
];

export default function LocationSearch({
  selectedBorough,
  onSelectBorough,
  selectedZip,
  onSelectZip,
  onRequestLocation,
  isLocating,
  hasUserLocation,
  onClearLocation,
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync display value with current active state
  useEffect(() => {
    if (hasUserLocation) {
      setInputValue('Current Location (GPS)');
    } else if (selectedZip) {
      const info = NYC_ZIP_MAP[selectedZip];
      setInputValue(info ? `${selectedZip} (${info.neighborhood || info.borough})` : selectedZip);
    } else if (selectedBorough !== 'All') {
      setInputValue(selectedBorough);
    } else {
      setInputValue('');
    }
  }, [hasUserLocation, selectedZip, selectedBorough]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter ZIP suggestions if user enters numbers
  const zipSuggestions = useMemo(() => {
    const clean = inputValue.trim().replace(/\D/g, '');
    if (!clean) return [];
    return Object.values(NYC_ZIP_MAP)
      .filter((item) => item.zip.startsWith(clean))
      .slice(0, 5);
  }, [inputValue]);

  const handleSelectBorough = (boro: Borough | 'All') => {
    onSelectZip(null);
    onSelectBorough(boro);
    setIsOpen(false);
  };

  const handleSelectZipItem = (zip: string) => {
    onSelectZip(zip);
    const boro = getBoroughFromZip(zip);
    if (boro) {
      onSelectBorough(boro);
    }
    setIsOpen(false);
  };

  const handleNearMeClick = () => {
    onRequestLocation();
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onClearLocation();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const clean = inputValue.trim().replace(/\D/g, '');
      if (clean.length === 5) {
        handleSelectZipItem(clean);
      } else {
        // Check if matches borough name
        const match = BOROUGHS.find(
          (b) => b.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (match) {
          handleSelectBorough(match);
        }
      }
    }
  };

  const isFiltered = hasUserLocation || selectedZip || selectedBorough !== 'All';

  return (
    <div ref={containerRef} className="relative w-full md:max-w-xs">
      <div className="relative flex items-center">
        {hasUserLocation ? (
          <Navigation className="absolute left-3.5 w-4 h-4 text-sky-600 fill-sky-600 pointer-events-none" />
        ) : (
          <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Borough, ZIP, or Near Me..."
          className="w-full pl-10 pr-9 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder-slate-400 text-sm transition-all"
        />

        {isFiltered ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Clear location filter"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Consolidated Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Action 1: Near Me (GPS) */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <button
              onClick={handleNearMeClick}
              disabled={isLocating}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                hasUserLocation
                  ? 'bg-sky-100/70 text-sky-800 border border-sky-200'
                  : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                ) : (
                  <Navigation
                    className={`w-4 h-4 text-sky-600 ${
                      hasUserLocation ? 'fill-sky-600' : ''
                    }`}
                  />
                )}
                <span>
                  {isLocating
                    ? 'Detecting GPS location...'
                    : 'Find Locations Near Me'}
                </span>
              </div>
              {hasUserLocation && <Check className="w-4 h-4 text-sky-600" />}
            </button>
          </div>

          {/* Action 2: ZIP code autocomplete (if typing numbers) */}
          {zipSuggestions.length > 0 && (
            <div className="p-2 border-b border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                Matching NYC ZIP Codes
              </div>
              {zipSuggestions.map((item) => (
                <button
                  key={item.zip}
                  onClick={() => handleSelectZipItem(item.zip)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors hover:bg-emerald-50 ${
                    selectedZip === item.zip
                      ? 'bg-emerald-50 font-bold text-emerald-900'
                      : 'text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">
                      {item.zip}
                    </span>
                    <span className="text-slate-500">
                      {item.neighborhood || item.borough} ({item.borough})
                    </span>
                  </div>
                  {selectedZip === item.zip && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Action 3: Borough Selection */}
          <div className="p-2 max-h-56 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
              Select Borough
            </div>
            {BOROUGHS.map((boro) => {
              const isSelected =
                !hasUserLocation && !selectedZip && selectedBorough === boro;
              return (
                <button
                  key={boro}
                  onClick={() => handleSelectBorough(boro)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{boro === 'All' ? 'All Boroughs (NYC)' : boro}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
