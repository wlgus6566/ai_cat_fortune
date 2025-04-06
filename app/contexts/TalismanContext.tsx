"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface TalismanContextType {
  isOpen: boolean;
  imageUrl: string | null;
  userName?: string;
  title?: string;
  darkMode?: boolean;
  createdAt?: string;
  concern?: string;
  translatedPhrase?: string;
  talismanId?: string;
  onTalismanDeleted?: (id: string) => void;
  openTalisman: (params: {
    imageUrl: string;
    userName?: string;
    title?: string;
    darkMode?: boolean;
    createdAt?: string;
    concern?: string;
    translatedPhrase?: string;
    talismanId?: string;
    onTalismanDeleted?: (id: string) => void;
  }) => void;
  closeTalisman: () => void;
  deleteTalisman: (id: string) => Promise<boolean>;
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
  const [translatedPhrase, setTranslatedPhrase] = useState<
    string | undefined
  >();
  const [talismanId, setTalismanId] = useState<string | undefined>();
  const [onTalismanDeleted, setOnTalismanDeleted] = useState<
    ((id: string) => void) | undefined
  >();

  const openTalisman = ({
    imageUrl,
    userName,
    title,
    darkMode,
    createdAt,
    concern,
    translatedPhrase,
    talismanId,
    onTalismanDeleted,
  }: {
    imageUrl: string;
    userName?: string;
    title?: string;
    darkMode?: boolean;
    createdAt?: string;
    concern?: string;
    translatedPhrase?: string;
    talismanId?: string;
    onTalismanDeleted?: (id: string) => void;
  }) => {
    setImageUrl(imageUrl);
    setUserName(userName);
    setTitle(title);
    setDarkMode(darkMode);
    setCreatedAt(createdAt);
    setConcern(concern);
    setTranslatedPhrase(translatedPhrase);
    setTalismanId(talismanId);
    setOnTalismanDeleted(onTalismanDeleted);
    setIsOpen(true);
  };

  const closeTalisman = () => {
    setIsOpen(false);
  };

  const deleteTalisman = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/talisman?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("부적 삭제 실패:", errorData);
        return false;
      }

      const result = await response.json();

      // 삭제 성공 시 콜백 직접 호출 후 상태 업데이트
      if (result.success === true) {
        console.log("TalismanContext: 부적 삭제 성공", id);

        // 콜백이 있는 경우 직접 호출
        if (onTalismanDeleted) {
          console.log("TalismanContext: onTalismanDeleted 콜백 직접 호출", id);
          onTalismanDeleted(id);
        }
      }

      return result.success === true;
    } catch (error) {
      console.error("부적 삭제 중 오류 발생:", error);
      return false;
    }
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
        translatedPhrase,
        talismanId,
        onTalismanDeleted,
        openTalisman,
        closeTalisman,
        deleteTalisman,
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
