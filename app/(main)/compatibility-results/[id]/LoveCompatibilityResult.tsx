"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CircularProgress from "@/app/components/CircularProgress";
import { Heart, Star, Sparkles } from "lucide-react";
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
  index?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  analysis,
  tip,
  delay = 0,
  icon,
  color = "rgba(153, 13, 250, 0.8)",
  index = 0,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

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
            {icon}
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
            isOpen
              ? "bg-[#f7f7f7] border border-[#990dfa]/20"
              : "bg-[#f7f7f7] border border-[#990dfa]/20"
          }`}
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 text-[#990dfa] ${
              isOpen ? "rotate-180" : ""
            }`}
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
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="bg-[#F9F5FF] p-4 rounded-xl text-gray-700 border border-[#e6e6e6]">
            <p className="mb-3">{analysis}</p>
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: color.replace(/0\.8/g, "0.1"),
                borderColor: color.replace(/0\.8/g, "0.2"),
              }}
            >
              <p className="text-sm font-medium text-[#3B2E7E]">🐾 {tip}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function LoveCompatibilityResult({
  data,
  person1,
  person2,
}: LoveCompatibilityResultProps) {
  // 오행에 따른 이모티콘 반환 함수
  const getElementEmoji = (element?: string) => {
    switch (element) {
      case "목":
      case "나무":
        return "🌿"; // 나무, 식물
      case "화":
      case "불":
        return "🔥"; // 불
      case "토":
        return "🏔️"; // 땅, 산
      case "금":
        return "💎"; // 보석, 금속
      case "수":
      case "물":
        return "💧"; // 물방울
      default:
        return "✨"; // 기본값
    }
  };

  // 두 오행 사이의 상생/상극 관계 이모티콘 반환 함수
  const getCompatibilitySymbol = (element1?: string, element2?: string) => {
    // 상생 관계: 목생화, 화생토, 토생금, 금생수, 수생목
    const generatingRelations = [
      { from: "목", to: "화" },
      { from: "화", to: "토" },
      { from: "토", to: "금" },
      { from: "금", to: "수" },
      { from: "수", to: "목" },
    ];

    // 상극 관계: 목극토, 토극수, 수극화, 화극금, 금극목
    const conflictingRelations = [
      { from: "목", to: "토" },
      { from: "토", to: "수" },
      { from: "수", to: "화" },
      { from: "화", to: "금" },
      { from: "금", to: "목" },
    ];

    // 기본값 설정
    if (!element1 || !element2) return "⟷"; // 중립

    // 상생 관계 확인
    if (
      generatingRelations.some((r) => r.from === element1 && r.to === element2)
    ) {
      return "→"; // 상생
    }

    // 역상생 관계 확인
    if (
      generatingRelations.some((r) => r.from === element2 && r.to === element1)
    ) {
      return "←"; // 역상생
    }

    // 상극 관계 확인
    if (
      conflictingRelations.some((r) => r.from === element1 && r.to === element2)
    ) {
      return "⇒"; // 상극
    }

    // 역상극 관계 확인
    if (
      conflictingRelations.some((r) => r.from === element2 && r.to === element1)
    ) {
      return "⇐"; // 역상극
    }

    // 동일 오행 관계
    if (element1 === element2) {
      return "⟺"; // 동일 오행
    }

    return "⟷"; // 중립 관계
  };

  // UI 컴포넌트 렌더링 (기존 운세 궁합 결과 페이지 UI 사용)
  return (
    <div className="pb-10">
      {/* 결과 컨테이너 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 상단 요소: 제목 및 테마 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-8 mb-32"
        >
          <h1 className="text-2xl font-bold mb-4 px-8 font-gothic text-[#3B2E7E] word-break-keep">
            {data.magicTitle}
          </h1>
          <p className="text-lg opacity-90 bg-[#990dfa]/10 inline-block px-4 py-1 rounded-full text-[#990dfa]">
            <span className="font-semibold">{data.compatibilityTheme}</span>
          </p>
        </motion.div>

        {/* 점수 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white relative rounded-2xl p-6 mb-8 border border-[#e6e6e6] shadow-sm"
        >
          <div className="absolute -top-[123px] left-1/2 -translate-x-1/2 -z-1">
            <Image
              src="/new_cat_thumb.png"
              alt="logo"
              width={100}
              height={100}
            />
          </div>
          {/* 원형 차트 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                className="absolute -inset-4 rounded-full opacity-20 blur-xl"
                style={{
                  background:
                    "linear-gradient(135deg,rgb(255, 190, 229),rgb(255, 187, 215))",
                }}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <CircularProgress
                percentage={data.score}
                size={150}
                strokeWidth={10}
                color="rgb(255, 0, 0)"
              />
              <div className="absolute flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-gray-800">
                  {data.score}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="mr-4 text-2xl">
              <span className="font-medium text-[#3B2E7E]">{person1.name}</span>
            </div>
            <motion.div
              className="bg-gradient-to-br from-[red] to-[red] rounded-full p-2"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
            <div className="ml-4 text-2xl">
              <span className="font-medium text-[#3B2E7E]">{person2.name}</span>
            </div>
          </div>

          <p className="text-center font-medium text-md text-[#3B2E7E]">
            {data.summary}
          </p>
        </motion.div>

        {/* 음양오행 분석 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-24"
        >
          {data.details?.yinYangAnalysis && (
            <>
              <div className="text-left mb-6">
                <h2 className="text-xl font-bold text-[#3B2E7E]">
                  음양오행 분석
                </h2>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                  음양오행은 우주와 만물의 기운을 설명하는 동양 철학으로, 두
                  사람의 에너지가 어떻게 상호작용하는지 보여줍니다
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#e6e6e6] shadow-sm overflow-hidden relative">
                {/* 배경 장식 */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#990dfa]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#7609c1]/10 rounded-full blur-3xl"></div>

                {/* 두 사람의 오행 정보 */}
                <div className="flex flex-col md:flex-row gap-4 relative z-10 p-4">
                  {/* 첫 번째 사람 카드 */}
                  <div className="flex-1 bg-[#e8eaff] rounded-xl p-5 border border-[#e6e6e6] relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-xl">
                        {getElementEmoji(
                          data.details.yinYangAnalysis.user?.element
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[#3B2E7E]">
                        {person1.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <span className="block text-xs text-gray-500">
                          오행
                        </span>
                        <span className="block text-lg font-bold text-[#3B2E7E]">
                          {getElementEmoji(
                            data.details.yinYangAnalysis.user?.element
                          )}{" "}
                          {data.details.yinYangAnalysis.user?.element || "목"}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <span className="block text-xs text-gray-500">
                          음양
                        </span>
                        <span className="block text-lg font-bold text-[#3B2E7E]">
                          {data.details.yinYangAnalysis.user?.yinYang === "음"
                            ? "☽"
                            : "☀️"}{" "}
                          {data.details.yinYangAnalysis.user?.yinYang || "양"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="italic text-sm text-gray-700">
                        &ldquo;
                        {data.details.yinYangAnalysis.user?.description}
                        &rdquo;
                      </p>
                    </div>
                  </div>

                  {/* 중앙 상생/상극 관계 표시 */}
                  <div className="hidden md:flex flex-col items-center justify-center relative min-w-[100px]">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#990dfa]/20 to-[#7609c1]/20 flex items-center justify-center z-10">
                      <div className="text-2xl text-[#990dfa]">
                        {getCompatibilitySymbol(
                          data.details.yinYangAnalysis.user?.element,
                          data.details.yinYangAnalysis.partner?.element
                        )}
                      </div>
                    </div>
                    <div className="absolute w-[2px] h-full bg-gradient-to-b from-[#990dfa]/20 via-[#7609c1]/40 to-[#990dfa]/20"></div>
                  </div>

                  {/* 두 번째 사람 카드 */}
                  <div className="flex-1 bg-[#dceaf5] rounded-xl p-5 border border-[#e6e6e6] relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-xl">
                        {getElementEmoji(
                          data.details.yinYangAnalysis.partner?.element
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[#3B2E7E]">
                        {person2.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <span className="block text-xs text-gray-500">
                          오행
                        </span>
                        <span className="block text-lg font-bold text-[#3B2E7E]">
                          {getElementEmoji(
                            data.details.yinYangAnalysis.partner?.element
                          )}{" "}
                          {data.details.yinYangAnalysis.partner?.element ||
                            "화"}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <span className="block text-xs text-gray-500">
                          음양
                        </span>
                        <span className="block text-lg font-bold text-[#3B2E7E]">
                          {data.details.yinYangAnalysis.partner?.yinYang ===
                          "음"
                            ? "☽"
                            : "☀️"}{" "}
                          {data.details.yinYangAnalysis.partner?.yinYang ||
                            "양"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="italic text-sm text-gray-700">
                        &ldquo;
                        {data.details.yinYangAnalysis.partner?.description}
                        &rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* 상성 분석 결과 */}
                <div className="mt-2 p-5 bg-[#F9F5FF] m-4 rounded-xl border border-[#e6e6e6]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center text-[#3B2E7E]">
                      <span className="mr-2">✨</span> 상성 분석
                    </h3>
                    <div className="bg-white rounded-full px-3 py-1 text-sm text-[#990dfa]">
                      점수:{" "}
                      <span className="font-bold">
                        {data.details.yinYangAnalysis.compatibility
                          ?.compatibilityScore || 91}
                      </span>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-gray-700">
                    {data.details.yinYangAnalysis.compatibility?.description}
                  </p>

                  <div className="bg-white rounded-lg p-4 flex items-center">
                    <span className="text-lg mr-2">🐾</span>
                    <p className="text-sm italic text-[#990dfa]">
                      {data.details.yinYangAnalysis.compatibility?.catComment}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* 세부 분석 카드들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center text-[#3B2E7E]">
            <Star className="h-5 w-5 text-[#990dfa] mr-2 fill-[#990dfa]" />
            세부 분석
          </h2>
          {/* 성격 궁합 */}
          <CategoryCard
            title="성격 궁합"
            score={data.details?.personalityCompatibility?.score || 85}
            analysis={data.details?.personalityCompatibility?.analysis || ""}
            tip={data.details?.personalityCompatibility?.tip || ""}
            delay={0.1}
            icon={<Sparkles className="h-6 w-6 text-white" />}
            color="rgba(153, 13, 250, 0.8)"
            index={0}
          />

          {/* 연애 스타일 */}
          <CategoryCard
            title="연애 스타일"
            score={data.details?.loveStyle?.score || 78}
            analysis={data.details?.loveStyle?.analysis || ""}
            tip={data.details?.loveStyle?.tip || ""}
            delay={0.2}
            icon={<Heart className="h-6 w-6 text-white" />}
            color="rgba(255, 77, 128, 0.8)"
            index={1}
          />

          {/* 갈등 요소 */}
          <CategoryCard
            title="갈등 요소"
            score={data.details?.conflictElements?.score || 67}
            analysis={data.details?.conflictElements?.analysis || ""}
            tip={data.details?.conflictElements?.tip || ""}
            delay={0.3}
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            color="rgba(255, 159, 64, 0.8)"
            index={2}
          />

          {/* 미래 전망 */}
          <CategoryCard
            title="미래 전망"
            score={data.details?.futurePerspective?.score || 88}
            analysis={data.details?.futurePerspective?.analysis || ""}
            tip={data.details?.futurePerspective?.tip || ""}
            delay={0.4}
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            color="rgba(72, 187, 120, 0.8)"
            index={3}
          />
        </motion.div>

        {/* 하단 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 mt-8 border border-[#e6e6e6] shadow-sm"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center text-[#3B2E7E]">
            <span className="mr-2">🧙‍♂️</span> 전체 조언
          </h3>
          <p className="mb-6 leading-relaxed text-gray-700">
            {data.totalAdvice}
          </p>

          <div className="bg-[#F9F5FF] p-4 rounded-lg border border-[#e6e6e6]">
            <h3 className="text-md font-bold mb-2 flex items-center text-[#3B2E7E]">
              <span className="mr-2">🎁</span> 행운 아이템
            </h3>
            <p className="text-sm text-gray-700">{data.luckyItem}</p>
          </div>
          <div className="mt-2 bg-[#F9F5FF] p-4 rounded-lg border border-[#e6e6e6]">
            <h3 className="text-md font-bold mb-2 flex items-center text-[#3B2E7E]">
              <span className="mr-2">💑</span> 추천 데이트
            </h3>
            <p className="text-sm text-gray-700">{data.recommendedDate}</p>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold mb-4 flex items-center text-[#3B2E7E]">
          <Star className="h-5 w-5 text-[#990dfa] mr-2 fill-[#990dfa]" />
          냥냥이 한마디
        </h2>

        {/* 고양이 말풍선 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative text-center mt-8 mb-12 h-[250px]"
        >
          <motion.div
            className="absolute left-10 max-w-[300px] transform -translate-x-1/2 bg-[#FFF7EA] border-[3px] border-[#FFD5A8] rounded-full px-6 py-3 shadow-xl z-10"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          >
            <div className="relative">
              <p className="text-[#3B2E7E] text-md text-center font-semibold">
                {data.catComment}
              </p>
              <div
                className="absolute -bottom-5 left-1/3 transform -translate-x-1/2 
              w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] 
              border-l-transparent border-r-transparent border-t-[#FFF7EA]"
              ></div>
            </div>
            <span className="mt-5 absolute left-12">
              <Image
                src="/new_cat.png"
                alt="냥냥이"
                width={100}
                height={100}
                className=""
              />
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
