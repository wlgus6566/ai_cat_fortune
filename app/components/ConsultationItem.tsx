import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { SelectConsultation } from "@/db/schema";
import { motion } from "framer-motion";

interface ConsultationItemProps {
  consultation: SelectConsultation & {
    talisman?: {
      storagePath: string;
      publicUrl?: string;
    } | null;
  };
}

export default function ConsultationItem({
  consultation,
}: ConsultationItemProps) {
  const [imageError, setImageError] = useState(false);

  // 날짜 형식화
  const formattedDate = consultation.createdAt
    ? format(new Date(consultation.createdAt), "yyyy년 MM월 dd일", {
        locale: ko,
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
    >
      <Link href={`/consultations/${consultation.id}`}>
        <div className="flex p-4">
          {/* 부적 이미지 */}
          <div className="w-20 h-20 mr-4 relative rounded-lg overflow-hidden flex-shrink-0 bg-purple-50">
            {consultation.talisman &&
            consultation.talisman.publicUrl &&
            !imageError ? (
              <Image
                src={consultation.talisman.publicUrl}
                alt="행운의 부적"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-500">
                <span className="text-2xl">🔮</span>
              </div>
            )}
          </div>

          {/* 텍스트 내용 */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">{formattedDate}</div>
            <h3 className="text-gray-900 font-medium text-sm sm:text-base mb-1 line-clamp-2">
              {consultation.title}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
