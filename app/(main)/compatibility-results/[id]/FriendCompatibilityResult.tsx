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
  Coffee,
  Zap,
  Brain,
} from "lucide-react";
import type { FriendCompatibilityResult } from "@/app/lib/openai";

interface FriendCompatibilityResultProps {
  data: FriendCompatibilityResult;
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

// CategoryCard 컴포넌트
interface CategoryCardProps {
  title: string;
  score: number;
  children: React.ReactNode;
  delay?: number;
  icon?: React.ReactNode;
  color?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  children,
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
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 점수별 닉네임과 고양이 첨언 가져오기 (기존 코드에서 가져옴)
const SCORE_NICKNAME_MAP = [
  {
    score: 10,
    nickname: "🐾 다른 세상에서 온 듯한 우리",
    catComment: "다르지만 그래서 더 기억에 남는 조합이라냥.",
  },
  {
    score: 20,
    nickname: "🧩 서로를 아직 배우는 중인 사이",
    catComment: "익숙하진 않아도, 알아가려는 게 중요하다옹~",
  },
  {
    score: 30,
    nickname: "🌱 서서히 싹트는 느린 우정",
    catComment: "시간이 쌓일수록 더 자연스러워지는 관계라냥.",
  },
  {
    score: 40,
    nickname: "🍵 말은 없어도 편안한 온도",
    catComment: "같이 있는 것만으로도 차분해지는 사이다옹.",
  },
  {
    score: 50,
    nickname: "🌤 흐림과 맑음이 공존하는 친구",
    catComment: "완벽하진 않아도 함께 있으면 나쁘지 않다냥.",
  },
  {
    score: 60,
    nickname: "🌙 달처럼 멀지만 정 있는 사이",
    catComment: "항상 가깝진 않아도 마음은 은은히 이어진다냥.",
  },
  {
    score: 70,
    nickname: "🔗 느슨하지만 단단한 연결",
    catComment: "틈이 있어도 그게 오히려 우리를 편하게 해준다냥.",
  },
  {
    score: 80,
    nickname: "🌻 보면 기분 좋아지는 친구",
    catComment: "가끔만 봐도 에너지 받는 그런 관계라옹~",
  },
  {
    score: 90,
    nickname: "🍀 말 안 해도 마음이 닿는 사이",
    catComment: "고양이도 눈빛만 봐도 아는 그런 느낌이라냥!",
  },
  {
    score: 100,
    nickname: "✨ 운명처럼 맞아떨어지는 찐친",
    catComment: "함께 있는 게 가장 자연스러운 친구라옹~",
  },
];

const getScoreNickname = (score: number) => {
  // 점수를 10점 단위로 변환 (0~9 -> 10, 10~19 -> 20, ...)
  const normalizedScore = Math.min(Math.ceil(score / 10) * 10, 100);
  const index = normalizedScore / 10 - 1;
  return SCORE_NICKNAME_MAP[index >= 0 ? index : 0];
};

export default function FriendCompatibilityResult({
  data,
  person1,
  person2,
}: FriendCompatibilityResultProps) {
  // UI 컴포넌트 렌더링 (기존 친구 궁합 결과 페이지 UI 사용)
  return (
    <div className="pb-10">
      <Image
        src="/new_cat_love.png"
        alt="친구 궁합 결과"
        width={100}
        height={100}
      />

      {/* 닉네임 및 점수 */}
      <motion.div
        className="text-center my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <>
          <h1 className="text-3xl font-bold text-[#3B2E7E] mb-2">
            {getScoreNickname(data.totalScore).nickname}
          </h1>
          <p className="text-[#990dfa] text-lg mb-4">
            {getScoreNickname(data.totalScore).catComment}
          </p>
        </>
        <div className="flex justify-center relative items-center my-4">
          <CircularProgress
            percentage={data.totalScore}
            size={200}
            strokeWidth={15}
            color="#990dfa"
            backgroundColor="rgba(153, 13, 250, 0.1)"
          />
          <div className="absolute flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-3xl font-bold text-[#3B2E7E]">
              {data.totalScore}
            </span>
            <span className="block text-sm text-[#990dfa] mt-2 ml-2">점</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {data.hashtags.map((tag, i) => (
            <span
              key={i}
              className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#990dfa]/10 to-[#7609c1]/10 border border-[#990dfa]/20 text-[#3B2E7E] text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* 오행 분석 섹션 */}
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

        {/* 두 사람 정보 카드 */}
        <div className="flex gap-4 mb-6">
          {/* 첫 번째 사람 카드 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                {data.elements.user.name}
              </h3>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                <span className="text-2xl">
                  {data.elements.user.element.split(" ")[0]}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2">
                {data.elements.user.description}
              </p>
            </div>
          </div>

          {/* 두 번째 사람 카드 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                {data.elements.partner.name}
              </h3>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                <span className="text-2xl">
                  {data.elements.partner.element.split(" ")[0]}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2">
                {data.elements.partner.description}
              </p>
            </div>
          </div>
        </div>

        {/* 관계 해석 */}
        <div className="p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
          <p className="text-gray-700 text-center">
            {data.elements.relationshipInterpretation}
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
          <Smile className="w-5 h-5 mr-2 text-[#990dfa]" />
          카테고리별 궁합
        </h2>

        {data.categories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            score={category.score}
            delay={index * 0.1}
            icon={
              index === 0 ? (
                <Brain className="w-5 h-5 text-[#990dfa]" />
              ) : index === 1 ? (
                <Star className="w-5 h-5 text-[#990dfa]" />
              ) : index === 2 ? (
                <Coffee className="w-5 h-5 text-[#990dfa]" />
              ) : index === 3 ? (
                <Heart className="w-5 h-5 text-[#990dfa]" />
              ) : (
                <Zap className="w-5 h-5 text-[#990dfa]" />
              )
            }
            color={`rgba(153, 13, 250, ${0.1 + index * 0.05})`}
          >
            <div>
              <p className="text-gray-700 mb-3">{category.analysis}</p>
              <div className="flex items-start mt-2 text-[#990dfa]">
                <div className="flex-shrink-0 mr-2 mt-1">🐱</div>
                <p className="italic text-sm">{category.catComment}</p>
              </div>
            </div>
          </CategoryCard>
        ))}
      </motion.div>

      {/* 보너스 섹션 */}
      <motion.div
        className="mb-8 p-4 rounded-2xl shadow-sm border border-[#e6e6e6] bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
                <span className="text-xl">{data.bonus.luckyItem.emoji}</span>
              </div>
              <h3 className="text-lg font-medium text-[#3B2E7E]">
                행운 아이템
              </h3>
            </div>
            <p className="text-[#3B2E7E] font-medium mb-1">
              {data.bonus.luckyItem.label}
            </p>
            <p className="text-gray-700 text-sm">
              {data.bonus.luckyItem.description}
            </p>
          </div>

          {/* 추천 활동 */}
          <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#F9F5FF] border border-[#990dfa]/20 flex items-center justify-center mr-3">
                <span className="text-xl">
                  {data.bonus.recommendedActivity.emoji}
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#3B2E7E]">추천 활동</h3>
            </div>
            <p className="text-[#3B2E7E] font-medium mb-1">
              {data.bonus.recommendedActivity.label}
            </p>
            <p className="text-gray-700 text-sm">
              {data.bonus.recommendedActivity.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 고양이 최종 멘트 */}
      <motion.div
        className="mb-8 p-6 rounded-2xl bg-white shadow-sm border border-[#e6e6e6] text-center magic-bg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
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
          {data.finalCatComment}
        </p>
      </motion.div>
    </div>
  );
}
