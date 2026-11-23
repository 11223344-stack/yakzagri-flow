"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

export type TradeData = {
  // Step 1
  commodity: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  currency: string;
  sellerAddress: string;
  deliveryWindow: string;
  // Step 2
  buyerRatio: number;
  sellerRatio: number;
  deliveryDays: string;
  notes: string;
};

type TradeContextType = {
  step: number;
  setStep: (s: number) => void;
  data: TradeData;
  update: (partial: Partial<TradeData>) => void;
  resetTradeWizard: () => void;
  hasDraft: boolean;
  resumeDraft: () => void;
  discardDraft: () => void;
};

const defaults: TradeData = {
  commodity: "",
  quantity: "",
  unit: "kg",
  pricePerUnit: "",
  currency: "NGN",
  sellerAddress: "",
  deliveryWindow: "",
  buyerRatio: 50,
  sellerRatio: 50,
  deliveryDays: "7",
  notes: "",
};

const TradeContext = createContext<TradeContextType>({} as TradeContextType);

const STORAGE_KEY = "amana:draft-trade";

export function TradeProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: Partial<TradeData>;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TradeData>(() => ({ ...defaults, ...initialData }));
  const [draft, setDraft] = useState<{ data: TradeData; step: number } | null>(null);
  const dirty = useRef(false);

  // Detect an unfinished draft on mount; the user chooses to resume or discard.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.data && JSON.stringify(parsed.data) !== JSON.stringify(defaults)) {
        setDraft({ data: { ...defaults, ...parsed.data }, step: parsed.step || 1 });
      }
    } catch {}
  }, []);

  // Debounced auto-save: 2s after the last edit.
  useEffect(() => {
    if (!dirty.current) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step, savedAt: new Date().toISOString() }));
      } catch {}
    }, 2000);
    return () => clearTimeout(id);
  }, [data, step]);

  const update = (partial: Partial<TradeData>) => {
    dirty.current = true;
    setDraft(null);
    setData((prev) => ({ ...prev, ...partial }));
  };

  const resumeDraft = () => {
    if (!draft) return;
    setData(draft.data);
    setStep(draft.step);
    setDraft(null);
  };

  const discardDraft = () => {
    setDraft(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const resetTradeWizard = () => {
    dirty.current = false;
    setDraft(null);
    setData(defaults);
    setStep(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <TradeContext.Provider value={{ step, setStep, data, update, resetTradeWizard, hasDraft: draft !== null, resumeDraft, discardDraft }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrade = () => useContext(TradeContext);
