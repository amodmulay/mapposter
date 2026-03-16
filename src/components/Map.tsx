'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Theme, buildMapStyle } from '@/lib/mapStyle';

interface MapProps {
  center: [number, number];
  zoom: number;
  theme: Theme;
  showPin?: boolean;
  pinColor?: string;
  pinIcon?: 'pin' | 'heart' | 'home';
  onMapLoad?: (map: maplibregl.Map) => void;
  onCameraChange?: (center: [number, number], zoom: number) => void;
}

function createMarkerElement(icon: string, color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.cursor = 'pointer';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';

  if (icon === 'heart') {
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;
  } else if (icon === 'home') {
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22" fill="white" stroke="white"/>
    </svg>`;
  } else {
    // Default pin (map-pin style)
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3" fill="white" stroke="white"/>
    </svg>`;
  }

  return el;
}

export default function Map({ center, zoom, theme, showPin = true, pinColor = '#ef4444', pinIcon = 'pin', onMapLoad, onCameraChange }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: buildMapStyle(theme),
      center: center,
      zoom: zoom,
      attributionControl: false,
      // Use pixelRatio 1 for consistent WYSIWYG across different devices
      pixelRatio: 1,
      // @ts-ignore
      preserveDrawingBuffer: true
    });

    map.current.on('load', () => {
      onMapLoad?.(map.current!);
      
      if (showPin) {
        const el = createMarkerElement(pinIcon, pinColor);
        markerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(center)
          .addTo(map.current!);
      }
    });

    const handleCameraChange = () => {
      if (!map.current) return;
      const c = map.current.getCenter();
      onCameraChange?.([c.lng, c.lat], map.current.getZoom());
    };

    map.current.on('moveend', handleCameraChange);
    map.current.on('zoomend', handleCameraChange);

    // Watch for container resizing (e.g. resolution change)
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    
    // Only jump if there's a significant difference to avoid infinite loops if onCameraChange is called
    if (Math.abs(currentCenter.lng - center[0]) > 0.00001 || 
        Math.abs(currentCenter.lat - center[1]) > 0.00001 ||
        Math.abs(currentZoom - zoom) > 0.01) {
      map.current.jumpTo({ center: center, zoom: zoom });
    }
    
    if (markerRef.current) {
      markerRef.current.setLngLat(center);
    }
  }, [center, zoom]);

  // Re-create marker when showPin, pinColor, or pinIcon changes
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Create new marker if showPin is true
    if (showPin) {
      const el = createMarkerElement(pinIcon, pinColor);
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(center)
        .addTo(map.current!);
    }
  }, [showPin, pinColor, pinIcon]);

  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(buildMapStyle(theme));
  }, [theme]);

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        borderRadius: '2px', 
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '1rem', 
          right: '1rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(4px)', 
          padding: '0.2rem 0.4rem', 
          borderRadius: '2px', 
          fontSize: '9px', 
          color: '#666' 
        }}
      >
        © OpenFreeMap © OpenStreetMap
      </div>
    </div>
  );
}
