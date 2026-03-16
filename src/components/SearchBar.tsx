'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchAddress, GeocodingResult } from '@/lib/geocoding';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchBarProps {
  onSelect: (result: GeocodingResult) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      const data = await searchAddress(debouncedQuery);
      setResults(data);
      setLoading(false);
      setIsOpen(true);
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH FOR A LOCATION..."
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '0.8rem',
            paddingBottom: '0.8rem',
            backgroundColor: '#ffffff',
            borderRadius: '2px',
            color: '#000000',
            border: '1px solid #eeeeee',
            outline: 'none',
            fontSize: '11px',
            letterSpacing: '0.15em',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}
        />
        <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            marginTop: '1px', 
            width: '100%', 
            backgroundColor: '#ffffff', 
            borderRadius: '0', 
            overflow: 'hidden', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            border: '1px solid #eeeeee'
          }}
        >
          {results.map((res) => (
            <button
              key={res.place_id}
              onClick={() => {
                onSelect(res);
                setQuery(''); // Clear on select or keep? Let's clear search and let labels show it
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.8rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #f9f9f9',
                color: '#4b5563',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#4b5563';
              }}
            >
              {res.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
