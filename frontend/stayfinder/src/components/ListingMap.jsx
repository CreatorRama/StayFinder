// components/ListingMap.js
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from 'react-router-dom';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function ListingMap() {
  const location = useLocation();
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [location.state.coordinates[0], location.state.coordinates[1]],
      zoom: 12,
    });

    new mapboxgl.Marker()
      .setLngLat([location.state.coordinates[0], location.state.coordinates[1]])
      .addTo(map.current);

    // Resize map to fit container when the window is resized
    const handleResize = () => {
      if (map.current) map.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.state.coordinates]);

  return (
    <div
      ref={mapContainer}
      className="w-screen h-[calc(100vh-64px)]" // Full viewport width & height (adjust 64px if you have a navbar)
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
      }}
    />
  );
}