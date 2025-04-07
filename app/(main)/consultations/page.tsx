"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import ConsultationList from "@/app/components/ConsultationList";
import PageHeader from "@/app/components/PageHeader";
import { SelectConsultation } from "@/db/schema";

// 상담 내역 타입 정의
interface ConsultationWithTalisman extends SelectConsultation {
  talisman?: {
    storagePath: string;
    publicUrl?: string;
  } | null;
}

export default function ConsultationsPage() {
  const { isProfileComplete } = useUser();
  const [consultations, setConsultations] = useState<
    ConsultationWithTalisman[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 프로필이 완성된 상태에서만 상담 내역 불러오기
    if (isProfileComplete) {
      fetchConsultations();
    }
  }, [isProfileComplete]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/consultations");

      if (response.ok) {
        const data = await response.json();
        setConsultations(data.consultations || []);
      } else {
        throw new Error("상담 내역을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("상담 내역 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isProfileComplete) {
    return null; // 프로필이 완성되지 않은 경우 렌더링하지 않음 (MainLayout에서 처리)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader title="상담 보관함" />

      <div className="container mx-auto px-4 py-4 pb-20 max-w-md">
        <p className="text-center text-gray-600 text-sm mb-6">
          나의 저장된 상담 내역을 관리해요
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <ConsultationList consultations={consultations} />
        )}
      </div>
    </div>
  );
}
