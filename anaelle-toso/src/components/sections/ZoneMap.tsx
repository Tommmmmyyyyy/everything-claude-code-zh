"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ZoneContent } from "@/lib/content";
import departements from "@content/geo/departements-nord.json";

/**
 * Carte interactive de la zone d'intervention (Leaflet).
 * Fond vectoriel intégré (contours des départements) : aucun appel à un service tiers.
 * Un fond en tuiles peut être ajouté via zone.map.tileUrl.
 */
export default function ZoneMap({ zone, onReady }: { zone: ZoneContent; onReady?: (api: { recenter: () => void }) => void }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      const css = getComputedStyle(document.documentElement);
      const c = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
      const cream = c("--color-cream", "#f4eadb");
      const sand = c("--color-sand", "#d9c4a0");
      const cognac = c("--color-cognac", "#c07a43");
      const sage = c("--color-sage", "#9cae8e");

      const base: [number, number] = [zone.main.lat ?? zone.map.defaultLat, zone.main.lng ?? zone.map.defaultLng];
      map = L.map(el.current, {
        center: base,
        zoom: zone.map.defaultZoom,
        minZoom: 7,
        maxZoom: 12,
        zoomSnap: 0.25,
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: false,
        maxBounds: L.latLngBounds([48.3, -0.8], [51.6, 5.4]),
        maxBoundsViscosity: 0.8,
      });
      L.control.zoom({ position: "topright", zoomInTitle: "Zoomer", zoomOutTitle: "Dézoomer" }).addTo(map);
      map.attributionControl.setPrefix(false).addAttribution(zone.map.attribution);
      // Molette active après un clic sur la carte (pour ne pas gêner le défilement de la page)
      map.on("click", () => map?.scrollWheelZoom.enable());
      map.on("mouseout", () => map?.scrollWheelZoom.disable());

      if (zone.map.tileUrl) L.tileLayer(zone.map.tileUrl, { maxZoom: 18 }).addTo(map);

      // Départements
      const geo = L.geoJSON(departements as GeoJSON.FeatureCollection, {
        style: (f) => {
          const role = f?.properties?.role;
          if (role === "somme") return { color: cream, weight: 1.6, fillColor: sand, fillOpacity: 0.16 };
          if (role === "region") return { color: sand, weight: 1, opacity: 0.55, fillColor: sage, fillOpacity: 0.07 };
          return { color: sand, weight: 0.6, opacity: 0.22, fillColor: "#000", fillOpacity: 0.12, dashArray: "2 4" };
        },
        interactive: false,
      }).addTo(map);

      // Noms des départements de la région
      const names: Record<string, [number, number]> = {
        Somme: [49.93, 2.05],
        "Pas-de-Calais": [50.47, 2.35],
        Nord: [50.42, 3.42],
        Oise: [49.42, 2.62],
        Aisne: [49.55, 3.55],
      };
      Object.entries(names).forEach(([n, ll]) =>
        L.marker(ll, {
          interactive: false,
          icon: L.divIcon({ className: "map-dept", html: `<span>${n}</span>`, iconSize: [0, 0] }),
        }).addTo(map!),
      );
      L.marker([50.25, 1.25], { interactive: false, icon: L.divIcon({ className: "map-sea", html: "<span>Manche</span>", iconSize: [0, 0] }) }).addTo(map);

      // Déplacements possibles (sur demande)
      zone.extended.forEach((z) => {
        if (!z.radiusKm) return;
        L.circle([z.lat, z.lng], { radius: z.radiusKm * 1000, color: sand, weight: 1, opacity: 0.6, dashArray: "2 7", fillOpacity: 0.03 })
          .bindTooltip(`${z.name} — sur demande`, { direction: "top" })
          .addTo(map!);
      });

      // Zone principale
      if (zone.main.radiusKm) {
        L.circle(base, { radius: zone.main.radiusKm * 1000, color: cognac, weight: 1.5, dashArray: "6 6", fillColor: cognac, fillOpacity: 0.07, interactive: false }).addTo(map);
      }

      // Villes desservies
      zone.cities.forEach((ct) => {
        const major = ct.name === "Amiens" || ct.name === "Abbeville";
        L.circleMarker([ct.lat, ct.lng], { radius: major ? 4.5 : 3.2, color: cream, weight: 1.2, fillColor: cream, fillOpacity: 0.9 })
          .bindTooltip(ct.name, { direction: "top", offset: [0, -4], permanent: major, className: major ? "is-major" : "" })
          .addTo(map!);
      });

      // Base
      L.marker(base, {
        icon: L.divIcon({ className: "map-base", html: '<span class="map-base-pulse"></span><span class="map-base-dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }),
        keyboard: false,
      })
        .bindTooltip(`<strong>${zone.main.baseLabel ?? "Ma base"}</strong><br/>Base d'Anaëlle`, { direction: "right", offset: [12, 0], permanent: true, className: "is-base" })
        .addTo(map);

      const somme = geo.getLayers().find((l) => (l as L.GeoJSON & { feature?: GeoJSON.Feature }).feature?.properties?.role === "somme") as L.Polygon | undefined;
      const recenter = () => {
        if (somme) map?.flyToBounds(somme.getBounds().pad(0.08), { duration: 0.8 });
        else map?.flyTo(base, zone.map.defaultZoom);
      };
      if (somme) map.fitBounds(somme.getBounds().pad(0.08));
      onReady?.({ recenter });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [zone, onReady]);

  return <div ref={el} className="h-full w-full" role="region" aria-label="Carte interactive de la zone d'intervention : Somme et Hauts-de-France" />;
}
