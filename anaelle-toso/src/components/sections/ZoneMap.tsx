"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ZoneContent } from "@/lib/content";

/** Carte Leaflet (chargée côté client uniquement). */
export default function ZoneMap({ zone }: { zone: ZoneContent }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const center: [number, number] | null = zone.main.lat != null && zone.main.lng != null ? [zone.main.lat, zone.main.lng] : null;
      map = L.map(el.current, {
        center: center ?? [zone.map.defaultLat, zone.map.defaultLng],
        zoom: center ? 9 : zone.map.defaultZoom,
        scrollWheelZoom: false,
        dragging: !touch,
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer(zone.map.tileUrl, { attribution: zone.map.attribution, maxZoom: 18 }).addTo(map);

      const cream = "#f4eadb";
      const sand = "#d9c4a0";
      const cognac = "#c07a43";
      const layers: import("leaflet").Layer[] = [];

      if (center && zone.main.radiusKm) {
        layers.push(
          L.circle(center, {
            radius: zone.main.radiusKm * 1000,
            color: cream,
            weight: 1.5,
            dashArray: "6 6",
            fillColor: sand,
            fillOpacity: 0.12,
          }),
        );
      }
      if (center) {
        layers.push(
          L.circleMarker(center, { radius: 7, color: cream, weight: 2, fillColor: cognac, fillOpacity: 1 }).bindTooltip(
            zone.main.label ?? "Zone principale",
            { permanent: true, direction: "top", offset: [0, -8] },
          ),
        );
      }
      zone.extended.forEach((z) => {
        if (z.radiusKm)
          layers.push(
            L.circle([z.lat, z.lng], { radius: z.radiusKm * 1000, color: sand, weight: 1, dashArray: "2 8", fillOpacity: 0.04 }).bindTooltip(
              `${z.name} — sur demande`,
            ),
          );
      });
      zone.cities.forEach((c) => {
        layers.push(
          L.circleMarker([c.lat, c.lng], { radius: 4, color: cream, weight: 1.5, fillColor: cream, fillOpacity: 0.9 }).bindTooltip(c.name, {
            direction: "top",
            offset: [0, -4],
          }),
        );
      });
      if (layers.length) {
        const group = L.featureGroup(layers).addTo(map);
        map.fitBounds(group.getBounds().pad(0.15));
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [zone]);

  return <div ref={el} className="h-full w-full" role="region" aria-label="Carte de la zone d'intervention" />;
}
