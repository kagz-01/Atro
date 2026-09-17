"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LeafletMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
  markerTitle?: string;
};

export function LeafletMap({
  center,
  zoom = 13,
  className = "",
  markerTitle = "ATRO Office",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon
    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3c0508, #5c1018);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #c9924f;
        box-shadow: 0 4px 12px rgba(60, 5, 8, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #c9924f;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker(center, { icon })
      .addTo(map)
      .bindPopup(`<strong>${markerTitle}</strong><br>Nairobi, Kenya`);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [center, zoom, markerTitle]);

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
