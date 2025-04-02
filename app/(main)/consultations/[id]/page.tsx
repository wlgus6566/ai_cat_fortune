"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { useRouter, useParams } from "next/navigation";
import ConsultationDetail from "@/app/components/ConsultationDetail";
import { SelectConsultation } from "@/db/schema";

// 상담 내역 타입 정의
interface ConsultationWithTalisman extends SelectConsultation {
  talisman?: {
    storagePath: string;
    publicUrl?: string;
    concern?: string;
    fileName?: string;
  } | null;
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isProfileComplete } = useUser();
  const router = useRouter();
  const [consultation, setConsultation] =
    useState<ConsultationWithTalisman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback을 사용하여 함수 메모이제이션
  const fetchConsultation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/consultations/${id}`);

      if (response.ok) {
        const data = await response.json();
        setConsultation(data.consultation);
      } else if (response.status === 404) {
        setError("상담 내역을 찾을 수 없습니다.");
      } else {
        throw new Error("상담 내역을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("상담 내역 불러오기 오류:", error);
      setError("상담 내역을 불러오는데 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // 프로필이 완성된 상태에서만 상담 내역 불러오기
    if (isProfileComplete && id) {
      fetchConsultation();
    }
  }, [id, isProfileComplete, fetchConsultation]);

  if (!isProfileComplete) {
    return null; // 프로필이 완성되지 않은 경우 렌더링하지 않음 (MainLayout에서 처리)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-md">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-4">오류 발생</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/consultations")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            상담 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-700 mb-4">
            상담 내역을 찾을 수 없음
          </h2>
          <p className="text-yellow-600 mb-6">
            요청하신 상담 내역을 찾을 수 없습니다. 상담 목록으로 돌아가세요.
          </p>
          <button
            onClick={() => router.push("/consultations")}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            상담 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <ConsultationDetail consultation={consultation} />;
}
