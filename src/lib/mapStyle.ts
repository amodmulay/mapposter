import { MapOptions } from 'maplibre-gl';

export interface Theme {
  id: string;
  name: string;
  map: {
    land: string;
    water: string;
    waterway: string;
    parks: string;
    buildings: string;
    roads: {
      major: string;
      minor: string;
      path: string;
    }
  };
  ui: {
    background: string;
    text: string;
    accent: string;
  };
}

export const buildMapStyle = (theme: Theme) => {
  // Using OpenFreeMap's base URL for vector tiles
  const style: any = {
    "version": 8,
    "sources": {
      "openmaptiles": {
        "type": "vector",
        "url": "https://tiles.openfreemap.org/planet"
      }
    },
    "layers": [
      {
        "id": "background",
        "type": "background",
        "paint": { "background-color": theme.map.land }
      },
      {
        "id": "water",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "water",
        "paint": { "fill-color": theme.map.water }
      },
      {
        "id": "park",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "park",
        "paint": { "fill-color": theme.map.parks }
      },
      {
        "id": "building",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "building",
        "paint": { "fill-color": theme.map.buildings }
      },
      {
        "id": "roads-minor",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "minor", "service", "track"]],
        "paint": {
          "line-color": theme.map.roads.minor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.5, 16, 2]
        }
      },
      {
        "id": "roads-major",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "primary", "secondary", "tertiary"]],
        "paint": {
          "line-color": theme.map.roads.major,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 4]
        }
      }
    ]
  };
  return style;
};
