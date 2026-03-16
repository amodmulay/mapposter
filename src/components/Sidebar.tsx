'use client';

import { useState } from 'react';
import { Theme } from '@/lib/mapStyle';
import themes from '@/data/themes.json';
import { Download, Palette, Type, Layout as LayoutIcon, Loader2 } from 'lucide-react';

interface SidebarProps {
  currentTheme: Theme;
  onThemeSelect: (theme: Theme) => void;
  currentLayout: any;
  onLayoutSelect: (layout: any) => void;
  labels: { 
    title: string; 
    subtitle: string; 
    showCoordinates: boolean; 
    showPin: boolean;
    titleColor: string;
    subtitleColor: string;
    coordsColor: string;
    italic: boolean;
    underline: boolean;
    fontFamily: string;
    letterSpacing: number;
  };
  onLabelsChange: (labels: any) => void;
  onExport: (format: 'png' | 'jpeg' | 'pdf' | 'svg') => void;
  currentResolution: string;
  onResolutionChange: (resId: string) => void;
  currentPadding: string;
  onPaddingChange: (padId: string) => void;
  pinColor: string;
  onPinColorChange: (color: string) => void;
  pinIcon: 'pin' | 'heart' | 'home';
  onPinIconChange: (icon: 'pin' | 'heart' | 'home') => void;
}

const PIN_COLORS = [
  { id: '#ef4444', name: 'Red' },
  { id: '#000000', name: 'Black' },
  { id: '#3b82f6', name: 'Blue' },
  { id: '#f59e0b', name: 'Gold' },
  { id: '#10b981', name: 'Green' },
  { id: '#8b5cf6', name: 'Purple' },
];

const FONTS = [
  { id: 'serif', name: 'Classic' },
  { id: 'Anton', name: 'Impact' },
  { id: 'Playfair Display', name: 'Elegant' },
  { id: 'Montserrat', name: 'Modern' },
  { id: 'Oswald', name: 'Condensed' },
  { id: 'Poppins', name: 'Geometric' }
];

const PIN_ICONS = [
  { id: 'pin' as const, label: '📍' },
  { id: 'heart' as const, label: '❤️' },
  { id: 'home' as const, label: '🏠' },
];

const RESOLUTIONS = [
  { id: 'a4', name: 'A4 (Fine Art)', desc: '210 x 297 mm' },
  { id: 'a3', name: 'A3 (Large Print)', desc: '297 x 420 mm' },
  { id: 'square', name: 'Square (Social)', desc: '1:1 Ratio' },
];

const PADDINGS = [
  { id: 'none', name: 'None', desc: 'Edge to edge' },
  { id: 'small', name: 'Small', desc: 'Subtle border' },
  { id: 'medium', name: 'Medium', desc: 'Classic frame' },
  { id: 'large', name: 'Large', desc: 'Gallery style' },
];

export default function Sidebar({
  currentTheme,
  onThemeSelect,
  currentLayout,
  onLayoutSelect,
  labels,
  onLabelsChange,
  onExport,
  currentResolution,
  onResolutionChange,
  currentPadding,
  onPaddingChange,
  pinColor,
  onPinColorChange,
  pinIcon,
  onPinIconChange
}: SidebarProps) {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'pdf' | 'svg'>('png');

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await onExport(exportFormat);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3 mb-6">
        <div 
          style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            backgroundColor: '#000000', 
            borderRadius: '4px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}
        >
           <LayoutIcon className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-black font-bold text-lg tracking-tight">MapPoster</h2>
          <p className="text-slate-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Minimalist Studio</p>
        </div>
      </div>

      {/* Resolution Selector */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <LayoutIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Poster Format</span>
        </div>
        <div className="flex flex-col gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.id}
              onClick={() => onResolutionChange(res.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: currentResolution === res.id ? '#000' : '#e5e7eb',
                backgroundColor: currentResolution === res.id ? '#fcfcfc' : '#fff',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <p className="text-black font-bold" style={{ fontSize: '12px' }}>{res.name}</p>
                <p className="text-slate-400" style={{ fontSize: '10px' }}>{res.desc}</p>
              </div>
              <div 
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  border: '2px solid',
                  borderColor: currentResolution === res.id ? '#000' : '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {currentResolution === res.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#000' }} />}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Padding Selector */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <LayoutIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Padding</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
          {PADDINGS.map((pad) => (
            <button
              key={pad.id}
              onClick={() => onPaddingChange(pad.id)}
              style={{
                padding: '0.5rem 0',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: currentPadding === pad.id ? '#000' : '#e5e7eb',
                backgroundColor: currentPadding === pad.id ? '#000' : '#fff',
                color: currentPadding === pad.id ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {pad.name}
            </button>
          ))}
        </div>
      </section>

      {/* Theme Picker */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Palette className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Themes</span>
        </div>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.5rem' 
          }}
        >
          {themes.map((t: any) => (
            <button
              key={t.id}
              onClick={() => onThemeSelect(t)}
              style={{
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: currentTheme.id === t.id ? '#000000' : '#eeeeee',
                backgroundColor: currentTheme.id === t.id ? '#f9fafb' : '#ffffff',
                textAlign: 'left'
              }}
            >
              <div className="flex gap-1 mb-2">
                <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', border: '1px solid #eee', backgroundColor: t.map.land }} />
                <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', border: '1px solid #eee', backgroundColor: t.map.water }} />
                <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', border: '1px solid #eee', backgroundColor: t.map.roads.major }} />
              </div>
              <span className="text-black" style={{ fontSize: '11px', fontWeight: currentTheme.id === t.id ? '700' : '500' }}>{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Label Editor */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Type className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Labels</span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Main Title</label>
              <div className="flex gap-1">
                {PIN_COLORS.slice(0, 4).map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => onLabelsChange({...labels, titleColor: c.id})}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.id, border: labels.titleColor === c.id ? '2px solid #000' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>
            <input
              type="text"
              value={labels.title}
              onChange={(e) => onLabelsChange({ ...labels, title: e.target.value })}
              className="w-full text-slate-900 border-slate-200 focus:border-black rounded p-1.5 text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Subtitle</label>
              <div className="flex gap-1">
                {PIN_COLORS.slice(0, 4).map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => onLabelsChange({...labels, subtitleColor: c.id})}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.id, border: labels.subtitleColor === c.id ? '2px solid #000' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>
            <input
              type="text"
              value={labels.subtitle}
              onChange={(e) => onLabelsChange({ ...labels, subtitle: e.target.value })}
              className="w-full text-slate-900 border-slate-200 focus:border-black rounded p-1.5 text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={labels.showCoordinates}
                onChange={(e) => onLabelsChange({ ...labels, showCoordinates: e.target.checked })}
                style={{ width: '0.875rem', height: '0.875rem', accentColor: '#000' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Show Coordinates</span>
              {labels.showCoordinates && (
                <div className="flex gap-1 ml-auto">
                  {PIN_COLORS.slice(0, 4).map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => onLabelsChange({...labels, coordsColor: c.id})}
                      style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.id, border: labels.coordsColor === c.id ? '2px solid #000' : '1px solid #ddd' }}
                    />
                  ))}
                </div>
              )}
            </label>
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => onLabelsChange({ ...labels, italic: !labels.italic })}
                style={{
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: labels.italic ? '#000' : '#e5e7eb',
                  backgroundColor: labels.italic ? '#000' : '#fff',
                  color: labels.italic ? '#fff' : '#64748b',
                  fontStyle: 'italic'
                }}
              >
                Italic
              </button>
              <button
                onClick={() => onLabelsChange({ ...labels, underline: !labels.underline })}
                style={{
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: labels.underline ? '#000' : '#e5e7eb',
                  backgroundColor: labels.underline ? '#000' : '#fff',
                  color: labels.underline ? '#fff' : '#64748b',
                  textDecoration: 'underline'
                }}
              >
                Underline
              </button>
              </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Font Selection</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => onLabelsChange({ ...labels, fontFamily: f.id })}
                  style={{
                    padding: '0.4rem',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: labels.fontFamily === f.id ? '#000' : '#e5e7eb',
                    backgroundColor: labels.fontFamily === f.id ? '#f9fafb' : '#fff',
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: f.id === 'serif' ? 'serif' : `var(--font-${f.id.toLowerCase().replace(' ', '-')})`
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex justify-between items-center">
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Letter Spacing</label>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{labels.letterSpacing}px</span>
            </div>
            <input 
              type="range" 
              min="-2" 
              max="10" 
              step="1"
              value={labels.letterSpacing}
              onChange={(e) => onLabelsChange({ ...labels, letterSpacing: parseInt(e.target.value) })}
              className="w-full accent-black h-1 rounded-lg bg-slate-100 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={labels.showPin !== false}
              onChange={(e) => onLabelsChange({ ...labels, showPin: e.target.checked })}
              style={{ width: '0.875rem', height: '0.875rem', accentColor: '#000' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Show Location Pin</span>
          </label>
        </div>
      </section>


      {/* Pin Customization */}
      {labels.showPin !== false && (
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <LayoutIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Pin Style</span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Icon</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {PIN_ICONS.map((ic) => (
                  <button
                    key={ic.id}
                    onClick={() => onPinIconChange(ic.id)}
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.1rem',
                      borderRadius: '6px',
                      border: '2px solid',
                      borderColor: pinIcon === ic.id ? '#000' : '#e5e7eb',
                      backgroundColor: pinIcon === ic.id ? '#f9fafb' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    {ic.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Color</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {PIN_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPinColorChange(c.id)}
                    title={c.name}
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '50%',
                      backgroundColor: c.id,
                      border: '3px solid',
                      borderColor: pinColor === c.id ? '#000' : '#e5e7eb',
                      transition: 'all 0.2s',
                      outline: pinColor === c.id ? '2px solid #000' : 'none',
                      outlineOffset: '2px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Export Section */}
      <div className="mt-auto" style={{ paddingTop: '1.5rem', borderTop: '1px solid #eeeeee' }}>
        <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.75rem', display: 'block' }}>Format</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {(['png', 'jpeg', 'pdf', 'svg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setExportFormat(f)}
              style={{
                padding: '0.5rem 0',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: exportFormat === f ? '#000000' : '#eeeeee',
                backgroundColor: exportFormat === f ? '#000000' : '#ffffff',
                color: exportFormat === f ? '#ffffff' : '#64748b'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <button 
          onClick={handleExportClick}
          disabled={exporting}
          style={{
            width: '100%',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '1.1rem 0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            opacity: exporting ? 0.5 : 1,
            pointerEvents: exporting ? 'none' : 'auto',
            textTransform: 'uppercase',
            fontSize: '12px',
            letterSpacing: '0.1em'
          }}
        >
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-4 h-4" />}
          Get Poster
        </button>
      </div>
    </div>
  );
}
