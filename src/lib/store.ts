import { create } from "zustand";
import { persist } from "zustand/middleware";

type SiteState = {
  diasporaMode: boolean;
  setDiasporaMode: (v: boolean) => void;
  selectedZone: string | null;
  setSelectedZone: (z: string | null) => void;
};

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      diasporaMode: false,
      setDiasporaMode: (v) => set({ diasporaMode: v }),
      selectedZone: null,
      setSelectedZone: (z) => set({ selectedZone: z }),
    }),
    { name: "atro.site", skipHydration: true },
  ),
);
