'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import sitesData from '@/data/sites.json';
import itemsData from '@/data/items.json';
import { RecyclingSite, RecyclingItem, Borough } from '@/types/recycling';
import ItemSearch from '@/components/ItemSearch';
import ItemGuidanceCard from '@/components/ItemGuidanceCard';
import FilterBar from '@/components/FilterBar';
import SiteCard from '@/components/SiteCard';
import { calculateDistanceInMiles } from '@/utils/geo';
import { Recycle, MapPin, Database, Sparkles, AlertCircle } from 'lucide-react';

// Dynamic import for Leaflet map to disable SSR
const RecyclingMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm animate-pulse border border-slate-200">
      Loading NYC Interactive Map...
    </div>
  ),
});

export default function HomePage() {
  const allSites = sitesData as RecyclingSite[];
  const allItems = itemsData as RecyclingItem[];

  const [selectedItem, setSelectedItem] = useState<RecyclingItem | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<Borough | 'All'>('All');
  const [selectedSite, setSelectedSite] = useState<RecyclingSite | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Request user geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoError('Could not access your location. Please check browser permissions.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filter and sort sites
  const filteredSites = useMemo(() => {
    let result = allSites.map((site) => {
      let distanceInMiles: number | undefined;
      if (userLocation) {
        distanceInMiles = calculateDistanceInMiles(
          userLocation.lat,
          userLocation.lng,
          site.coordinates.lat,
          site.coordinates.lng
        );
      }
      return {
        ...site,
        distanceInMiles,
      };
    });

    // 1. Filter by Selected Item
    if (selectedItem) {
      result = result.filter((site) => {
        // If site accepts this item's waste category
        const matchesCategory = site.acceptedCategories.includes(selectedItem.category);
        // If site type is accepted for this item
        const matchesFacilityType = selectedItem.acceptedFacilityTypes.includes(site.facilityType);
        return matchesCategory || matchesFacilityType;
      });
    }

    // 2. Filter by Borough
    if (selectedBorough !== 'All') {
      result = result.filter(
        (site) => site.borough.toLowerCase() === selectedBorough.toLowerCase()
      );
    }

    // 3. Sort by Distance if user location is available
    if (userLocation) {
      result.sort((a, b) => (a.distanceInMiles ?? 999) - (b.distanceInMiles ?? 999));
    }

    return result;
  }, [allSites, selectedItem, selectedBorough, userLocation]);

  // If a selected site gets filtered out, reset it
  useEffect(() => {
    if (selectedSite && !filteredSites.some((s) => s.id === selectedSite.id)) {
      setSelectedSite(null);
    }
  }, [filteredSites, selectedSite]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Banner / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  NYC Special Waste Finder
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  NYC Open Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Safe disposal for hazardous waste, electronics, batteries & special items
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <ItemSearch
            items={allItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setSelectedSite(null);
            }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Item Guidance Card when an item is selected */}
        {selectedItem && (
          <ItemGuidanceCard
            item={selectedItem}
            onClear={() => setSelectedItem(null)}
            matchingSitesCount={filteredSites.length}
          />
        )}

        {/* Geolocation notification error if any */}
        {geoError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Filter controls */}
        <FilterBar
          selectedBorough={selectedBorough}
          onSelectBorough={setSelectedBorough}
          onRequestLocation={handleRequestLocation}
          isLocating={isLocating}
          hasUserLocation={!!userLocation}
          totalResults={filteredSites.length}
        />

        {/* 2-Column Split: Directory List + Sticky Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Locations Directory */}
          <div className="lg:col-span-5 flex flex-col space-y-3 order-2 lg:order-1">
            {filteredSites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm mb-1">
                  No locations found
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  No drop-off facilities in {selectedBorough} match your current filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedBorough('All');
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredSites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  isSelected={selectedSite?.id === site.id}
                  onSelect={(s) => setSelectedSite(s)}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="lg:col-span-7 sticky top-20 order-1 lg:order-2 h-[450px] lg:h-[calc(100vh-140px)]">
            <RecyclingMap
              sites={filteredSites}
              selectedSite={selectedSite}
              onSelectSite={(s) => setSelectedSite(s)}
              userLocation={userLocation}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>
              Powered by <strong className="text-slate-700">NYC Open Data</strong> & DSNY special waste public datasets
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Always verify requirements before transport</span>
            <span>&bull;</span>
            <a
              href="https://www.nyc.gov/assets/dsny/site/services/harmful-products/special-waste-drop-offs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline font-medium"
            >
              DSNY Official Guidelines
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
