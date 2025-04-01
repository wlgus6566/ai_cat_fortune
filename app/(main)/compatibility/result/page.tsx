"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import PageHeader from "@/app/components/PageHeader";

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
  const hour = Number.parseInt(time.split(":")[0], 10);
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
    자: "차분하고 계획적인 냥이! 말할 땐 논리정연하게 설명하는 걸 좋아한다옹~ 📘",
    축: "말수는 적지만 신중하고 따뜻한 타입이냥. 조용히 챙겨주는 배려왕 스타일~ 😽",
    인: "에너지 넘치는 냥이! 대화할 때 톡톡 튀는 아이디어를 마구 뿜어낸다옹! 🎨",
    묘: "말도 예쁘게 잘하고 잘 들어주는 냥이! 말 한마디에도 부드러움이 가득해~ 🌸",
    진: "직설적이고 현실적인 스타일! 돌직구 대화로 결단력도 있는 편이라옹~ 🛠️",
    사: "유연하게 휙휙~ 상황에 맞춰 말도 잘하고, 합의점을 잘 찾아가는 센스냥! 🌈",
    오: "열정냥이 등장! 감정 표현이 풍부해서 대화가 생생하고 활기 넘친다옹~ 🔥",
    미: "섬세하고 다정한 스타일~ 조화를 중요하게 생각해서 말할 때도 톤 조절 최고냥~ 🍵",
    신: "분석력 갑! 논리적으로 상황을 파악해서 해결책을 툭 던져주는 브레인냥이~ 🧠",
    유: "감성충만 냥이~ 섬세한 감정 캐치력이 좋아서 눈치 100단! 🌙",
    술: "믿음직한 냥이~ 차분하게 대화하면서 신뢰를 쌓아가는 타입이야~ 🐾",
    해: "마음이 넓은 고양이~ 다양한 관점을 포용하면서 누구와도 잘 지낸다옹! 🌊",
  };

  return (
    traits[hourZhi] ||
    "음냐… 독특하고 개성 넘치는 소통 스타일을 가진 냥이로군~! 😼"
  );
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
    return "정반대 시간대에 태어난 너희! 서로 완전 다른 스타일이지만, 그래서 더 찰떡같이 보완될 수 있다옹~ 🌓✨";
  } else if (diff === 3 || diff === 9) {
    return "서로에게 자극이 팡팡! 대화하면 아이디어도 톡톡, 감정도 두근두근~ 활발한 케미 기대된다냥! 🔥🐾";
  } else if (diff === 4 || diff === 8) {
    return "조금 다른 시선에서 세상을 바라보는 둘! 덕분에 서로에게 새로운 시각을 열어줄 수 있다옹~ 🌈👀";
  } else {
    return "비슷한 에너지의 시간대라 그런지 말도 잘 통하고, 자연스럽게 척척! 조화로운 소통이 가능한 커플이다옹~ 😽💬";
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
      ? "완전 찰떡궁합이냥! 💖"
      : score >= 70
      ? "꽤 잘 어울리는 편이야~ 😽"
      : "음... 노력형 궁합일지도? 😿";
  const image =
    score >= 85
      ? "/cat_love.png"
      : score >= 70
      ? "/cat_neutral.png"
      : "/cat_angry.png";

  // 음양 분석
  const yinYangMatch =
    g1.yinYang !== g2.yinYang
      ? "너희 둘은 음양이 딱 잘 맞는 조합이야!<br/>균형 최고다옹~ ⚖️"
      : "같은 성향이라 더 친해질 수도 있지만, 가끔 티격태격할 수도 있어냥~<br/>서로 노력하면 꽁냥꽁냥 가능! 💞";

  // 카테고리별 분석 정리
  const loveAnalysis =
    score >= 85
      ? "냥냥~ 서로 마음도 잘 통하고, 표현도 잘해서 알콩달콩 꿀 떨어지는 궁합이야! 같이 있으면 따뜻하고 포근한 느낌이 든다옹~ 😽"
      : score >= 70
      ? "조금 다르게 표현하는 편이라 가끔은 헷갈릴 수도 있지만, 서로를 이해하려고 노력하면 더 다정한 사이가 될 수 있어냥! 💌"
      : "헉, 감정 표현이나 연애 스타일이 좀 다를 수 있어서 오해가 생길지도 몰라냥. 하지만 진심으로 대화하면 천천히 가까워질 수 있어! 🐾";

  const marriageAnalysis =
    score > 80
      ? "따뜻하고 안정적인 결혼 생활이 기대되는 궁합이야~ 서로를 존중하고 이해하면 최고의 파트너가 될 수 있다냥! 🏡"
      : score > 60
      ? "성격 차이는 조금 있을 수도 있지만, 서로 맞춰가면 꽤 괜찮은 커플이 될 수 있어냥~ 💍"
      : "생활 패턴이나 생각 차이로 다툼이 생길 수도 있지만, 대화를 잘 하면 충분히 극복할 수 있어냥. 포기하지 말라옹! 🐱";

  const communicationStyle =
    hourTrait1 && hourTrait2
      ? `<ul class="list-disc pl-5">
        <li><strong>${hourZhi1}시:</strong> ${hourTrait1}</li>
        <li><strong>${hourZhi2}시:</strong> ${hourTrait2}</li>
      </ul>`
      : "서로의 표현 방식이 다를 수 있어 조율이 필요하다냥~! ";

  const financialCompatibility =
    g1.element === "금" || g2.element === "금"
      ? "오호~ 한 명은 돈을 다루는 감이 좋은 편이야! 실속 있는 커플이라고 볼 수 있지롱! 💰"
      : "재정 스타일이 조금 다를 수 있겠지만, 서로 맞춰보려는 마음이 있다면 잘 조율할 수 있다옹~ 💸";

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
  }의 만남이냥~! ${
    elementRelation[g1.element]?.includes(g2.element)
      ? "서로가 서로를 도와주는 상생 관계라서, 함께하면 좋은 기운이 팡팡 솟아난다옹! 🌈"
      : g1.element === g2.element
      ? "같은 속성이라서 안정적이고 편안한 관계가 될 수 있어냥~ 🐾"
      : "성질이 좀 달라서 티격태격할 수 있지만, 그만큼 서로를 보완할 수도 있다옹! 💫"
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
  const [currentStep, setCurrentStep] = useState(1); // 현재 슬라이드 단계
  const totalSteps = 8; // 전체 슬라이드 단계 수

  // 타이핑 애니메이션을 위한 상태
  const textLines = ["두근두근…", "두 사람의 궁합을", " 분석 중이다옹...🐾"];
  const [typedLines, setTypedLines] = useState<string[]>(["", "", ""]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentStep !== 1) return;

    const typingTimer = setInterval(() => {
      if (currentLineIndex < textLines.length) {
        const currentLine = textLines[currentLineIndex];

        if (currentCharIndex < currentLine.length) {
          // 현재 줄의 다음 문자 추가
          setTypedLines((prev) => {
            const newLines = [...prev];
            newLines[currentLineIndex] = currentLine.substring(
              0,
              currentCharIndex + 1
            );
            return newLines;
          });
          setCurrentCharIndex((prev) => prev + 1);
        } else {
          // 현재 줄 타이핑 완료, 다음 줄로 이동
          if (currentLineIndex < textLines.length - 1) {
            setCurrentLineIndex((prev) => prev + 1);
            setCurrentCharIndex(0);
          } else {
            // 모든 줄 타이핑 완료
            clearInterval(typingTimer);
            setTypingComplete(true);
          }
        }
      }
    }, 70); // 100ms마다 한 글자씩 추가

    return () => {
      clearInterval(typingTimer);
    };
  }, [currentStep, currentLineIndex, currentCharIndex, textLines]);

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

  // 오행에 따른 색상 결정
  const getElementColor = (element: string) => {
    switch (element) {
      case "목":
        return "#4CAF50"; // 초록색
      case "화":
        return "#FF5722"; // 빨간색
      case "토":
        return "#FFC107"; // 노란색
      case "금":
        return "#BDBDBD"; // 은색/회색
      case "수":
        return "#2196F3"; // 파란색
      default:
        return "#9C27B0"; // 기본 보라색
    }
  };

  // 오행에 따른 이미지 경로 결정
  const getElementImage = (element: string) => {
    switch (element) {
      case "목":
        return "/assets/images/wood.png";
      case "화":
        return "/assets/images/fire.png";
      case "토":
        return "/assets/images/earth.png";
      case "금":
        return "/assets/images/metal.png";
      case "수":
        return "/assets/images/water.png";
      default:
        return "/assets/images/wood.png";
    }
  };

  // 이전 슬라이드로 이동
  const goToPrevSlide = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 다음 슬라이드로 이동
  const goToNextSlide = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 슬라이드 변환 애니메이션 설정
  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.2,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.2,
      },
    }),
  };

  // 랭킹 퍼센트 계산 (임의의 값, 실제로는 DB에서 가져오거나 계산 로직 필요)
  const rankingPercent = 12;

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
            <button className="mt-4 bg-[#990dfa] text-white px-6 py-2 rounded-lg font-medium">
              돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {currentStep !== 1 ? (
        <>
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/bg_dark_bubble.png"
              alt="배경이미지"
              fill
              className="object-cover"
              priority
            />
          </div>
          <motion.div
            className="flex justify-center absolute bottom-14 left-25"
            animate={{
              rotate: [-2, 2, -2], // 기본 흔들림
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
          >
            <motion.img
              key="origin"
              src="/cat_book.png"
              alt="마법사 고양이"
              width={90}
              height={90}
              className="object-contain"
            />
          </motion.div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/bg_only_sky.png"
              alt="배경이미지"
              fill
              className="object-cover"
              priority
            />
          </div>
        </>
      )}

      <div className="max-w-md mx-auto relative z-10 px-4 pt-5">
        {/* 진행 상태 표시기 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#990dfa] to-[#FF6B6B] transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 배경 요소들 */}
        <div className="absolute top-20 right-10 w-16 h-16 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Image
              src="/assets/images/star.png"
              alt="별"
              width={60}
              height={60}
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* <div className="absolute bottom-40 left-5 w-12 h-12 opacity-20">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/assets/images/moon.png"
              alt="달"
              width={40}
              height={40}
              className="w-full h-full"
            />
          </motion.div>
        </div> */}
      </div>

      {/* 슬라이드 컨테이너 */}
      <div className="relative font-gothic w-full h-[calc(100vh-120px)] overflow-hidden flex justify-center items-center">
        {/* 각 슬라이드 */}
        <AnimatePresence initial={false} custom={currentStep}>
          {currentStep === 1 && (
            <motion.div
              key="slide1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-2xl text-center font-bold mb-6 text-white">
                  {typedLines.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < typedLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
              </motion.div>
              <motion.div
                animate={{
                  rotate: [-2, 2, -2], // 기본 흔들림
                }}
                transition={{
                  delay: 0.4,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                className="relative w-40 h-40"
              >
                <Image
                  src="/cat_book.png"
                  alt="고양이 캐릭터"
                  width={120}
                  height={120}
                  className="object-contain"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                  className="absolute top-0 right-0"
                >
                  <span className="text-4xl">❤️</span>
                </motion.div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                onClick={goToNextSlide}
                className="mt-10 px-10 py-3 bg-[#990dfa] rounded-full text-white hover:bg-[#8A0AE0] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                결과보기
              </motion.button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="slide2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                음양 조화 🌓
              </motion.h2>

              <motion.div
                className="flex items-center justify-center gap-10 -mt-[150px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center">
                  <p className="text-lg font-medium text-white mb-2">
                    {state.person1.name}
                  </p>
                  <div className="w-16 h-16 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
                    {compatibilityData.yinYang1 === "양" ? (
                      <span className="text-3xl">☀️</span>
                    ) : (
                      <span className="text-3xl">🌙</span>
                    )}
                  </div>
                  <p className="text-gray-300">
                    {compatibilityData.yinYang1}성
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium text-white mb-2">
                    {state.person2.name}
                  </p>
                  <div className="w-16 h-16 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
                    {compatibilityData.yinYang2 === "양" ? (
                      <span className="text-3xl">☀️</span>
                    ) : (
                      <span className="text-3xl">🌙</span>
                    )}
                  </div>
                  <p className="text-gray-300">
                    {compatibilityData.yinYang2}성
                  </p>
                </div>
              </motion.div>
              <motion.p
                className="text-center text-md px-8 text-gray-200 max-w-md mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                dangerouslySetInnerHTML={{
                  __html: compatibilityData.yinYangMatch,
                }}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="slide3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                오행 궁합 🌿
              </motion.h2>

              <motion.div
                className="flex items-center justify-center gap-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-center">
                  <p className="text-lg font-medium text-white mb-2">
                    {state.person1.name}
                  </p>
                  <div
                    className="w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getElementColor(
                        compatibilityData.element1
                      )}30`,
                    }}
                  >
                    <Image
                      src={
                        getElementImage(compatibilityData.element1) ||
                        "/placeholder.svg"
                      }
                      alt={compatibilityData.element1}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-300">
                    {compatibilityData.element1Name}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  {compatibilityData.element1 === compatibilityData.element2 ? (
                    <span className="text-3xl">🔄</span>
                  ) : (
                    <motion.svg
                      className="w-12 h-8"
                      viewBox="0 0 24 8"
                      fill="none"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <path
                        d="M0 4H22M22 4L18 1M22 4L18 7"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </motion.svg>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium text-white mb-2">
                    {state.person2.name}
                  </p>
                  <div
                    className="w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getElementColor(
                        compatibilityData.element2
                      )}30`,
                    }}
                  >
                    <Image
                      src={
                        getElementImage(compatibilityData.element2) ||
                        "/placeholder.svg"
                      }
                      alt={compatibilityData.element2}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-300">
                    {compatibilityData.element2Name}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="p-5 px-10 max-w-md text-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-center text-md text-gray-200">
                  {/* {compatibilityData.element1Name}과 <br />
                  {compatibilityData.element2Name}의 만남!
                  <br /> <br /> */}
                  {(() => {
                    const elementRelation: Record<string, string[]> = {
                      목: ["화"],
                      화: ["토"],
                      토: ["금"],
                      금: ["수"],
                      수: ["목"],
                    };

                    if (
                      elementRelation[compatibilityData.element1]?.includes(
                        compatibilityData.element2
                      )
                    ) {
                      return "서로가 서로를 북돋아주는 상생 관계라서, 같이 있으면 좋은 기운이 몽글몽글 피어난다옹~ 🌿";
                    } else if (
                      compatibilityData.element1 === compatibilityData.element2
                    ) {
                      return "안정적이고 찰떡궁합처럼 잘 지낼 수 있다냥~ 🐾";
                    } else {
                      return "조금은 다르긴 하지만, 그만큼 서로를 보완해주는 짝꿍이 될 수도 있다옹! 💫";
                    }
                  })()}
                </p>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="slide4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                연애 스타일 💘
              </motion.h2>

              <motion.div
                className="rounded-xl px-10 max-w-md mb-8 -mt-[100px]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg text-center">
                  {(() => {
                    const score = compatibilityData.score;
                    if (score >= 85) {
                      return "두 사람은 서로의 마음을 쏙쏙 잘 알아채고 표현도 찰떡이냥! 같이 있으면 포근하고 안정감 넘치는 꿀케미 커플이라구~ 💖";
                    } else if (score >= 70) {
                      return "연애 방식이 살~짝 다를 수 있지만, 공감 능력을 키우면 더욱 다정해질 수 있다냥! 서로를 향한 마음만은 진심이니까~ 🐾";
                    } else {
                      return "음냐… 감정 표현 스타일이나 연애에 대한 생각이 좀 달라서 티격태격할 수도 있지만! 진심 어린 대화와 배려가 있다면 분명 가까워질 수 있다옹~ 🐱💬";
                    }
                  })()}
                </p>
              </motion.div>

              <motion.div
                className="flex items-center justify-center gap-3 text-pink-500 text-4xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {["💕", "💖", "💓", "💗", "💘"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.7 + i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="slide5"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                소통 스타일 🗣️
              </motion.h2>

              <motion.div
                className="px-10 max-w-md w-full mb-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const hourZhi1 = getHourGanji(state.person1.birthtime);
                      const hourZhi2 = getHourGanji(state.person2.birthtime);
                      const hourTrait1 = getHourTrait(hourZhi1);
                      const hourTrait2 = getHourTrait(hourZhi2);

                      if (hourTrait1 && hourTrait2) {
                        return `<ul class="list-disc pl-5 space-y-3">
                            <li><strong>${hourZhi1}시 (${state.person1.name}):</strong> ${hourTrait1}</li>
                            <li><strong>${hourZhi2}시 (${state.person2.name}):</strong> ${hourTrait2}</li>
                          </ul>`;
                      } else {
                        return "서로의 표현 방식이 다를 수 있어 조율이 필요.";
                      }
                    })(),
                  }}
                />
              </motion.div>

              <motion.p
                className="text-center text-md p-10 pt-0 max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {getJiJiRelationship(
                  getHourGanji(state.person1.birthtime),
                  getHourGanji(state.person2.birthtime)
                )}
              </motion.p>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="slide6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                결혼 궁합💍
              </motion.h2>

              <motion.div
                className="relative w-full max-w-md mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-10">
                  <div className="w-64 h-64 rounded-full bg-yellow-400"></div>
                </div>

                <div className="p-10 relative z-10">
                  <p className="text-lg text-center font-gothic ">
                    {(() => {
                      const score = compatibilityData.score;
                      if (score > 80) {
                        return "서로를 보듬어주는 따뜻한 관계라서, 알콩달콩 평화로운 결혼 생활이 가능하다냥~ 함께 미래를 그리기에 찐으로 잘 어울리는 냥꾼 커플이야! 💖🏡";
                      } else if (score > 60) {
                        return "성향이 조금 다를 수 있지만, 서로 맞춰가면 따뜻한 집냥이 커플처럼 조화롭게 살아갈 수 있다옹~ ✨";
                      } else {
                        return "음냐… 생활 스타일이나 생각 차이로 싸울 수도 있지만, 진심 어린 대화와 배려가 있다면 충분히 극복 가능하다냥! 믿어봐~ 😿💬";
                      }
                    })()}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {["🏡", "💑", "👨‍👩‍👧"].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.7 + i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <span className="text-3xl">{emoji}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="slide7"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-0 text-2xl text-center font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                재정 궁합 💰
              </motion.h2>

              <motion.div
                className="p-12 max-w-md mb-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg ">
                  {compatibilityData.element1 === "금" ||
                  compatibilityData.element2 === "금"
                    ? "오오~ 한 사람은 재물 냄새를 귀신같이 잘 맡는 냥이야! 실속 있고 똑부러진 스타일이라 둘이 함께라면 든든한 재정 궁합이랄까? 💰🐱"
                    : "서로 돈 쓰는 스타일이 다를 수 있어서, 가끔은 티격태격할지도 몰라. 하지만 서로의 생각을 잘 이해하려고 하면 충분히 조율할 수 있다옹~ 💸💬"}
                </p>
              </motion.div>

              <motion.div
                className="flex items-center justify-center gap-6 text-amber-400 text-4xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {["💵", "💳", "🏦", "📊"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.7 + i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* 마지막 슬라이드 (요약) */}
          {currentStep === 8 && (
            <motion.div
              key="slide8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
            >
              <motion.h2
                className="absolute top-20 text-2xl text-center font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                궁합 결과
                <p className="text-gray-300 text-xl ">
                  {compatibilityData.title}
                </p>
              </motion.h2>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#990dfa] to-[#FF6B6B] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#30154E] flex items-center justify-center text-4xl font-bold">
                    {compatibilityData.score}
                  </div>
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 bg-yellow-500 text-black font-bold rounded-full w-12 h-12 flex items-center justify-center text-sm"
                  initial={{ rotate: -15 }}
                  animate={{ rotate: 15 }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    duration: 1.5,
                  }}
                >
                  {rankingPercent}%
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-8 mb-8"
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getElementColor(
                        compatibilityData.element1
                      )}30`,
                    }}
                  >
                    <Image
                      src={
                        getElementImage(compatibilityData.element1) ||
                        "/placeholder.svg"
                      }
                      alt={compatibilityData.element1}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-white">{state.person1.name}</p>
                </div>

                <div className="flex items-center">
                  <span className="text-2xl">❤️</span>
                </div>

                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getElementColor(
                        compatibilityData.element2
                      )}30`,
                    }}
                  >
                    <Image
                      src={
                        getElementImage(compatibilityData.element2) ||
                        "/placeholder.svg"
                      }
                      alt={compatibilityData.element2}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-white">{state.person2.name}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                <button
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "사주 궁합 테스트 결과",
                          text: `${state.person1.name}님과 ${state.person2.name}님의 궁합 점수: ${compatibilityData.score}점`,
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
                >
                  결과 공유
                </button>

                <Link href="/compatibility">
                  <button className="px-4 py-2 bg-gradient-to-r from-[#990dfa] to-[#FF6B6B] text-white rounded-lg hover:opacity-90 transition-all">
                    다시 테스트
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 네비게이션 버튼 */}
      {currentStep !== 1 && (
        <div className="flex justify-between absolute left-4 right-4 top-10">
          <button
            onClick={goToPrevSlide}
            disabled={currentStep === 1}
            className={`p-3 rounded-full ${
              currentStep === 1
                ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={goToNextSlide}
            disabled={currentStep === totalSteps}
            className={`p-3 rounded-full ${
              currentStep === totalSteps
                ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
