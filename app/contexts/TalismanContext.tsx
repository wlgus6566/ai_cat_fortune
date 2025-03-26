"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TalismanContextType {
  isOpen: boolean;
  imageUrl: string | null;
  userName?: string;
  title?: string;
  darkMode?: boolean;
  createdAt?: string;
  concern?: string;
  openTalisman: (params: {
    imageUrl: string;
    userName?: string;
    title?: string;
    darkMode?: boolean;
    createdAt?: string;
    concern?: string;
  }) => void;
  closeTalisman: () => void;
}

const TalismanContext = createContext<TalismanContextType | undefined>(
  undefined
);

export function TalismanProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [darkMode, setDarkMode] = useState<boolean | undefined>(false);
  const [createdAt, setCreatedAt] = useState<string | undefined>();
  const [concern, setConcern] = useState<string | undefined>();

  const openTalisman = ({
    imageUrl,
    userName,
    title,
    darkMode,
    createdAt,
    concern,
  }: {
    imageUrl: string;
    userName?: string;
    title?: string;
    darkMode?: boolean;
    createdAt?: string;
    concern?: string;
  }) => {
    setImageUrl(imageUrl);
    setUserName(userName);
    setTitle(title);
    setDarkMode(darkMode);
    setCreatedAt(createdAt);
    setConcern(concern);
    setIsOpen(true);
  };

  const closeTalisman = () => {
    setIsOpen(false);
  };

  return (
    <TalismanContext.Provider
      value={{
        isOpen,
        imageUrl,
        userName,
        title,
        darkMode,
        createdAt,
        concern,
        openTalisman,
        closeTalisman,
      }}
    >
      {children}
    </TalismanContext.Provider>
  );
}

export function useTalisman() {
  const context = useContext(TalismanContext);
  if (context === undefined) {
    throw new Error("useTalisman must be used within a TalismanProvider");
  }
  return context;
}
