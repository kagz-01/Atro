"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type LeafletMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
  markerTitle?: string;
  markerSubtitle?: string;
};

export function LeafletMap({
  center,
  zoom = 13,
  className = "",
  markerTitle = "ATRO Design & Construction",
  markerSubtitle = "Nairobi, Kenya",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const node = mapRef.current;
    if (!node || mapInstance.current) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      const map = L.map(node, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

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
        .bindPopup(`<strong>${markerTitle}</strong><br>${markerSubtitle}`);

      mapInstance.current = map;
      cleanup = () => {
        map.remove();
        mapInstance.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [center, zoom, markerTitle, markerSubtitle]);

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
