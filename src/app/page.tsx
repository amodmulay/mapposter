'use client';

import { useState, useRef, useEffect } from 'react';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import themesData from '@/data/themes.json';
import layoutsData from '@/data/layouts.json';
import { Theme } from '@/lib/mapStyle';
import { GeocodingResult } from '@/lib/geocoding';
import { exportPoster } from '@/lib/export/canvas';
import maplibregl from 'maplibre-gl';

export default function Home() {
  const [theme, setTheme] = useState<Theme>(themesData[0] as Theme);
  const [layout, setLayout] = useState(layoutsData[0]);
  const [center, setCenter] = useState<[number, number]>([13.4050, 52.5200]);
  const [zoom, setZoom] = useState(13);
  const [labels, setLabels] = useState({
    title: 'BERLIN',
    subtitle: 'GERMANY',
    showCoordinates: true,
    showPin: true,
    titleColor: '#0f172a',
    subtitleColor: '#64748b',
    coordsColor: '#94a3b8',
    italic: false,
    underline: false,
    fontFamily: 'serif',
    letterSpacing: 2,
    titleSize: 48,
    subtitleSize: 20
  });
  const [resolution, setResolution] = useState('a4');
  const [padding, setPadding] = useState('default');
  const [pinColor, setPinColor] = useState('#ef4444');
  const [pinIcon, setPinIcon] = useState<'pin' | 'heart' | 'home'>('pin');

  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const resolutionDimensions: Record<string, { width: number, height: number, ratio: string }> = {
    'a4': { width: 2480, height: 3508, ratio: '1 / 1.414' },
    'a3': { width: 3508, height: 4960, ratio: '1 / 1.414' },
    'square': { width: 3000, height: 3000, ratio: '1 / 1' },
  };

  // Scaling logic for WYSIWYG preview
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const dims = resolutionDimensions[resolution];
      
      const margin = 64; // px
      const availableW = width - margin;
      const availableH = height - margin;
      
      const scaleX = availableW / dims.width;
      const scaleY = availableH / dims.height;
      const newScale = Math.min(scaleX, scaleY);
      
      setPreviewScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [resolution]);

  // Padding as percentage of the shorter dimension
  const paddingValues: Record<string, number> = {
    'none': 0,
    'small': 0.03,
    'medium': 0.06,
    'large': 0.10,
  };

  const handleLocationSelect = (result: GeocodingResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setCenter([lon, lat]);
    setZoom(15);
    
    const parts = result.display_name.split(',');
    setLabels({
      ...labels,
      title: parts[0].toUpperCase(),
      subtitle: (parts[parts.length - 1] || '').trim().toUpperCase()
    });
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (!mapRef.current) return;
    
    const dims = resolutionDimensions[resolution];
    
    let padPx = 0;
    if (padding === 'default') {
       padPx = parseInt(layout.styles.padding.replace('px', '')) * (dims.width / 2400);
    } else {
       padPx = Math.round(dims.width * paddingValues[padding]);
    }

    try {
      await exportPoster(mapRef.current, {
        format,
        title: labels.title,
        subtitle: labels.subtitle,
        center,
        theme,
        layout,
        width: dims.width,
        height: dims.height,
        showPin: labels.showPin,
        padding: padPx,
        pinColor,
        pinIcon,
        titleColor: labels.titleColor,
        subtitleColor: labels.subtitleColor,
        coordsColor: labels.coordsColor,
        italic: labels.italic,
        underline: labels.underline,
        fontFamily: labels.fontFamily,
        letterSpacing: labels.letterSpacing,
        titleSize: labels.titleSize,
        subtitleSize: labels.subtitleSize
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Sorry, there was an error generating your poster.');
    }
  };

  const dims = resolutionDimensions[resolution];
  const exportScale = dims.width / 2400;
  
  let previewPadPx = '0px';
  if (padding === 'default') {
     previewPadPx = `${parseInt(layout.styles.padding.replace('px', '')) * exportScale}px`;
  } else {
     previewPadPx = `${dims.width * paddingValues[padding]}px`;
  }
  
  const borderWidthPx = parseInt(layout.styles.borderWidth.replace('px', '')) * exportScale;

  const textStyle: React.CSSProperties = {
    fontStyle: labels.italic ? 'italic' : 'normal',
    textDecoration: labels.underline ? 'underline' : 'none',
    letterSpacing: `${labels.letterSpacing * exportScale}px`,
    fontFamily: labels.fontFamily === 'serif' ? 'serif' : `var(--font-${labels.fontFamily.toLowerCase().replace(' ', '-')})`
  };

  return (
    <main className="app-container">
      <aside className="sidebar">
        <Sidebar 
          currentTheme={theme}
          onThemeSelect={setTheme}
          currentLayout={layout}
          onLayoutSelect={setLayout}
          labels={labels}
          onLabelsChange={setLabels}
          onExport={handleExport}
          currentResolution={resolution}
          onResolutionChange={setResolution}
          currentPadding={padding}
          onPaddingChange={setPadding}
          pinColor={pinColor}
          onPinColorChange={setPinColor}
          pinIcon={pinIcon}
          onPinIconChange={setPinIcon}
        />
      </aside>

      <section ref={containerRef} className="main-content">
        <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '100%', maxWidth: '30rem', padding: '0 1rem', display: 'flex', justifyContent: 'center' }}>
          <SearchBar onSelect={handleLocationSelect} />
        </div>

        <div 
          style={{ 
            width: `${dims.width * previewScale}px`, 
            height: `${dims.height * previewScale}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'visible'
          }}
        >
          <div 
            className="poster-wrapper" 
            style={{ 
              width: `${dims.width}px`,
              height: `${dims.height}px`,
              padding: previewPadPx,
              display: 'flex',
              flexDirection: 'column',
              transform: `scale(${previewScale})`,
              transformOrigin: 'center center',
              flexShrink: 0,
              maxWidth: 'none',
              animation: 'none', // Disable zoom animation to prevent flickering with scaling logic
              border: borderWidthPx > 0 ? `${borderWidthPx}px solid ${labels.titleColor}` : 'none',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <div className="map-viewport" style={{ flex: layout.styles.labelPosition === 'overlay' ? 1 : 3, marginBottom: 0, position: 'relative' }}>
               <Map 
                 center={center} 
                 zoom={zoom} 
                 theme={theme} 
                 showPin={labels.showPin} 
                 pinColor={pinColor} 
                 pinIcon={pinIcon} 
                 onMapLoad={(m) => mapRef.current = m} 
                 onCameraChange={(c, z) => {
                   setCenter(c);
                   setZoom(z);
                 }}
               />
               
               {layout.styles.labelPosition === 'overlay' && (
                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent pt-32 pb-12 flex flex-col items-center justify-end" style={{ zIndex: 10, pointerEvents: 'none' }}>
                    <h1 style={{ fontSize: `${labels.titleSize * exportScale}px`, fontWeight: 'bold', marginBottom: `${10 * exportScale}px`, color: '#ffffff', ...textStyle, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{labels.title}</h1>
                    <p style={{ fontSize: `${labels.subtitleSize * exportScale}px`, color: '#f8fafc', marginBottom: `${10 * exportScale}px`, ...textStyle, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{labels.subtitle}</p>
                    {labels.showCoordinates && (
                      <p style={{ fontSize: `${12 * exportScale}px`, fontFamily: 'monospace', color: '#e2e8f0', ...textStyle, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {center[1].toFixed(4)}° N / {center[0].toFixed(4)}° E
                      </p>
                    )}
                 </div>
               )}
            </div>
            
            {layout.styles.labelPosition === 'bottom' && (
              <div className="text-center" style={{ fontFamily: 'serif', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ fontSize: `${labels.titleSize * exportScale}px`, fontWeight: 'bold', marginBottom: `${10 * exportScale}px`, color: labels.titleColor, ...textStyle, transform: `translateY(${-labels.titleSize * 0.9 * exportScale}px)` }}>{labels.title}</h1>
                <p style={{ fontSize: `${labels.subtitleSize * exportScale}px`, color: labels.subtitleColor, marginBottom: `${10 * exportScale}px`, ...textStyle, transform: `translateY(${15 * exportScale}px)` }}>{labels.subtitle}</p>
                {labels.showCoordinates && (
                  <p style={{ fontSize: `${12 * exportScale}px`, fontFamily: 'monospace', color: labels.coordsColor, ...textStyle, transform: `translateY(${60 * exportScale}px)` }}>
                    {center[1].toFixed(4)}° N / {center[0].toFixed(4)}° E
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
