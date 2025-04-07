"use client";

import { createContext, useContext, useState, ReactNode, useRef } from "react";

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

  // onTalismanDeleted 함수를 useRef로 관리하여 함수 참조 유지
  const callbackRef = useRef<((id: string) => void) | undefined>(undefined);

  // onTalismanDeleted 접근자 함수
  const getCallback = () => callbackRef.current;
  const setCallback = (cb: ((id: string) => void) | undefined) => {
    callbackRef.current = cb;
  };

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
    // 로그 추가 - 콜백 확인
    console.log("TalismanContext: openTalisman 호출", {
      talismanId,
      hasCallback: !!onTalismanDeleted,
      callbackType: typeof onTalismanDeleted,
    });

    // 상태 업데이트
    setImageUrl(imageUrl);
    setUserName(userName);
    setTitle(title);
    setDarkMode(darkMode);
    setCreatedAt(createdAt);
    setConcern(concern);
    setTranslatedPhrase(translatedPhrase);
    setTalismanId(talismanId);

    // 콜백 함수를 ref에 직접 저장
    setCallback(onTalismanDeleted);

    setIsOpen(true);
  };

  const closeTalisman = () => {
    setIsOpen(false);
  };

  const deleteTalisman = async (id: string): Promise<boolean> => {
    if (!id) {
      console.warn("TalismanContext: 삭제할 부적 ID가 제공되지 않았습니다.");
      return false;
    }

    try {
      console.log("TalismanContext: 부적 삭제 API 요청 시작:", id);

      const response = await fetch(`/api/talisman?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("TalismanContext: 부적 삭제 실패:", errorData);
        return false;
      }

      const result = await response.json();
      console.log("TalismanContext: 부적 삭제 API 응답:", result);

      // 삭제 성공 시 콜백 직접 호출
      if (result.success === true) {
        console.log("TalismanContext: 부적 삭제 성공", id);

        // ref에서 콜백 가져오기 - 함수 참조 복사
        const callback = callbackRef.current;
        console.log("TalismanContext: 현재 콜백 상태:", !!callback);

        // 콜백이 있는 경우 직접 호출
        if (callback && typeof callback === "function") {
          console.log("TalismanContext: 콜백 직접 호출 준비:", id);
          try {
            // 즉시 실행
            callback(id);
            console.log("TalismanContext: 콜백 호출 성공");

            // 안전장치: 조금 지연시켜 한번 더 호출
            setTimeout(() => {
              try {
                callback(id);
                console.log("TalismanContext: 지연된 콜백 호출 성공");
              } catch (error) {
                console.error("TalismanContext: 지연된 콜백 호출 실패:", error);
              }
            }, 100);
          } catch (error) {
            console.error("TalismanContext: 콜백 호출 실패:", error);
          }
        } else {
          console.warn(
            `TalismanContext: 콜백이 없거나 유효하지 않습니다: ${typeof callback}`,
            id
          );
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("TalismanContext: 부적 삭제 중 오류 발생:", error);
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
        onTalismanDeleted: getCallback(),
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
