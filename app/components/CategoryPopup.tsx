"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";
interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  emoji: string;
  category: {
    score: number;
    description: string;
    trend: string;
    talisman: string;
  };
}

const CategoryPopup: React.FC<CategoryPopupProps> = ({
  isOpen,
  onClose,
  title,
  emoji,
  category,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 backdrop-blur-sm"
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 팝업 내용 */}
      <motion.div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md overflow-hidden z-10">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#990dfa] to-[#7609c1] p-4">
          <h3 className="text-xl font-bold flex items-center text-white">
            {emoji} {title}
          </h3>
        </div>

        {/* 내용 */}
        <div className="p-5 space-y-4">
          {/* 점수 */}
          <div className="flex items-center">
            <span className="mr-2">🌟 점수:</span>
            <span className="text-lg">{category.score}점</span>
          </div>

          {/* 경향 */}
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">📌 경향:</span> {category.trend}
            </p>
          </div>

          {/* 해석 */}
          <div>
            <p className="font-medium mb-2">💡 해석</p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {category.description}
            </p>
          </div>

          {/* 조언 */}
          <div className="relative bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg border border-yellow-200 dark:border-gray-600">
            <Image
              src={"/new_cat_thumb.png"}
              alt="부적"
              priority
              width={70}
              height={70}
              className="object-contain absolute left-0 bottom-0"
            />
            <p className="pl-[60px] text-gray-800 dark:text-gray-200 text-md">
              💬 &quot;
              {category.talisman}&quot;
            </p>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CategoryPopup;
