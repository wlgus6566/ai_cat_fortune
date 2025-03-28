import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 말풍선 메시지 상태별 배열
const speechMessages = {
  origin: [
    "오늘 운세를 점쳐볼까냥~?",
    "냥~ 기다리고 있었어!",
    "지금이야! 운세를 열어보라냥!",
  ],
  wink: [
    "마법이 느껴지는 하루가 될지도 몰라!🦄",
    "비밀스런 기운이 감도는걸?",
    "오늘 너, 뭔가 멋질 예정이야~✨",
  ],
  smile: [
    "고민이 있다면, 내가 들어줄게냥.",
    "웃으면 복이 온다냥! 😸",
    "기분 좋아지는 하루가 될 거야!",
  ],
  wonder: ["💫 오늘은 뭔가 특별해보인다냥~", "우주가 너를 주시하고 있어냥…👁"],
  up: ["별들이 속삭이고 있어, 열어보자!", "운명의 별이 반짝이고 있어~🌟"],
};

const clickMessages = [
  "으응? 날 만졌냥?",
  "좋은 일이 생기려나~? 🍀",
  "기분이 좋아질 것 같은 예감~✨",
  "냐하~ 간지럽다냥~ 🙈",
  "깜짝 놀랐잖아! 🙀",
  "내 털 만지기 금지다냥!",
  "지금 누른 거, 너지!?",
  "기분이 좋아질 것 같은 예감~✨",
];

// 이미지 경로 모음 (preload용)
const allCatImages = [
  "/new_cat.png",
  "/new_cat_smile.png",
  "/new_cat_up.png",
  "/new_cat_wink.png",
  "/new_cat_wonder.png",
  "/new_cat_angry.png",
  "/new_cat_left.png",
  "/new_cat_back.png",
];

// 이미지 사전 로딩 함수
const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(
    imageUrls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(); // 이제 이 resolve는 void로 인식됨
        })
    )
  );
};

// 고양이 상태에 따른 이미지 매핑
const getCatImage = (state: string) => {
  switch (state) {
    case "smile":
      return "/new_cat_smile.png";
    case "up":
      return "/new_cat_up.png";
    case "wink":
      return "/new_cat_wink.png";
    case "wonder":
      return "/new_cat_wonder.png";
    case "angry":
      return "/new_cat_angry.png";
    case "left":
      return "/new_cat_left.png";
    case "back":
      return "/new_cat_back.png";
    default:
      return "/new_cat.png";
  }
};

const WizardCat = ({
  hasViewedFortune,
  forcedMessage,
}: {
  hasViewedFortune: boolean;
  forcedMessage?: string;
}) => {
  const [catState, setCatState] =
    useState<keyof typeof speechMessages>("origin");
  const [bubbleMessage, setBubbleMessage] = useState("");
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [isReady, setIsReady] = useState(false); // 이미지 로딩 완료 여부

  // 상태별 랜덤 메시지 선택
  const getRandomMessage = () => {
    const states = Object.keys(
      speechMessages
    ) as (keyof typeof speechMessages)[];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const messages = speechMessages[randomState];
    const randomText = messages[Math.floor(Math.random() * messages.length)];
    return { state: randomState, text: randomText };
  };

  useEffect(() => {
    let animationTimer: NodeJS.Timeout;
    let initialDelay: NodeJS.Timeout;

    const startAnimation = () => {
      if (hasViewedFortune) return;

      const runAnimation = () => {
        const message = getRandomMessage();
        setCatState(message.state);
        setBubbleMessage(message.text);
        setShowSpeechBubble(true);

        animationTimer = setTimeout(() => {
          //setShowSpeechBubble(false);
          animationTimer = setTimeout(() => {
            setCatState("origin");
            animationTimer = setTimeout(runAnimation, 2000);
          }, 1000);
        }, 6000);
      };

      initialDelay = setTimeout(() => {
        const firstMessage = getRandomMessage();
        setCatState(firstMessage.state);
        setBubbleMessage(firstMessage.text);
        setShowSpeechBubble(true);

        animationTimer = setTimeout(() => {
          //setShowSpeechBubble(false);
          setCatState("origin");
          animationTimer = setTimeout(runAnimation, 2000);
        }, 6000);
      }, 2000);
    };

    // 이미지 preload 후 애니메이션 시작
    preloadImages(allCatImages).then(() => {
      setIsReady(true);
      startAnimation();
    });

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(initialDelay);
    };
  }, [hasViewedFortune]);
  useEffect(() => {
    if (forcedMessage) {
      setBubbleMessage(forcedMessage);
      setShowSpeechBubble(true);

      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 4000); // 말풍선 4초 보여주고 자동 숨김

      return () => clearTimeout(timer);
    }
  }, [forcedMessage]);
  // 클릭 시 상태 변경
  const handleCatClick = () => {
    const randomText =
      clickMessages[Math.floor(Math.random() * clickMessages.length)];

    // ✅ 이미지 상태는 변경하지 않음
    // ✅ 말풍선만 출력
    setBubbleMessage(randomText);
    setShowSpeechBubble(true);

    setTimeout(() => {
      setShowSpeechBubble(false);
    }, 4000);
  };

  if (!isReady) {
    return (
      <div className="text-center text-[#3B2E7E] text-lg mt-10">
        고양이 준비 중... 🐾
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end overflow-visible">
      {/* 말풍선 */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            className="absolute min-w-[250px] -top-20 left-1/2 transform -translate-x-1/2 bg-[#FFF7EA] border-[3px] border-[#FFD5A8] rounded-full px-6 py-3 shadow-xl z-10"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          >
            <div className="relative">
              <p className="text-[#3B2E7E] text-lg text-center font-semibold">
                {bubbleMessage}
              </p>
              {/* 🔽 삼각형 꼬리 */}
              <div
                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 
              w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] 
              border-l-transparent border-r-transparent border-t-[#FFF7EA]"
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 고양이 */}
      <motion.div
        className="w-50 h-50 mb-20 mr-20 relative cursor-pointer"
        animate={{
          rotate: [-2, 2, -2], // 기본 흔들림
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          type: "tween",
        }}
        onClick={handleCatClick}
      >
        <motion.img
          key="origin"
          src={getCatImage(catState)}
          alt="마법사 고양이"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};

export default WizardCat;
