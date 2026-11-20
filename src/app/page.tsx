'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import sitesData from '@/data/sites.json';
import itemsData from '@/data/items.json';
import { RecyclingSite, RecyclingItem, Borough } from '@/types/recycling';
import ItemSearch from '@/components/ItemSearch';
import LocationSearch from '@/components/LocationSearch';
import ItemGuidanceCard from '@/components/ItemGuidanceCard';
import SiteCard from '@/components/SiteCard';
import ResultsSummaryCard from '@/components/ResultsSummaryCard';
import { calculateDistanceInMiles } from '@/utils/geo';
import { NYC_ZIP_MAP, getBoroughFromZip } from '@/utils/zipCodes';
import { Recycle, MapPin, Database, AlertCircle, RotateCcw } from 'lucide-react';

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
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
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
    setSelectedZip(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSelectedBorough('All');
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

  const handleClearLocation = () => {
    setUserLocation(null);
    setSelectedZip(null);
    setSelectedBorough('All');
    setGeoError(null);
  };

  const handleResetAll = () => {
    setSelectedItem(null);
    setSelectedSite(null);
    handleClearLocation();
  };

  const handleSelectSite = (site: RecyclingSite) => {
    setSelectedSite(site);
    setTimeout(() => {
      const el = document.getElementById(`site-card-${site.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleToggleExpand = (site: RecyclingSite) => {
    if (selectedSite?.id === site.id) {
      setSelectedSite(null);
    } else {
      handleSelectSite(site);
    }
  };

  // Determine reference coordinate for proximity sorting (user GPS or selected ZIP code centroid)
  const referencePoint = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedZip && NYC_ZIP_MAP[selectedZip]) {
      return {
        lat: NYC_ZIP_MAP[selectedZip].lat,
        lng: NYC_ZIP_MAP[selectedZip].lng,
      };
    }
    return null;
  }, [userLocation, selectedZip]);

  // Filter and sort sites
  const filteredSites = useMemo(() => {
    let result = allSites.map((site) => {
      let distanceInMiles: number | undefined;
      if (referencePoint) {
        distanceInMiles = calculateDistanceInMiles(
          referencePoint.lat,
          referencePoint.lng,
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
        const matchesCategory = site.acceptedCategories.includes(selectedItem.category);
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

    // 3. Sort by Distance if a reference point (GPS or ZIP) is available
    if (referencePoint) {
      result.sort((a, b) => (a.distanceInMiles ?? 999) - (b.distanceInMiles ?? 999));
    }

    return result;
  }, [allSites, selectedItem, selectedBorough, referencePoint]);

  const dsnyCount = useMemo(
    () => filteredSites.filter((s) => s.facilityType === 'dsny_special_waste').length,
    [filteredSites]
  );

  const electronicsCount = useMemo(
    () => filteredSites.filter((s) => s.facilityType !== 'dsny_special_waste').length,
    [filteredSites]
  );

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
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
                Safe disposal for electronics, hazardous waste, batteries & special items
              </p>
            </div>
          </div>

          {/* Consolidated Search Controls (Item Search + Location Input side-by-side) */}
          <div className="w-full lg:max-w-3xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex-1 w-full">
              <ItemSearch
                items={allItems}
                selectedItem={selectedItem}
                onSelectItem={(item) => {
                  setSelectedItem(item);
                  setSelectedSite(null);
                }}
              />
            </div>
            <div className="w-full sm:w-72 shrink-0">
              <LocationSearch
                selectedBorough={selectedBorough}
                onSelectBorough={(boro) => {
                  setSelectedBorough(boro);
                  setUserLocation(null);
                }}
                selectedZip={selectedZip}
                onSelectZip={(zip) => {
                  setSelectedZip(zip);
                  setUserLocation(null);
                }}
                onRequestLocation={handleRequestLocation}
                isLocating={isLocating}
                hasUserLocation={!!userLocation}
                onClearLocation={handleClearLocation}
              />
            </div>
          </div>
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

        {/* Status Bar above Map / Directory */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-4 px-1">
          <div>
            Showing <strong className="text-slate-900">{filteredSites.length}</strong>{' '}
            {filteredSites.length === 1 ? 'drop-off location' : 'drop-off locations'}
            {userLocation ? (
              <span className="text-sky-700 font-semibold ml-1">
                (sorted by distance to your current location)
              </span>
            ) : selectedZip ? (
              <span className="text-slate-800 font-semibold ml-1">
                (near ZIP {selectedZip}
                {NYC_ZIP_MAP[selectedZip]?.neighborhood
                  ? ` - ${NYC_ZIP_MAP[selectedZip].neighborhood}`
                  : ''}
                )
              </span>
            ) : selectedBorough !== 'All' ? (
              <span className="text-slate-800 font-semibold ml-1">
                in {selectedBorough}
              </span>
            ) : (
              <span> across all 5 NYC boroughs</span>
            )}
          </div>

          {(selectedBorough !== 'All' || selectedZip || userLocation || selectedItem) && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* 2-Column Split: Directory List + Sticky Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Locations Directory */}
          <div className="lg:col-span-5 flex flex-col space-y-3 order-2 lg:order-1">
            {/* Small facility type results summary card */}
            <ResultsSummaryCard
              totalCount={filteredSites.length}
              dsnyCount={dsnyCount}
              electronicsCount={electronicsCount}
              selectedItem={selectedItem}
              selectedBorough={selectedBorough}
              selectedZip={selectedZip}
              hasUserLocation={!!userLocation}
            />

            {filteredSites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm mb-1">
                  No locations found
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  No drop-off facilities match your current item and location filter.
                </p>
                <button
                  onClick={handleResetAll}
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
                  isExpanded={selectedSite?.id === site.id}
                  onToggleExpand={() => handleToggleExpand(site)}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="lg:col-span-7 sticky top-24 order-1 lg:order-2 h-[450px] lg:h-[calc(100vh-140px)]">
            <RecyclingMap
              sites={filteredSites}
              selectedSite={selectedSite}
              onSelectSite={(s) => handleSelectSite(s)}
              userLocation={referencePoint}
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
