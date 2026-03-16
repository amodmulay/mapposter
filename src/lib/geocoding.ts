export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'MapPoster/1.0',
      },
    });

    if (!response.ok) throw new Error('Geocoding request failed');

    const data = await response.json();
    return data as GeocodingResult[];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}
