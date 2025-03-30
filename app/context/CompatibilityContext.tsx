"use client";

import React, { createContext, useContext, useState } from "react";

interface Person {
  name: string;
  birthdate: string;
  gender: "남" | "여";
  birthtime: string;
}

interface CompatibilityState {
  person1: Person;
  person2: Person;
}

interface CompatibilityContextType {
  state: CompatibilityState;
  setState: (state: CompatibilityState) => void;
}

const initialState: CompatibilityState = {
  person1: {
    name: "",
    birthdate: "",
    gender: "남",
    birthtime: "",
  },
  person2: {
    name: "",
    birthdate: "",
    gender: "여",
    birthtime: "",
  },
};

const CompatibilityContext = createContext<
  CompatibilityContextType | undefined
>(undefined);

export function CompatibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CompatibilityState>(initialState);

  return (
    <CompatibilityContext.Provider value={{ state, setState }}>
      {children}
    </CompatibilityContext.Provider>
  );
}

export function useCompatibility() {
  const context = useContext(CompatibilityContext);
  if (context === undefined) {
    throw new Error(
      "useCompatibility must be used within a CompatibilityProvider"
    );
  }
  return context;
}
