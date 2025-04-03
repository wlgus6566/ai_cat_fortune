"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "@/app/components/CircularProgress";
import {
  Heart,
  Star,
  Sparkles,
  Smile,
  Gift,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { CompatibilityResult } from "@/app/lib/openai";

interface LoveCompatibilityResultProps {
  data: CompatibilityResult;
  person1: {
    name: string;
    birthdate: string;
    gender: string;
    birthtime: string;
  };
  person2: {
    name: string;
    birthdate: string;
    gender: string;
    birthtime: string;
  };
}

// 애니메이션 변수
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// CategoryCard 컴포넌트 (기존 코드에서 가져옴)
interface CategoryCardProps {
  title: string;
  score: number;
  analysis: string;
  tip: string;
  delay?: number;
  icon?: React.ReactNode;
  color?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  analysis,
  tip,
  delay = 0,
  icon,
  color = "rgba(153, 13, 250, 0.8)",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-[#e6e6e6] bg-white"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay,
          },
        },
      }}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(135deg, ${color}, rgba(255, 255, 255, 0.3))`,
              border: "1px solid rgba(153, 13, 250, 0.2)",
            }}
          >
            {icon || <span className="text-[#3B2E7E] font-bold">{score}</span>}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#3B2E7E]">{title}</h3>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative w-4 h-4 mr-1">
                  <Star
                    className={`w-4 h-4 ${
                      i < Math.round(score / 20)
                        ? "text-[#FFD966] fill-[#FFD966]"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-[#F9F5FF] rotate-180" : "bg-[#F9F5FF]"
          } border border-[#990dfa]/20`}
        >
          <svg
            className="w-5 h-5 text-[#990dfa]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <div className="bg-[#F9F5FF] p-4 rounded-xl text-gray-700 border border-[#e6e6e6]">
              <p className="mb-3">{analysis}</p>
              <div className="flex items-start mt-2 text-[#990dfa]">
                <div className="flex-shrink-0 mr-2 mt-1">🐱</div>
                <p className="italic text-sm">{tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function LoveCompatibilityResult({
  data,
  person1,
  person2,
}: LoveCompatibilityResultProps) {
  // UI 컴포넌트 렌더링 (기존 운세 궁합 결과 페이지 UI 사용)
  return (
    <div className="pb-10">
      {/* 제목 및 점수 */}
      <motion.div
        className="text-center my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[#3B2E7E] mb-2">
          {data.magicTitle}
        </h1>
        <p className="text-[#990dfa] text-lg mb-4">{data.compatibilityTheme}</p>
        <p className="text-[#3B2E7E] mb-6">{data.summary}</p>
        <div className="flex justify-center relative items-center my-4">
          <CircularProgress
            percentage={data.score}
            size={200}
            strokeWidth={15}
            color="#990dfa"
            backgroundColor="rgba(153, 13, 250, 0.1)"
          />
          <div className="absolute flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-3xl font-bold text-[#3B2E7E]">
              {data.score}
            </span>
            <span className="block text-sm text-[#990dfa] mt-2 ml-2">점</span>
          </div>
        </div>
      </motion.div>

      {/* 오행 분석 */}
      <motion.div
        className="mb-8 p-4 rounded-2xl shadow-sm border border-[#e6e6e6] bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-[#990dfa]" />
          음양오행 분석
        </h2>

        <div className="flex gap-4 mb-6">
          {/* 첫 번째 사람 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                {person1.name}
              </h3>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                <span className="text-2xl">
                  {data.details.yinYangAnalysis.user.element}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2">
                {data.details.yinYangAnalysis.user.description}
              </p>
            </div>
          </div>

          {/* 두 번째 사람 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                {person2.name}
              </h3>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                <span className="text-2xl">
                  {data.details.yinYangAnalysis.partner.element}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2">
                {data.details.yinYangAnalysis.partner.description}
              </p>
            </div>
          </div>
        </div>

        {/* 관계 해석 */}
        <div className="p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
          <p className="text-gray-700 text-center mb-2">
            {data.details.yinYangAnalysis.compatibility.description}
          </p>
          <p className="text-[#990dfa] text-center italic text-sm">
            {data.details.yinYangAnalysis.compatibility.catComment}
          </p>
        </div>
      </motion.div>

      {/* 카테고리별 궁합 */}
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-[#990dfa]" />
          카테고리별 궁합
        </h2>

        <CategoryCard
          title="성격 궁합"
          score={data.details.personalityCompatibility.score}
          analysis={data.details.personalityCompatibility.analysis}
          tip={data.details.personalityCompatibility.tip}
          delay={0}
          icon={<Smile className="w-5 h-5 text-[#990dfa]" />}
          color="rgba(153, 13, 250, 0.1)"
        />

        <CategoryCard
          title="연애 스타일"
          score={data.details.loveStyle.score}
          analysis={data.details.loveStyle.analysis}
          tip={data.details.loveStyle.tip}
          delay={0.1}
          icon={<Heart className="w-5 h-5 text-[#990dfa]" />}
          color="rgba(153, 13, 250, 0.15)"
        />

        <CategoryCard
          title="갈등 요소"
          score={data.details.conflictElements.score}
          analysis={data.details.conflictElements.analysis}
          tip={data.details.conflictElements.tip}
          delay={0.2}
          icon={<BookOpen className="w-5 h-5 text-[#990dfa]" />}
          color="rgba(153, 13, 250, 0.2)"
        />

        <CategoryCard
          title="미래 전망"
          score={data.details.futurePerspective.score}
          analysis={data.details.futurePerspective.analysis}
          tip={data.details.futurePerspective.tip}
          delay={0.3}
          icon={<ArrowRight className="w-5 h-5 text-[#990dfa]" />}
          color="rgba(153, 13, 250, 0.25)"
        />
      </motion.div>

      {/* 보너스 섹션 */}
      <motion.div
        className="mb-8 p-4 rounded-2xl shadow-sm border border-[#e6e6e6] bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-[#990dfa]" />
          보너스
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* 행운 아이템 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#F9F5FF] border border-[#990dfa]/20 flex items-center justify-center mr-3">
                <span className="text-xl">🎁</span>
              </div>
              <h3 className="text-lg font-medium text-[#3B2E7E]">
                행운 아이템
              </h3>
            </div>
            <p className="text-[#3B2E7E] font-medium">{data.luckyItem}</p>
          </div>

          {/* 추천 데이트 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#F9F5FF] border border-[#990dfa]/20 flex items-center justify-center mr-3">
                <span className="text-xl">🗓️</span>
              </div>
              <h3 className="text-lg font-medium text-[#3B2E7E]">
                추천 데이트
              </h3>
            </div>
            <p className="text-[#3B2E7E] font-medium">{data.recommendedDate}</p>
          </div>
        </div>
      </motion.div>

      {/* 고양이 최종 멘트 */}
      <motion.div
        className="mb-8 p-6 rounded-2xl bg-white shadow-sm border border-[#e6e6e6] text-center magic-bg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="w-16 h-16 mx-auto mb-4">
          <Image
            src="/new_cat_magic.png"
            alt="고양이 마법사"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <p className="text-gray-700 text-lg italic whitespace-pre-line">
          {data.catComment}
        </p>
        <p className="text-[#990dfa] mt-4 font-medium">{data.totalAdvice}</p>
      </motion.div>
    </div>
  );
}
