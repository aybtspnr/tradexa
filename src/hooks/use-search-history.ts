import { useState, useEffect } from "react";

export interface SearchHistoryItem {
  id: string;
  action: string;
  description: string;
  date: string;
  status: "completed" | "pending";
  type: "ncm_lookup" | "ai_search" | "tax_calc" | "export_search" | "import_search" | "trade_balance";
}

const STORAGE_KEY = "tradexa_search_history";
const MAX_ITEMS = 50;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const add = (item: Omit<SearchHistoryItem, "id" | "date" | "status">) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: new Date().toISOString(),
      status: "completed",
    };
    setHistory((prev) => {
      const next = [newItem, ...prev];
      return next.slice(0, MAX_ITEMS);
    });
  };

  const clear = () => setHistory([]);

  return { history, add, clear };
}

export function saveSearchHistory(
  action: string,
  description: string,
  type: SearchHistoryItem["type"]
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: SearchHistoryItem[] = raw ? JSON.parse(raw) : [];
    const item: SearchHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      action,
      description,
      date: new Date().toISOString(),
      status: "completed",
      type,
    };
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}