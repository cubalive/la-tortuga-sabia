"use client";
import { useState, useEffect } from "react";

interface GeoData {
  country: string;
  country_name: string;
  city: string;
  region: string;
  loaded: boolean;
}

export function useGeo() {
  const [geo, setGeo] = useState<GeoData>({
    country: "US",
    country_name: "United States",
    city: "",
    region: "",
    loaded: false,
  });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        setGeo({
          country: data.country_code || "US",
          country_name: data.country_name || "United States",
          city: data.city || "",
          region: data.region || "",
          loaded: true,
        });
      })
      .catch(() => setGeo((prev) => ({ ...prev, loaded: true })));
  }, []);

  return geo;
}
