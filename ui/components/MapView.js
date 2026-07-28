import React, { useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapStateContext } from '../state/MapState';
import { addToken, removeToken, toggleFog } from '../../utils/mapUtils';

export const MapView = () => {
  const mapRef = useRef(null);
  const { map, setMap, tiles, tokens, fog } = useContext(MapStateContext);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const mapInstance = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false,
      }).setView([0, 0], 0);

      // Add base tile layer (placeholder white background)
      const tileSize = 256;
      const bounds = [[0, 0], [tileSize, tileSize]];
      L.rectangle(bounds, { color: '#222', weight: 0, fillOpacity: 0 }).addTo(mapInstance);

      // Render grid overlay (5ft square = 1 unit)
      const gridLayer = L.gridLayer({
        tileSize: 64,
        opacity: 0.4,
        className: 'map-grid',
        pane: 'overlayPane',
        updateWhenZooming: true,
        updateWhenIdle: true,
        getTileUrl: (coords) => {
          // Empty transparent tile – grid is drawn via CSS background
          return '';
        },
      });
      gridLayer.addTo(mapInstance);

      // Apply fog of war overlay if enabled
      if (fog) {
        const fogLayer = L.rectangle([[ -1000, -1000 ], [ 1000, 1000 ]], {
          color: '#000',
          weight: 0,
          fillOpacity: 0.6,
          className: 'fog-of-war',
        }).addTo(mapInstance);
        // Store reference for later toggling
        mapInstance.fogLayer = fogLayer;
      }

      // Add token markers from state
      tokens.forEach(tok => {
        const marker = L.marker([tok.y, tok.x], { draggable: true })
          .addTo(mapInstance)
          .on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            // Update token position in state
            // (Implementation in mapUtils)
            // Not required for demo
          });
        tok.marker = marker;
      });

      mapRef.current = mapInstance;
      setMap(mapInstance);
    }
  }, []);

  // Effect to update fog visibility
  useEffect(() => {
    if (map && map.fogLayer) {
      map.fogLayer.setStyle({ fillOpacity: fog ? 0.6 : 0 });
    }
  }, [fog, map]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
};
