"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

// Fix Leaflet marker icon issue
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapProps {
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  popupText?: string;
  zoom?: number;
  className?: string;
}

const stateCapitals: Record<string, [number, number]> = {
  AC: [-9.974, -67.807],
  AL: [-9.665, -35.735],
  AM: [-3.119, -60.021],
  AP: [0.034, -51.069],
  BA: [-12.971, -38.510],
  CE: [-3.731, -38.526],
  DF: [-15.793, -47.882],
  ES: [-20.315, -40.312],
  GO: [-16.686, -49.264],
  MA: [-2.53, -44.302],
  MG: [-19.917, -43.934],
  MS: [-20.442, -54.646],
  MT: [-15.601, -56.097],
  PA: [-1.455, -48.49],
  PB: [-7.115, -34.863],
  PE: [-8.053, -34.881],
  PI: [-5.089, -42.801],
  PR: [-25.429, -49.271],
  RJ: [-22.906, -43.172],
  RN: [-5.794, -35.209],
  RO: [-8.761, -63.903],
  RR: [2.819, -60.673],
  RS: [-30.034, -51.217],
  SC: [-27.595, -48.548],
  SE: [-10.911, -37.073],
  SP: [-23.55, -46.633],
  TO: [-10.184, -48.333],
};

export default function Map({
  latitude,
  longitude,
  city,
  state,
  neighborhood,
  popupText,
  zoom = 13,
  className = "h-[300px] w-full rounded-xl overflow-hidden shadow-card border border-surface-700/50",
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    fixLeafletIcon();

    if (latitude !== undefined && longitude !== undefined) {
      setCoords([latitude, longitude]);
      return;
    }

    if (city && state) {
      // Nominatim tem rate-limit rígido; aborta após 5s e cancela ao
      // desmontar/trocar de item. Tenta do mais específico (com bairro) ao
      // mais genérico (cidade) e só então cai para a capital do estado.
      let cancelled = false;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const uppercaseState = state.toUpperCase().trim();
      const fallbackToCapital = () => {
        if (cancelled) return;
        setCoords(stateCapitals[uppercaseState] || [-23.55, -46.633]);
      };

      const candidates = [
        neighborhood ? `${neighborhood}, ${city}, ${state}, Brasil` : "",
        `${city}, ${state}, Brasil`,
      ].filter(Boolean);

      const geocode = async () => {
        for (const q of candidates) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
              { signal: controller.signal },
            );
            const data = await res.json();
            if (cancelled) return;
            if (data && data.length > 0) {
              setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
              return;
            }
          } catch {
            // Erro de rede ou abort (timeout/unmount): interrompe as tentativas.
            break;
          }
        }
        fallbackToCapital();
      };

      geocode().finally(() => clearTimeout(timeoutId));

      return () => {
        cancelled = true;
        controller.abort();
        clearTimeout(timeoutId);
      };
    } else if (state) {
      const uppercaseState = state.toUpperCase().trim();
      const capitalCoords = stateCapitals[uppercaseState] || [-23.55, -46.633];
      setCoords(capitalCoords);
    } else {
      setCoords([-23.55, -46.633]);
    }
  }, [latitude, longitude, city, state, neighborhood]);

  useEffect(() => {
    if (!mapContainerRef.current || !coords) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(coords, zoom);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView(coords, zoom);
    }

    if (markerRef.current) {
      markerRef.current.setLatLng(coords);
    } else {
      markerRef.current = L.marker(coords).addTo(mapRef.current);
    }

    if (popupText) {
      markerRef.current.bindPopup(`<span style="color: #121214; font-weight: 500;">${popupText}</span>`).openPopup();
    } else if (city && state) {
      markerRef.current.bindPopup(`<span style="color: #121214; font-weight: 500;">Localização: ${city} - ${state}</span>`).openPopup();
    }

    return () => {
      if (mapRef.current) {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
          }
        }, 100);
      }
    };
  }, [coords, zoom, popupText, city, state]);

  return <div ref={mapContainerRef} className={className} />;
}
