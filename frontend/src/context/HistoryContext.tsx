import { createContext, useContext, useMemo, useState } from "react";
import type { AnalyzeResponse } from "@/lib/api";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  modelId: string;
  modelName: string;
  resultLabel: string;
  confidence: number;
  previewDataUrl?: string | null;
   originalWithBoxes?: string | null;
   elaHeatmap?: string | null;
   elaWithBoxes?: string | null;
  rawResponse?: AnalyzeResponse;
}

interface HistoryContextValue {
  history: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  clear: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addEntry = (entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const clear = () => setHistory([]);

  const value = useMemo(() => ({ history, addEntry, clear }), [history]);

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistoryData = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryData must be used inside HistoryProvider");
  return ctx;
};
