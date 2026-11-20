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
import { calculateDistanceInMiles, getDirectionsUrl } from '@/utils/geo';
import { NYC_ZIP_MAP, getBoroughFromZip } from '@/utils/zipCodes';
import { Recycle, MapPin, Database, AlertCircle, RotateCcw, Sparkles, List, Map, Navigation } from 'lucide-react';

const POPULAR_ITEMS = [
  { id: 'nail-polish', label: 'Nail Polish', icon: '💅' },
  { id: 'lithium-batteries', label: 'Lithium Batteries', icon: '⚡' },
  { id: 'computers-laptops', label: 'Old Laptops', icon: '💻' },
  { id: 'oil-paint', label: 'Paint & Thinner', icon: '🎨' },
  { id: 'motor-oil', label: 'Motor Oil', icon: '🚗' },
  { id: 'televisions', label: 'TVs & Screens', icon: '📺' },
  { id: 'fluorescent-bulbs', label: 'Fluorescent Bulbs', icon: '💡' },
];

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
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
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

  const handleChipClick = (itemId: string) => {
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    } else {
      const match = allItems.find((i) => i.id === itemId);
      if (match) {
        setSelectedItem(match);
        setSelectedSite(null);
      }
    }
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
          {/* Logo & Title as Hyperlink */}
          <a
            href="/"
            className="flex items-center gap-3 w-full lg:w-auto shrink-0 group focus:outline-none cursor-pointer select-none"
            title="Refresh NYC Special Waste Finder"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0 transition-colors">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 tracking-tight transition-colors">
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
          </a>

          {/* Unified Search Pill Container */}
          <div className="w-full lg:max-w-3xl bg-white border border-slate-300 rounded-2xl shadow-xs hover:border-slate-400 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-200 transition-all">
            <div className="flex-1 w-full min-w-0">
              <ItemSearch
                embedded
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
                embedded
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

      {/* Quick Item Discovery Chips */}
      <div className="bg-white/90 border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Popular Items:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {POPULAR_ITEMS.map((chip) => {
              const isActive = selectedItem?.id === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all text-xs whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
        <div
          id="results-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16 lg:pb-0 scroll-mt-24"
        >
          {/* Left Column: Locations Directory */}
          <div
            className={`lg:col-span-5 flex-col space-y-3 order-2 lg:order-1 ${
              mobileView === 'list' ? 'flex' : 'hidden lg:flex'
            }`}
          >
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
                  selectedItem={selectedItem}
                  isHovered={hoveredSiteId === site.id}
                  onMouseEnter={() => setHoveredSiteId(site.id)}
                  onMouseLeave={() => setHoveredSiteId(null)}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div
            className={`lg:col-span-7 sticky top-24 order-1 lg:order-2 ${
              mobileView === 'map'
                ? 'block h-[calc(100vh-220px)] min-h-[460px]'
                : 'hidden lg:block lg:h-[calc(100vh-140px)]'
            }`}
          >
            <RecyclingMap
              sites={filteredSites}
              selectedSite={selectedSite}
              onSelectSite={(s) => handleSelectSite(s)}
              hoveredSiteId={hoveredSiteId}
              onHoverSite={setHoveredSiteId}
              userLocation={referencePoint}
            />

            {/* Mobile Floating Site Preview (when a pin is tapped in Map view) */}
            {mobileView === 'map' && selectedSite && (
              <div className="lg:hidden absolute bottom-4 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3.5 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      selectedSite.facilityType === 'dsny_special_waste'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedSite.facilityType === 'dsny_special_waste'
                      ? 'DSNY Special Waste'
                      : 'Electronics Drop-off'}
                  </span>
                  {selectedSite.distanceInMiles !== undefined && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {selectedSite.distanceInMiles} mi
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug truncate">
                  {selectedSite.name}
                </h4>
                <p className="text-xs text-slate-500 mb-2 truncate">
                  {selectedSite.address} ({selectedSite.borough})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMobileView('list');
                      setTimeout(() => {
                        const el = document.getElementById(`site-card-${selectedSite.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors"
                  >
                    View Details
                  </button>
                  <a
                    href={getDirectionsUrl(
                      selectedSite.coordinates.lat,
                      selectedSite.coordinates.lng,
                      selectedSite.address
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Mobile View Switcher (List vs Map) */}
        <div className="lg:hidden fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-slate-700/60 flex items-center gap-1">
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                mobileView === 'list'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List ({filteredSites.length})</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                mobileView === 'map'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
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
