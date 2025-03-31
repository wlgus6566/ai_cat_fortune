import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SelectConsultation } from "@/db/schema";
import { ChatMessage } from "@/app/type/types";
import ChatMessageComponent from "./ChatMessage";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConsultationDetailProps {
  consultation: SelectConsultation & {
    talisman?: {
      storagePath: string;
      publicUrl?: string;
      concern?: string;
      fileName?: string;
    } | null;
  };
}

export default function ConsultationDetail({
  consultation,
}: ConsultationDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formattedDate = consultation.createdAt
    ? format(new Date(consultation.createdAt), "yyyy년 MM월 dd일", {
        locale: ko,
      })
    : "";

  // 상담 삭제 핸들러
  const handleDelete = async () => {
    if (!consultation.id) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/consultations");
      } else {
        throw new Error("상담 내역 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("상담 삭제 오류:", error);
      alert("상담 내역을 삭제하는 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh)] mb-20">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/consultations" className="mr-3">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">상담 내역</h1>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
          disabled={isDeleting}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* 상담 정보 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex gap-2 items-center mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">
              {consultation.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          </div>
          {consultation.talisman && consultation.talisman.publicUrl && (
            <div className="relative w-16 h-16 bg-purple-50 rounded-lg overflow-hidden">
              <Image
                src={consultation.talisman.publicUrl}
                alt="행운의 부적"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* 채팅 내용 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-md mx-auto">
          {Array.isArray(consultation.messages) &&
            consultation.messages.map((message: ChatMessage) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              상담 내역 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              정말 이 상담 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    삭제 중...
                  </>
                ) : (
                  "삭제하기"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
