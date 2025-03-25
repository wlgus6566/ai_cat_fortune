"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TalismanPopup from "./TalismanPopup";

interface UserTalismansProps {
  userId: string;
}

export default function UserTalismans({ userId }: UserTalismansProps) {
  const [talismans, setTalismans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTalisman, setSelectedTalisman] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchTalismans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/talisman/user?userId=${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "부적 이미지를 불러오는 중 오류가 발생했습니다."
          );
        }

        const data = await response.json();
        setTalismans(data.talismans || []);
      } catch (err) {
        console.error("부적 이미지 로딩 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalismans();
  }, [userId]);

  const handleTalismanClick = (imageUrl: string) => {
    setSelectedTalisman(imageUrl);
    setShowPopup(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (talismans.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 my-4 text-center">
        <p className="text-gray-500">{t("settings.noTalismans")}</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">나의 부적 이미지</h2>
      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {talismans.map((talismanUrl, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTalismanClick(talismanUrl)}
          >
            <div
              className="relative w-full overflow-hidden rounded-md"
              style={{ aspectRatio: "9/16" }}
            >
              <Image
                src={talismanUrl}
                alt={`부적 이미지 ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 부적 팝업 */}
      {showPopup && selectedTalisman && (
        <TalismanPopup
          imageUrl={selectedTalisman}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
