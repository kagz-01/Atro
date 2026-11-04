import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletEntry = {
  id: string;
  label: string;
  amount: number;
  direction: "in" | "out";
  method: string;
  date: string;
};

type SiteState = {
  diasporaMode: boolean;
  setDiasporaMode: (v: boolean) => void;
  selectedZone: string | null;
  setSelectedZone: (z: string | null) => void;
  clientWallet: {
    balance: number;
    activity: WalletEntry[];
  };
  addClientWalletDeposit: (input: {
    amount: number;
    method: string;
    label?: string;
  }) => void;
  resetClientWallet: () => void;
};

const initialWallet = {
  balance: 425000,
  activity: [
    {
      id: "w-1",
      label: "Initial account funding",
      amount: 275000,
      direction: "in",
      method: "Bank transfer",
      date: "2025-02-13",
    },
    {
      id: "w-2",
      label: "Site costs applied",
      amount: 65000,
      direction: "out",
      method: "Project payment",
      date: "2025-03-04",
    },
    {
      id: "w-3",
      label: "Retained funds",
      amount: 150000,
      direction: "in",
      method: "Certificate release",
      date: "2025-03-22",
    },
  ] as WalletEntry[],
};

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      diasporaMode: false,
      setDiasporaMode: (v) => set({ diasporaMode: v }),
      selectedZone: null,
      setSelectedZone: (z) => set({ selectedZone: z }),
      clientWallet: initialWallet,
      addClientWalletDeposit: ({ amount, method, label = "Client deposit" }) =>
        set((state) => ({
          clientWallet: {
            balance: state.clientWallet.balance + amount,
            activity: [
              {
                id: `w-${Date.now()}`,
                label,
                amount,
                direction: "in",
                method,
                date: new Date().toISOString(),
              },
              ...state.clientWallet.activity,
            ].slice(0, 6),
          },
        })),
      resetClientWallet: () => set({ clientWallet: initialWallet }),
    }),
    { name: "atro.site", skipHydration: true },
  ),
);
