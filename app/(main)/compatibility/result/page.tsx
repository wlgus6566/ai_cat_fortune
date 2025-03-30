"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCompatibility } from "@/app/context/CompatibilityContext";

interface Person {
  name: string;
  birthdate: string;
  gender: "남" | "여";
  birthtime: string;
}

interface GanjiInfo {
  element: string;
  elementName: string;
  yinYang: string;
}

interface CompatibilityData {
  ganji1: string;
  ganji2: string;
  element1: string;
  element2: string;
  element1Name: string;
  element2Name: string;
  yinYang1: string;
  yinYang2: string;
  score: number;
  title: string;
  description: string;
  info1: string;
  info2: string;
  catReaction: string;
  image: string;
  yinYangMatch: string;
}

// 60간지 정보 (전체)
const ganjiInfo: Record<string, GanjiInfo> = {
  갑자: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을축: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병인: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정묘: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무진: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기사: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경오: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신미: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임신: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계유: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
  갑술: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을해: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병자: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정축: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무인: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기묘: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경진: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신사: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임오: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계미: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
  갑신: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을유: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병술: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정해: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무자: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기축: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경인: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신묘: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임진: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계사: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
  갑오: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을미: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병신: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정유: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무술: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기해: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경자: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신축: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임인: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계묘: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
  갑진: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을사: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병오: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정미: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무신: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기유: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경술: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신해: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임자: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계축: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
  갑인: { element: "목", elementName: "푸른 나무", yinYang: "양" },
  을묘: { element: "목", elementName: "싱그러운 나무", yinYang: "음" },
  병진: { element: "화", elementName: "타오르는 불꽃", yinYang: "양" },
  정사: { element: "화", elementName: "따뜻한 햇살", yinYang: "음" },
  무오: { element: "토", elementName: "든든한 대지", yinYang: "양" },
  기미: { element: "토", elementName: "부드러운 흙", yinYang: "음" },
  경신: { element: "금", elementName: "단단한 강철", yinYang: "양" },
  신유: { element: "금", elementName: "섬세한 은빛", yinYang: "음" },
  임술: { element: "수", elementName: "흐르는 시냇물", yinYang: "양" },
  계해: { element: "수", elementName: "맑은 이슬비", yinYang: "음" },
};

// 궁합 점수 계산 함수
function calculateCompatibilityScore(g1: GanjiInfo, g2: GanjiInfo) {
  let score = 70;

  // 오행 상생 (상호 보완적인 관계)
  const elementRelation: Record<string, string[]> = {
    목: ["화"],
    화: ["토"],
    토: ["금"],
    금: ["수"],
    수: ["목"],
  };

  if (elementRelation[g1.element]?.includes(g2.element)) score += 15;
  else if (g1.element === g2.element) score += 5; // 같은 오행이면 무난한 궁합
  else score -= 10; // 상극이면 점수 감소

  // 음양 조화 고려
  if (g1.yinYang !== g2.yinYang) score += 10;
  else score -= 5;

  return Math.max(40, Math.min(100, score)); // 40~100 사이 제한
}

// 날짜로부터 간지 계산 함수
function getGanjiFromDate(birthdate: string, time: string) {
  const ganjiList = Object.keys(ganjiInfo);
  const date = new Date(`${birthdate}T${time}`);
  const baseDate = new Date("1924-02-05T00:00:00");
  const days = Math.floor(
    (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = days % 60;
  return ganjiList[(index + 60) % 60];
}

// 시간으로부터 시주 계산
function getHourGanji(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  const hourZhi = [
    "자",
    "축",
    "인",
    "묘",
    "진",
    "사",
    "오",
    "미",
    "신",
    "유",
    "술",
    "해",
  ];
  const ranges = [
    [23, 1],
    [1, 3],
    [3, 5],
    [5, 7],
    [7, 9],
    [9, 11],
    [11, 13],
    [13, 15],
    [15, 17],
    [17, 19],
    [19, 21],
    [21, 23],
  ];

  for (let i = 0; i < ranges.length; i++) {
    const [start, end] = ranges[i];
    if (
      (start <= hour && hour < end) ||
      (start > end && (hour >= start || hour < end))
    ) {
      return hourZhi[i];
    }
  }
  return "";
}

// 시주 특성 가져오기
function getHourTrait(hourZhi: string): string {
  const traits: Record<string, string> = {
    자: "침착하고 계획적인 성향을 가졌으며, 의사소통에서 논리적인 접근을 선호합니다.",
    축: "침착하고 관계에서 신중함을 중시하며, 배려심 깊은 대화 스타일을 가졌습니다.",
    인: "활발하고 창의적인 성향으로, 대화에서 새로운 아이디어를 자주 제시합니다.",
    묘: "온화하면서도 명확한 의사표현을 잘하며, 상대방의 말을 경청하는 능력이 뛰어납니다.",
    진: "실용적이고 직설적인 대화 방식을 선호하며, 결단력 있는 의사결정을 합니다.",
    사: "유연하고 적응력이 뛰어나며, 타협점을 찾는 대화 스타일을 가졌습니다.",
    오: "열정적이고 활기찬 대화를 즐기며, 감정 표현에 솔직합니다.",
    미: "세심하고 배려심 깊은 대화 방식으로, 관계에서 조화를 추구합니다.",
    신: "분석적이고 통찰력이 있으며, 문제 해결 지향적인 대화를 선호합니다.",
    유: "섬세하고 감성적인 소통 방식으로, 상대방의 감정에 민감하게 반응합니다.",
    술: "안정적이고 신뢰를 중시하며, 차분한 대화를 통해 깊은 관계를 형성합니다.",
    해: "포용력이 넓고 다양한 관점을 수용하는 열린 마음의 대화 스타일을 가졌습니다.",
  };

  return traits[hourZhi] || "독특한 소통 방식을 가졌습니다.";
}

// 시주간 관계 분석
function getJiJiRelationship(hourZhi1: string, hourZhi2: string): string {
  if (hourZhi1 === hourZhi2) {
    return "두 사람은 비슷한 시간대에 태어나 유사한 일상 리듬과 소통 방식을 가졌습니다.";
  }

  const hourIndices: Record<string, number> = {
    자: 0,
    축: 1,
    인: 2,
    묘: 3,
    진: 4,
    사: 5,
    오: 6,
    미: 7,
    신: 8,
    유: 9,
    술: 10,
    해: 11,
  };

  const diff = Math.abs(hourIndices[hourZhi1] - hourIndices[hourZhi2]);

  if (diff === 6) {
    return "두 사람은 정반대의 시간대에 태어나 서로 보완적인 생활 리듬을 가질 수 있습니다.";
  } else if (diff === 3 || diff === 9) {
    return "두 사람은 상호 자극을 주는 관계로, 활발한 상호작용이 기대됩니다.";
  } else if (diff === 4 || diff === 8) {
    return "두 사람은 서로 다른 관점을 가지고 있어, 새로운 시각을 제공해 줄 수 있습니다.";
  } else {
    return "두 사람은 조화로운 에너지를 가지고 있어, 자연스러운 소통이 가능합니다.";
  }
}

// 궁합 데이터 생성 함수
function generateCompatibilityData(person1: Person, person2: Person) {
  const ganji1 = getGanjiFromDate(person1.birthdate, person1.birthtime);
  const ganji2 = getGanjiFromDate(person2.birthdate, person2.birthtime);

  const g1 = ganjiInfo[ganji1];
  const g2 = ganjiInfo[ganji2];

  const score = calculateCompatibilityScore(g1, g2);

  // 오행 상생 관계
  const elementRelation: Record<string, string[]> = {
    목: ["화"],
    화: ["토"],
    토: ["금"],
    금: ["수"],
    수: ["목"],
  };

  // 시주 분석
  const hourZhi1 = getHourGanji(person1.birthtime);
  const hourZhi2 = getHourGanji(person2.birthtime);
  const hourTrait1 = getHourTrait(hourZhi1);
  const hourTrait2 = getHourTrait(hourZhi2);
  const hourCompatibility = getJiJiRelationship(hourZhi1, hourZhi2);

  // 점수에 따른 제목과 반응
  const catReaction = score >= 85 ? "😍" : score >= 70 ? "🤔" : "😾";
  const title =
    score >= 85
      ? "찰떡궁합이야!! 💖"
      : score >= 70
      ? "괜찮은 궁합이에요!"
      : "노력형 궁합이에요~";
  const image =
    score >= 85
      ? "/cat_love.png"
      : score >= 70
      ? "/cat_neutral.png"
      : "/cat_angry.png";

  // 음양 분석
  const yinYangMatch =
    g1.yinYang !== g2.yinYang
      ? "음양 조화를 함께 이뤄가는 사이에요~ 🌗"
      : "성향은 비슷하지만, 조율이 필요할지도 몰라요~ 🐱";

  // 카테고리별 분석 정리
  const loveAnalysis =
    score >= 85
      ? "두 사람은 감정 표현에 적극적이며 서로의 마음을 잘 이해하고 배려할 수 있는 로맨틱한 궁합입니다. 함께 있을 때 안정감을 느끼며, 연애의 설렘이 오래 지속될 가능성이 높습니다."
      : score >= 70
      ? "연애에 있어 큰 갈등은 없지만, 서로의 마음을 표현하는 방식에서 차이가 생길 수 있습니다. 공감 능력을 키우면 사랑이 더욱 깊어질 수 있어요."
      : "감정 표현 방식이나 연애 가치관에서 차이가 있어 다툼이 생기기 쉽습니다. 다만 진심 어린 대화와 배려로 관계를 이어갈 수 있어요.";

  const marriageAnalysis =
    score > 80
      ? "가정의 평화를 중시하며, 서로를 이해하고 존중하는 결혼 생활이 가능합니다. 안정적인 미래를 함께 그릴 수 있는 최고의 파트너예요."
      : score > 60
      ? "결혼 생활에서도 서로의 성향 차이를 조율하며 살아간다면, 따뜻한 가정을 이룰 수 있습니다."
      : "생활 방식이나 가치관 차이로 인해 다툼이 잦을 수 있으나, 충분한 대화와 노력으로 극복할 수 있습니다.";

  const communicationStyle =
    hourTrait1 && hourTrait2
      ? `<ul class="list-disc pl-5">
        <li><strong>${hourZhi1}시:</strong> ${hourTrait1}</li>
        <li><strong>${hourZhi2}시:</strong> ${hourTrait2}</li>
      </ul>`
      : "서로의 표현 방식이 다를 수 있어 조율이 필요합니다.";

  const financialCompatibility =
    g1.element === "금" || g2.element === "금"
      ? "한 사람은 재물의 기운이 강하며, 실용적이고 현실적인 재정 스타일을 가지고 있어 경제적으로 안정적인 관계를 만들 수 있습니다."
      : "서로 다른 재정 스타일을 가질 수 있어 재정적 조율이 필요합니다. 서로의 경제적 가치관을 이해하는 것이 중요합니다.";

  const detailedDescription = `
<div class="grid gap-4">
  <div class="bg-pink-50 border border-pink-200 rounded-lg p-4">
    <h3 class="font-bold text-pink-600 text-lg">💘 연애 궁합</h3>
    <p class="text-pink-700 mt-2">${loveAnalysis}</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
    <h3 class="font-bold text-green-600 text-lg">🌿 오행 궁합</h3>
    <p class="text-green-700 mt-2">${g1.elementName}과 ${
    g2.elementName
  }의 만남! ${
    elementRelation[g1.element]?.includes(g2.element)
      ? "서로 상생의 관계로 긍정적인 에너지를 주고받을 수 있어요."
      : g1.element === g2.element
      ? "같은 성질을 가진 오행으로 안정적인 관계를 유지할 수 있어요."
      : "서로 다른 성질의 오행으로 도전적인 관계가 될 수 있어요."
  }</p>
  </div>

  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <h3 class="font-bold text-yellow-700 text-lg">💍 결혼 생활</h3>
    <p class="text-yellow-800 mt-2">${marriageAnalysis}</p>
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 class="font-bold text-blue-600 text-lg">🗣️ 대화 스타일</h3>
    <div class="text-blue-700 mt-2">${communicationStyle}</div>
    <p class="text-blue-700 mt-2">${hourCompatibility}</p>
  </div>

  <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
    <h3 class="font-bold text-amber-700 text-lg">💰 재정 스타일</h3>
    <p class="text-amber-800 mt-2">${financialCompatibility}</p>
  </div>
  
  <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
    <h3 class="font-bold text-purple-700 text-lg">🌓 음양 조화</h3>
    <p class="text-purple-800 mt-2">${person1.name}님은 ${g1.yinYang}성, ${
    person2.name
  }님은 ${g2.yinYang}성입니다. ${yinYangMatch}</p>
  </div>
</div>
`;

  return {
    ganji1,
    ganji2,
    element1: g1.element,
    element2: g2.element,
    element1Name: g1.elementName,
    element2Name: g2.elementName,
    yinYang1: g1.yinYang,
    yinYang2: g2.yinYang,
    score,
    title,
    description: detailedDescription,
    info1: `${g1.elementName}(${g1.element}) - ${g1.yinYang}성`,
    info2: `${g2.elementName}(${g2.element}) - ${g2.yinYang}성`,
    catReaction,
    image,
    yinYangMatch,
  };
}

export default function CompatibilityResultPage() {
  const { state } = useCompatibility();
  const [compatibilityData, setCompatibilityData] =
    useState<CompatibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      state.person1.name &&
      state.person1.birthdate &&
      state.person2.name &&
      state.person2.birthdate
    ) {
      // 궁합 데이터 계산
      const resultData = generateCompatibilityData(
        state.person1,
        state.person2
      );
      setCompatibilityData(resultData);
      setIsLoading(false);
    }
  }, [state]);

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // 스코어 바 애니메이션
  const scoreBarVariants = {
    hidden: { width: "0%" },
    visible: {
      width: compatibilityData ? `${compatibilityData.score}%` : "0%",
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 0.5,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]">
        <div className="relative">
          <div className="animate-spin h-12 w-12 border-4 border-[#990dfa] rounded-full border-t-transparent"></div>
          <div className="absolute top-0 left-0 h-12 w-12 animate-ping opacity-20 scale-75 rounded-full bg-[#990dfa]"></div>
        </div>
        <p className="mt-4 text-[#3B2E7E] font-medium">궁합 분석 중...</p>
      </div>
    );
  }

  if (!compatibilityData) {
    return (
      <div className="container max-w-screen-md mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">데이터 오류</h1>
          <p className="text-red-700">
            궁합 정보를 불러올 수 없습니다. 다시 시도해 주세요.
          </p>
          <Link href="/compatibility">
            <button className="mt-4 bg-[#6F5945] text-white px-6 py-2 rounded-lg font-medium">
              돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container max-w-screen-md mx-auto px-4 py-6 relative z-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 이미지 영역 */}
      <div className="flex justify-center mb-6">
        <Image
          src="/compatibility-header.png"
          alt="사주 궁합 테스트 결과"
          width={480}
          height={240}
          className="rounded-lg"
        />
      </div>

      {/* 결과 카드 */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-2xl font-bold text-center text-[#3B2E7E] mb-4"
          variants={itemVariants}
        >
          궁합 결과
        </motion.h1>

        <motion.div
          className="bg-[#F9F6FF] rounded-lg p-5 mb-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-center text-[#8D6FD1] mb-4">
            {compatibilityData.title}
          </h2>

          {/* 기본 정보 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6F5945] font-semibold">
                {state.person1.name}
              </span>
              <span className="text-[#6F5945] text-sm">
                {state.person1.birthdate} ({state.person1.birthtime}) /{" "}
                {state.person1.gender}
              </span>
            </div>
            <div className="text-[#8D6FD1] text-sm mb-3">
              {compatibilityData.info1}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6F5945] font-semibold">
                {state.person2.name}
              </span>
              <span className="text-[#6F5945] text-sm">
                {state.person2.birthdate} ({state.person2.birthtime}) /{" "}
                {state.person2.gender}
              </span>
            </div>
            <div className="text-[#8D6FD1] text-sm mb-3">
              {compatibilityData.info2}
            </div>
          </div>

          {/* 스코어 바 */}
          <div className="mt-6 mb-6">
            <div className="text-right mb-1">
              <span className="text-[#EC6255] font-bold">
                {compatibilityData.score}
              </span>
              <span className="text-[#6F5945] text-sm ml-1">/ 100</span>
            </div>
            <div className="w-full h-4 bg-[#E9E4F0] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#990dfa] to-[#EC6255] rounded-full"
                variants={scoreBarVariants}
                initial="hidden"
                animate="visible"
              ></motion.div>
            </div>
          </div>

          {/* 상세 분석 결과 */}
          <div
            className="text-[#6F5945] mt-5"
            dangerouslySetInnerHTML={{ __html: compatibilityData.description }}
          />
        </motion.div>

        {/* 액션 버튼 */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          variants={itemVariants}
        >
          <Link href="/compatibility" className="flex-1">
            <motion.button
              className="w-full bg-[#6F5945] text-white px-4 py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              다시 테스트하기
            </motion.button>
          </Link>
          <motion.button
            className="flex-1 bg-[#990dfa] text-white px-4 py-3 rounded-lg font-medium"
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: "사주 궁합 테스트 결과",
                    text: `${state.person1.name}님과 ${state.person2.name}님의 궁합 점수: ${compatibilityData.score}점 (${compatibilityData.title})`,
                    url: window.location.href,
                  })
                  .catch((err) => {
                    console.error("공유 실패:", err);
                  });
              } else {
                navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => alert("링크가 복사되었습니다!"))
                  .catch((err) => console.error("링크 복사 실패:", err));
              }
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            결과 공유하기
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
