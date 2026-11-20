'use client';

import React, { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RecyclingSite } from '@/types/recycling';

interface MapProps {
  sites: RecyclingSite[];
  selectedSite: RecyclingSite | null;
  onSelectSite: (site: RecyclingSite) => void;
  hoveredSiteId: string | null;
  onHoverSite: (id: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
}

// Custom Leaflet DivIcons using Tailwind CSS
function createPinIcon(type: string, isSelected: boolean, isHovered: boolean) {
  let bgColor = 'bg-blue-600';
  let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>`;

  if (type === 'dsny_special_waste') {
    bgColor = 'bg-amber-600';
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
  }

  if (isSelected) {
    bgColor = 'bg-emerald-600 ring-4 ring-emerald-300 scale-125 z-50 shadow-xl';
  } else if (isHovered) {
    bgColor = type === 'dsny_special_waste'
      ? 'bg-amber-500 ring-4 ring-amber-300 scale-125 z-40 shadow-xl'
      : 'bg-blue-500 ring-4 ring-sky-300 scale-125 z-40 shadow-xl';
  }

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} shadow-lg text-white transform transition-all duration-200 hover:scale-125 cursor-pointer">
        ${iconSvg}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    tooltipAnchor: [0, -32],
  });
}

const userLocationIcon = L.divIcon({
  className: 'user-pin',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-600 border-2 border-white shadow"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle smooth zooming and panning when a site is selected or user location changes
function MapController({
  selectedSite,
  userLocation,
}: {
  selectedSite: RecyclingSite | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedSite) {
      map.flyTo([selectedSite.coordinates.lat, selectedSite.coordinates.lng], 14, {
        duration: 1.0,
      });
    }
  }, [selectedSite, map]);

  useEffect(() => {
    if (userLocation && !selectedSite) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        duration: 1.0,
      });
    }
  }, [userLocation, selectedSite, map]);

  return null;
}

export default function RecyclingMap({
  sites,
  selectedSite,
  onSelectSite,
  hoveredSiteId,
  onHoverSite,
  userLocation,
}: MapProps) {
  const defaultCenter = useMemo<[number, number]>(() => [40.7128, -73.98], []);

  return (
    <div className="w-full h-full min-h-[450px] relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Street Map'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          keepBuffer={8}
          updateInterval={100}
        />

        <MapController selectedSite={selectedSite} userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Tooltip direction="top" offset={[0, -12]}>
              <span className="font-semibold text-xs text-sky-800">Your Location</span>
            </Tooltip>
          </Marker>
        )}

        {sites.map((site) => {
          const isSelected = selectedSite?.id === site.id;
          const isHovered = hoveredSiteId === site.id;
          const icon = createPinIcon(site.facilityType, isSelected, isHovered);

          return (
            <Marker
              key={site.id}
              position={[site.coordinates.lat, site.coordinates.lng]}
              icon={icon}
              zIndexOffset={isSelected ? 2000 : isHovered ? 1500 : 0}
              eventHandlers={{
                click: () => onSelectSite(site),
                mouseover: () => onHoverSite(site.id),
                mouseout: () => onHoverSite(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -28]} opacity={0.95}>
                <div className="text-xs font-semibold py-0.5">
                  <span className="text-slate-900">{site.name}</span>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    Click to view details in sidebar
                  </span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 shadow-md z-[500] text-xs space-y-1.5 pointer-events-auto">
        <div className="text-[10px] font-semibold uppercase text-slate-600 tracking-wider">
          Facility Type
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-600 inline-block shadow-sm"></span>
          <span className="text-slate-800 text-[11px]">DSNY Special Waste (Hazardous)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block shadow-sm"></span>
          <span className="text-slate-800 text-[11px]">Electronics & Battery Drop-Off</span>
        </div>
      </div>
    </div>
  );
}
