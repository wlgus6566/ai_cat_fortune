"use client";

import React, { createContext, useContext, useState } from "react";

interface Person {
  name: string;
  birthdate: string;
  gender: "남" | "여";
  birthtime: string;
}

interface FriendCompatibilityState {
  person1: Person;
  person2: Person;
}

interface FriendCompatibilityContextType {
  state: FriendCompatibilityState;
  setState: (state: FriendCompatibilityState) => void;
}

const initialState: FriendCompatibilityState = {
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

const FriendCompatibilityContext = createContext<
  FriendCompatibilityContextType | undefined
>(undefined);

export function FriendCompatibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<FriendCompatibilityState>(initialState);

  return (
    <FriendCompatibilityContext.Provider value={{ state, setState }}>
      {children}
    </FriendCompatibilityContext.Provider>
  );
}

export function useFriendCompatibility() {
  const context = useContext(FriendCompatibilityContext);
  if (context === undefined) {
    throw new Error(
      "useFriendCompatibility must be used within a FriendCompatibilityProvider"
    );
  }
  return context;
}
