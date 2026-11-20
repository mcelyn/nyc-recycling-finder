'use client';

import React, { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RecyclingSite } from '@/types/recycling';
import { ExternalLink, Clock, ShieldAlert, MapPin } from 'lucide-react';
import { getDirectionsUrl } from '@/utils/geo';

interface MapProps {
  sites: RecyclingSite[];
  selectedSite: RecyclingSite | null;
  onSelectSite: (site: RecyclingSite) => void;
  userLocation: { lat: number; lng: number } | null;
}

// Custom Leaflet DivIcons using Tailwind CSS
function createPinIcon(type: string, isSelected: boolean) {
  let bgColor = 'bg-blue-600';
  let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>`;

  if (type === 'dsny_special_waste') {
    bgColor = 'bg-amber-600';
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
  }

  if (isSelected) {
    bgColor = 'bg-emerald-600 ring-4 ring-emerald-300';
  }

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} shadow-lg text-white transform transition-transform duration-200 hover:scale-110">
        ${iconSvg}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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
        duration: 1.2,
      });
    }
  }, [selectedSite, map]);

  useEffect(() => {
    if (userLocation && !selectedSite) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        duration: 1.2,
      });
    }
  }, [userLocation, selectedSite, map]);

  return null;
}

export default function RecyclingMap({
  sites,
  selectedSite,
  onSelectSite,
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapController selectedSite={selectedSite} userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="font-semibold text-xs text-sky-800">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {sites.map((site) => {
          const isSelected = selectedSite?.id === site.id;
          const icon = createPinIcon(site.facilityType, isSelected);

          return (
            <Marker
              key={site.id}
              position={[site.coordinates.lat, site.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSite(site),
              }}
            >
              <Popup className="recycling-popup">
                <div className="p-1 max-w-[260px] text-slate-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${
                        site.facilityType === 'dsny_special_waste'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {site.facilityType === 'dsny_special_waste'
                        ? 'DSNY Special Waste'
                        : 'Electronics Partner'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {site.borough}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                    {site.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>
                      {site.address}
                      {site.neighborhood ? `, ${site.neighborhood}` : ''}
                      {site.distanceInMiles !== undefined && (
                        <strong className="block text-emerald-700 font-semibold mt-0.5">
                          {site.distanceInMiles} miles away
                        </strong>
                      )}
                    </span>
                  </p>

                  <div className="text-[11px] text-slate-500 mb-2 space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="flex items-start gap-1">
                      <Clock className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                      <span>{site.hours}</span>
                    </div>
                    {site.requirements && (
                      <div className="flex items-start gap-1 text-amber-700 font-medium">
                        <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                        <span>{site.requirements}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={getDirectionsUrl(site.coordinates.lat, site.coordinates.lng, site.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Popup>
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
