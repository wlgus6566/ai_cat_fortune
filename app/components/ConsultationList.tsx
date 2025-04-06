import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SelectConsultation } from "@/db/schema";
import ConsultationItem from "./ConsultationItem";

interface ConsultationListProps {
  consultations: (SelectConsultation & {
    talisman?: {
      storagePath: string;
      publicUrl?: string;
    } | null;
  })[];
}

export default function ConsultationList({
  consultations,
}: ConsultationListProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 간단한 로딩 효과
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔮</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 상담 내역이 없어요
        </h3>
        <p className="text-gray-600 mb-6">
          고민이 있다면 묘묘와 상담을 시작해보세요!
        </p>
        <Link href="/chat">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
            상담 시작하기
          </button>
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-3"
      >
        {consultations.map((consultation) => (
          <ConsultationItem key={consultation.id} consultation={consultation} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
