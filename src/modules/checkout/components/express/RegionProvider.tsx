import { sdk } from "@lib/sdk";
import { createContext, useContext, useEffect, useState } from "react";
import type { StoreRegion } from "@medusajs/types";

interface RegionContextType {
  region?: StoreRegion;
  regions: StoreRegion[];
  setRegion: (region: StoreRegion) => void;
}

const RegionContext = createContext<RegionContextType | null>(null);

interface RegionProviderProps {
  children: React.ReactNode;
}

export const RegionProvider = ({ children }: RegionProviderProps) => {
  const [regions, setRegions] = useState<StoreRegion[]>([]);
  const [region, setRegion] = useState<StoreRegion | undefined>();

  useEffect(() => {
    if (regions.length) return;

    sdk.store.region.list()
      .then(({ regions }) => {
        setRegions(regions);
        if (regions.length > 0) {
          setRegion(regions[0]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch regions:", error);
      });
  }, [regions.length]);

  useEffect(() => {
    if (region) {
      localStorage.setItem("region_id", region.id);
      return;
    }

    const regionId = localStorage.getItem("region_id");
    if (regionId && regions.length > 0) {
      sdk.store.region.retrieve(regionId)
        .then(({ region: dataRegion }) => {
          setRegion(dataRegion);
        })
        .catch(() => {
          if (regions.length > 0) {
            setRegion(regions[0]);
          }
        });
    } else if (regions.length > 0) {
      setRegion(regions[0]);
    }
  }, [region, regions]);

  const value = {
    region,
    regions,
    setRegion,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
};
