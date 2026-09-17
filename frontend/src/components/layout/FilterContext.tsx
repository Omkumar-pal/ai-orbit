"use client";

import { createContext, useContext, useState } from "react";

export type OrbitFilter = "trending" | "popular" | "new" | "free" | "top-rated" | null;

const FilterContext = createContext<{ activeFilter: OrbitFilter; setActiveFilter: (filter: OrbitFilter) => void } | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<OrbitFilter>(null);
  return <FilterContext.Provider value={{ activeFilter, setActiveFilter }}>{children}</FilterContext.Provider>;
}

export function useOrbitFilter() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useOrbitFilter must be used inside FilterProvider");
  return context;
}
