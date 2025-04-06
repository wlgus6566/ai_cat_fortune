import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "./ChatMessage";
import {
  ChatMessage as ChatMessageType,
  ChatStep,
  ConcernType,
  InputMode,
  UserProfile,
} from "../type/types";
import { CONCERN_TYPES, DETAILED_CONCERNS } from "../data";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CONCERN_TYPES_EN, DETAILED_CONCERNS_EN } from "../data.en"; // 영어 데이터 필요 시 사용
import { useTalisman } from "../contexts/TalismanContext";
import { toast, Toaster } from "react-hot-toast";

// 직접 입력창 컴포넌트
const ChatInput = ({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="고민을 직접 입력해보세요..."
        className="flex-1 px-4 py-2 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className={`px-4 py-2 rounded-full ${
          !input.trim() || disabled ? "bg-gray-300" : "bg-purple-600 text-white"
        }`}
      >
        전송
      </button>
    </form>
  );
};

// FortuneChat 인터페이스 정의
interface FortuneChatProps {
  userName: string;
  userProfile: UserProfile;
  readOnly?: boolean;
  initialMessages?: ChatMessageType[];
}

// ChatMessageType에 isFortuneResult 속성을 추가하기 위한 타입 확장
interface FortuneMessage extends ChatMessageType {
  isFortuneResult?: boolean;
}

export default function FortuneChat({
  userName,
  userProfile,
  readOnly = false,
  initialMessages = [],
}: FortuneChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState<ChatStep>(
    initialMessages.length > 0 ? "FORTUNE_RESULT" : "INITIAL"
  );
  const [selectedConcern, setSelectedConcern] = useState<ConcernType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [initialMessagesComplete, setInitialMessagesComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const { openTalisman } = useTalisman();

  // 4단계 세부 고민 선택을 위한 상태
  // 선택 모드 또는 직접 입력 모드를 저장하는 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inputMode, setInputMode] = useState<InputMode>("SELECTION");
  const [detailLevel1, setDetailLevel1] = useState<string | null>(null);
  const [detailLevel2, setDetailLevel2] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [detailLevel3, setDetailLevel3] = useState<string | null>(null);

  // 부적 생성 관련 상태
  const [showTalismanButton, setShowTalismanButton] = useState(false);
  const [currentConcernText, setCurrentConcernText] = useState("");
  const [isGeneratingTalisman, setIsGeneratingTalisman] = useState(false);
  const [talismanError, setTalismanError] = useState<string | null>(null);

  // 부적 생성 후 Context API로 처리하므로 상태만 유지하고 렌더링에는 사용하지 않음
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTalismanPopup, setShowTalismanPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [talismanImageUrl, setTalismanImageUrl] = useState<string | null>(null);
  // 번역된 문구를 저장하는 상태 (부적 생성 후 Context API에 전달)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [translatedPhrase, setTranslatedPhrase] = useState<string | null>(null);
  // 부적 ID를 저장하는 상태 추가
  const [talismanId, setTalismanId] = useState<string | null>(null);
  // 메시지 리액션 관련 상태
  const [messageReactions, setMessageReactions] = useState<
    Record<string, string[]>
  >({});
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);

  // 채팅창 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지가 변경될 때 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 입력 영역이 표시될 때도 스크롤
  useEffect(() => {
    if (
      currentStep === "DIRECT_INPUT" ||
      (currentOptions.length > 0 && initialMessagesComplete && !typingMessageId)
    ) {
      scrollToBottom();
    }
  }, [currentStep, currentOptions, initialMessagesComplete, typingMessageId]);

  // 환영 메시지 배열 - useMemo로 감싸서 의존성 배열 경고 해결
  const welcomeMessages = useMemo(
    () => [
      {
        text: `안냥! ${userName}냥, 난 고민을 들어주는 고민마스터 '묘묘' 다냥! 😺`,
      },
      { text: "너의 비밀은 꼭꼭 지켜줄 테니 안심하라냥!" },
      { text: "내가 따뜻한 조언과 귀여운 응원을 보내줄 거라냥~! 💖" },
      { text: "어떤 고민이 있나냥! 말해봐라냥! 😽" },
      { imageUrl: "/new_cat_close_eyes.png" }, // 이미지만 있는 메시지로 분리
    ],
    [userName]
  );

  // 타이핑 효과를 위한 함수
  const addMessageWithTypingEffect = useCallback(
    (
      messageObj: {
        text?: string;
        imageUrl?: string;
        isFortuneResult?: boolean;
      },
      delay: number = 1000,
      typingDelay: number = 1200
    ) => {
      return new Promise<void>((resolve) => {
        // 문자열 또는 객체를 처리할 수 있도록 변환
        const text =
          typeof messageObj === "string" ? messageObj : messageObj.text || "";
        const imageUrl =
          typeof messageObj === "object" ? messageObj.imageUrl : undefined;
        const isFortuneResult =
          typeof messageObj === "object" ? messageObj.isFortuneResult : false;

        // 먼저 타이핑 중인 메시지 추가
        const typingId = uuidv4();
        const typingMessage: ChatMessageType = {
          id: typingId,
          sender: "system",
          text: "...",
          isFortuneResult,
        };

        setTypingMessageId(typingId);
        setMessages((prev) => [...prev, typingMessage]);
        scrollToBottom();

        // 적절한 타이핑 시간 계산 (텍스트 길이에 비례)
        const calculatedTypingDelay = Math.max(
          1000,
          Math.min(typingDelay, text.length * 40)
        );

        // 타이핑 효과를 표시하는 시간
        setTimeout(() => {
          // 일정 시간 후 실제 메시지로 교체
          setTypingMessageId(null);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === typingId
                ? { ...msg, text, imageUrl, isFortuneResult }
                : msg
            )
          );
          scrollToBottom();

          // 메시지 표시 후 다음 작업을 위한 딜레이
          setTimeout(() => {
            resolve();
          }, delay);
        }, calculatedTypingDelay);
      });
    },
    []
  );

  // 초기 메시지 설정
  useEffect(() => {
    // Strict Mode로 인한 이중 실행 방지
    if (initializedRef.current) return;
    initializedRef.current = true;

    const showWelcomeMessages = async () => {
      // 초기화
      setMessages([]);
      setCurrentOptions([]);

      // 약간의 딜레이 후 시작
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 환영 메시지를 순차적으로 표시
      for (let i = 0; i < welcomeMessages.length; i++) {
        // 메시지 길이에 따라 타이핑 시간과 표시 시간 조정
        const typingDelay = 300; // 타이핑 시간
        const readDelay = 300; // 읽는 시간

        await addMessageWithTypingEffect(
          welcomeMessages[i],
          readDelay,
          typingDelay
        );
      }

      // 선택 옵션과 직접 입력 옵션 제공
      setCurrentOptions([...CONCERN_TYPES, "직접 입력하기"]);
      setCurrentStep("CONCERN_SELECT");
      setInitialMessagesComplete(true);
    };

    showWelcomeMessages();

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      setTypingMessageId(null);
    };
  }, [addMessageWithTypingEffect, welcomeMessages]);

  // 부적 이미지 생성 함수 수정
  const handleGenerateTalisman = async () => {
    if (!currentConcernText || isGeneratingTalisman) return;

    setIsGeneratingTalisman(true);
    setTalismanError(null);

    try {
      // 부적 생성 진행 중 메시지 추가
      const processingMessage = { text: "행운의 부적을 만들고 있다냥..🧧" };
      await addMessageWithTypingEffect(processingMessage, 500, 800);

      console.log("부적 생성 요청 전송:", {
        concern: currentConcernText,
        userName: userName,
        userId: userProfile.id,
      });

      // 부적 이미지 생성 API 호출 (사용자 정보 포함)
      const talismanResponse = await fetch("/api/replicate/talisman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concern: currentConcernText,
          userName: userName,
          userId: userProfile.id, // 유저 ID 전달 (Supabase Storage 저장용)
        }),
      });

      const data = await talismanResponse.json();
      console.log("부적 생성 응답:", data);

      if (!data.success && !data.imageUrl) {
        throw new Error(data.error?.message || "이미지 생성에 실패했습니다");
      }

      // 이미지 URL 저장
      const imageUrl = data.storedImageUrl || data.imageUrl;
      setTalismanImageUrl(imageUrl);

      // 부적 ID 저장
      if (data.id) {
        setTalismanId(data.id);
        console.log("부적 ID 저장:", data.id);
      } else {
        console.warn("부적 ID가 응답에 없습니다.");
      }

      const translatedPhrase = data.translatedPhrase;
      setTranslatedPhrase(translatedPhrase);

      // 부적 생성 완료 메시지
      const successMessage = {
        text: "행운의 부적이 만들어다냥! 지금 확인보라옹~🐾",
      };
      await addMessageWithTypingEffect(successMessage, 500, 800);

      // 팝업 표시 (Context API 사용)
      setShowTalismanPopup(true);
      openTalisman({
        imageUrl: imageUrl,
        userName: userName,
        title: "행운의 부적🧧",
        darkMode: false,
        translatedPhrase: translatedPhrase,
      });

      // 부적 생성 버튼 숨기기 (한 번만 생성 가능하도록)
      setShowTalismanButton(false);
    } catch (error) {
      console.error("부적 생성 오류:", error);
      setTalismanError(
        error instanceof Error
          ? error.message
          : "부적 생성 중 오류가 발생했습니다."
      );

      // 에러 메시지 추가
      const errorMessage = {
        text: "부적 생성에 실패했어요. 다시 시도해주세요.",
      };
      await addMessageWithTypingEffect(errorMessage, 500, 800);
    } finally {
      setIsGeneratingTalisman(false);
    }
  };

  // 운세 텍스트를 단락별로 나누어 메시지로 추가하는 함수
  const handleFortuneTextByParagraphs = async (
    fortuneText: string,
    isLastMessageLoading: boolean = true
  ) => {
    // 이미 로딩 메시지가 있다면 제거
    if (isLastMessageLoading) {
      setMessages((prev) => [...prev.slice(0, -1)]);
    }

    // 텍스트를 문단으로 분리 (\n\n 기준)
    const paragraphs = fortuneText.split("\n\n").filter((p) => p.trim() !== "");

    // 각 문단에 대해 타이핑 효과 적용
    for (let i = 0; i < paragraphs.length; i++) {
      const isLastParagraph = i === paragraphs.length - 1;
      let paragraphText = paragraphs[i].trim();

      // 마지막 문단에만 고양이 이모티콘 추가
      if (isLastParagraph) {
        paragraphText += " 😽";
      }

      await addMessageWithTypingEffect(
        {
          text: paragraphText,
          isFortuneResult: isLastParagraph, // 마지막 문단에만 운세 결과 메시지임을 표시
        },
        isLastParagraph ? 1000 : 500, // 마지막 문단은 더 오래 보여줌
        Math.min(1200, paragraphText.length * 30) // 문단 길이에 비례한 타이핑 시간
      );
    }

    // 부적 생성 버튼 표시 및 다시 상담하기 옵션 추가
    setShowTalismanButton(true);
    setTimeout(() => {
      setCurrentOptions(["다시 상담하기"]);
      setCurrentStep("FORTUNE_RESULT");
    }, 1000);
  };

  // 직접 입력 처리 함수
  const handleDirectInput = async (text: string) => {
    if (typingMessageId) return; // 타이핑 중이면 무시

    // inputMode 변수 활용 - 직접 입력 모드로 변경
    setInputMode("DIRECT_INPUT");

    // 사용자 메시지 추가
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      sender: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    scrollToBottom();

    // 고민 텍스트 저장
    setCurrentConcernText(text);

    // 로딩 시작
    setIsLoading(true);
    setCurrentOptions([]);

    // 잠시 딜레이 후 응답
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 로딩 메시지 추가 (타이핑 효과 적용)
    await addMessageWithTypingEffect(
      { text: "고민을 살펴보고 있다냥..." },
      500,
      1000
    );

    try {
      // OpenAI API 호출 - 직접 입력 모드 (사용자 정보 포함)
      const response = await fetch("/api/fortune/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: text,
          userName: userName,
          userProfile: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      const fortuneText = data.fortune;

      // 운세 텍스트를 단락별로 처리
      await handleFortuneTextByParagraphs(fortuneText);
    } catch (error: unknown) {
      console.error(
        "오류 발생:",
        error instanceof Error ? error.message : "알 수 없는 오류"
      );

      // 마지막 메시지를 에러 메시지로 교체
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: uuidv4(),
          sender: "system",
          text: "죄송합니다, 질문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
      scrollToBottom();

      // 다시 상담하기 옵션 추가
      setTimeout(() => {
        setCurrentOptions(["다시 상담하기"]);
        setCurrentStep("FORTUNE_RESULT");
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자가 옵션을 선택했을 때의 핸들러
  const handleOptionSelect = async (option: string) => {
    if (typingMessageId || !initialMessagesComplete) return; // 타이핑 중이거나 초기 메시지가 완료되지 않았으면 무시

    setSelectedOption(option);
    // 🚀 한글 → 영어 변환
    // 잠시 강조 효과를 보여준 후 다음 단계로 진행
    setTimeout(() => {
      // 사용자 선택 메시지 추가
      const userMessage: ChatMessageType = {
        id: uuidv4(),
        sender: "user",
        text: option,
      };
      setMessages((prev) => [...prev, userMessage]);
      scrollToBottom();

      if (option === "직접 입력하기") {
        // 직접 입력 모드로 전환 - inputMode 활용
        setInputMode("DIRECT_INPUT");
        setCurrentStep("DIRECT_INPUT");
        setCurrentOptions([]);
        addMessageWithTypingEffect(
          { text: "자유롭게 이야기해주라냥!" },
          0,
          1000
        );
      } else if (option === "다시 상담하기") {
        resetChat();
      } else {
        switch (currentStep) {
          case "CONCERN_SELECT":
            handleConcernSelect(option as ConcernType);
            break;
          case "DETAIL_LEVEL_1_SELECT":
            handleDetailLevel1Select(option);
            break;
          case "DETAIL_LEVEL_2_SELECT":
            handleDetailLevel2Select(option);
            break;
          case "DETAIL_LEVEL_3_SELECT":
            handleDetailLevel3Select(option);
            break;
          default:
            break;
        }
      }

      setSelectedOption(null);
    }, 300);
  };

  // 고민 유형 선택 처리 (1단계)
  const handleConcernSelect = async (concern: ConcernType) => {
    setSelectedConcern(concern);
    setCurrentOptions([]);

    // 잠시 딜레이 후 응답
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 세부 고민 메시지 추가 (타이핑 효과 적용)
    const responseText = {
      text: `${concern}에 관한 고민이구냥. 좀 더 구체적으로 알려달라냥!`,
    };
    await addMessageWithTypingEffect(responseText, 800, 1500);

    // 1단계 세부 고민 옵션 제공
    const level1Options = Object.keys(DETAILED_CONCERNS[concern].level1);
    setCurrentOptions(level1Options);
    setCurrentStep("DETAIL_LEVEL_1_SELECT");
  };

  // 1단계 세부 고민 선택 처리
  const handleDetailLevel1Select = async (option: string) => {
    setDetailLevel1(option);
    setCurrentOptions([]);

    // 잠시 딜레이 후 응답
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2단계 세부 고민 메시지 추가
    const responseText = {
      text: `${option}에 대해 더 구체적인 상황을 알려달라냥!`,
    };
    await addMessageWithTypingEffect(responseText, 800, 1200);

    // 2단계 세부 고민 옵션 제공
    if (selectedConcern) {
      const level2Options = Object.keys(
        DETAILED_CONCERNS[selectedConcern].level1[option].level2
      );
      setCurrentOptions(level2Options);
      setCurrentStep("DETAIL_LEVEL_2_SELECT");
    }
  };

  // 2단계 세부 고민 선택 처리
  const handleDetailLevel2Select = async (option: string) => {
    setDetailLevel2(option);
    setCurrentOptions([]);

    // 잠시 딜레이 후 응답
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3단계 세부 고민 메시지 추가
    const responseText = {
      text: `${option}에 대해 마지막으로 좀 더 자세히 알려달라냥!`,
    };
    await addMessageWithTypingEffect(responseText, 800, 1200);

    // 3단계 세부 고민 옵션 제공
    if (selectedConcern && detailLevel1) {
      const level3Options =
        DETAILED_CONCERNS[selectedConcern].level1[detailLevel1].level2[option];
      setCurrentOptions(level3Options);
      setCurrentStep("DETAIL_LEVEL_3_SELECT");
    }
  };

  // 3단계 세부 고민 선택 처리
  const handleDetailLevel3Select = async (option: string) => {
    setDetailLevel3(option);
    setIsLoading(true);
    setCurrentOptions([]);

    // 고민 텍스트 저장 - 부적 생성에 사용
    if (selectedConcern && detailLevel1 && detailLevel2) {
      setCurrentConcernText(
        `${selectedConcern}, ${detailLevel1}, ${detailLevel2}, ${option}`
      );
    }

    // 잠시 딜레이 후 응답
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 로딩 메시지 추가
    await addMessageWithTypingEffect(
      { text: "운세를 살펴보고 있다냥..." },
      1000,
      1200
    );

    try {
      // OpenAI API 호출 (사용자 정보 포함)
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concern: selectedConcern,
          detailLevel1,
          detailLevel2,
          detailLevel3: option,
          userName: userName,
          userProfile: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      const fortuneText = data.fortune;

      // 운세 텍스트를 단락별로 처리
      await handleFortuneTextByParagraphs(fortuneText);
    } catch (error: unknown) {
      console.error(
        "운세 생성 오류:",
        error instanceof Error ? error.message : "알 수 없는 오류"
      );

      // 마지막 메시지를 에러 메시지로 교체
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: uuidv4(),
          sender: "system",
          text: "죄송합니다, 운세를 볼 수 없습니다. 다시 시도해주세요.",
        },
      ]);
      scrollToBottom();

      // 오류 발생 시에도 '다시 상담하기' 옵션 추가
      setTimeout(() => {
        setCurrentOptions(["다시 상담하기"]);
      }, 1000);
    } finally {
      setIsLoading(false);
      setCurrentStep("FORTUNE_RESULT");
    }
  };

  // 다시 상담하기 처리
  const resetChat = async () => {
    // 초기화 플래그 리셋
    initializedRef.current = false;

    setCurrentStep("INITIAL");
    setSelectedConcern(null);
    setCurrentOptions([]);
    setInitialMessagesComplete(false);
    setMessages([]);
    setInputMode("SELECTION");
    setDetailLevel1(null);
    setDetailLevel2(null);
    setDetailLevel3(null);
    setShowTalismanButton(false);
    setCurrentConcernText("");
    setTalismanError(null);
    setTalismanImageUrl(null);
    setTranslatedPhrase(null);
    setTalismanId(null); // 부적 ID 초기화 추가
    // 다시 초기화 플래그 설정 (이중 실행 방지)
    initializedRef.current = true;

    // 약간의 딜레이 후 시작
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 환영 메시지를 다시 표시
    for (let i = 0; i < welcomeMessages.length; i++) {
      // 메시지 길이에 따라 타이핑 시간과 표시 시간 조정
      const typingDelay = 200; // 타이핑 시간
      const readDelay = 200; // 읽는 시간

      await addMessageWithTypingEffect(
        welcomeMessages[i],
        readDelay,
        typingDelay
      );
    }

    setCurrentOptions([...CONCERN_TYPES, "직접 입력하기"]);
    setCurrentStep("CONCERN_SELECT");
    setInitialMessagesComplete(true);
  };

  // 사용자와의 상담 세션이 끝나면 상담 내역 저장
  const saveConsultation = async () => {
    if (messages.length === 0) return;

    // 상담 제목 (사용자의 첫 고민 메시지 또는 선택한 고민)
    const title = currentConcernText || "묘묘와의 상담";

    console.log("상담 내역 저장 준비:", {
      title,
      messageCount: messages.length,
      talismanId,
    });

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          messages,
          talismanId: talismanId, // 실제 부적 ID 사용
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "상담 내역 저장에 실패했습니다.");
      }

      console.log("상담 내역이 성공적으로 저장되었습니다:", responseData);
    } catch (error) {
      console.error("상담 내역 저장 오류:", error);
    }
  };

  // 채팅 종료 시 상담 내역 저장
  const handleSaveConsultation = async () => {
    await saveConsultation();
  };
  const handleEndChat = async () => {
    await resetChat();
  };

  // 리액션 토글 핸들러
  const handleReaction = (messageId: string, reaction: string) => {
    setMessageReactions((prev) => {
      const currentReactions = prev[messageId] || [];
      const exists = currentReactions.includes(reaction);

      if (exists) {
        // 이미 반응이 있으면 제거
        return {
          ...prev,
          [messageId]: currentReactions.filter((r) => r !== reaction),
        };
      } else {
        // 반응이 없으면 추가
        return {
          ...prev,
          [messageId]: [...currentReactions, reaction],
        };
      }
    });
  };

  // 특정 메시지 저장 핸들러 - 버튼 숨김 추가
  const handleSaveMessage = async (messageId: string) => {
    await handleSaveConsultation();

    // 저장 성공 메시지 표시
    toast.success(
      "상담이 간직되었다냥! 상담내용은 상담보관함에서 확인해보라냥~",
      {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#f0f9ff",
          color: "#0369a1",
          border: "1px solid #38bdf8",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#0ea5e9",
          secondary: "#ffffff",
        },
      }
    );
    setSavedMessageId(messageId);
  };

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-200px)]">
      <Toaster />
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto my-4 p-2">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <ChatMessage
              message={message}
              isTyping={message.id === typingMessageId}
            />

            {/* 시스템 메시지에만 리액션 UI 표시 */}
            {message.sender === "system" &&
              !typingMessageId &&
              !isLoading &&
              message.id !== typingMessageId &&
              // 메시지에 isFortuneResult 플래그가 있는 경우에만 표시
              (message as FortuneMessage).isFortuneResult && (
                <div className="flex items-center justify-end mr-20 mt-1 space-x-2">
                  {/* 하트 리액션 버튼 */}
                  <button
                    onClick={() => handleReaction(message.id, "heart")}
                    className={` reaction-btn p-1 rounded-full transition-all ${
                      messageReactions[message.id]?.includes("heart")
                        ? "bg-red-50"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label="좋아요"
                  >
                    {messageReactions[message.id]?.includes("heart") ? (
                      <div className="w-8 h-8 flex items-center justify-center text-red-500">
                        <span>❤️</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* 간직하기(저장) 버튼 - 저장되지 않은 경우에만 표시 */}
                  {savedMessageId !== message.id && (
                    <button
                      onClick={() => handleSaveMessage(message.id)}
                      className={`flex items-center justify-center reaction-btn p-1 pr-3 rounded-full transition-all bg-white text-gray-400`}
                      aria-label="상담 간직하기"
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <span className="text-xs ml-1">상담 간직하기</span>
                    </button>
                  )}
                </div>
              )}
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isLoading && !typingMessageId && (
          <div className="flex justify-center py-2">
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600"></div>
            <div
              className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {/* 부적 생성 버튼 */}
      {showTalismanButton && !readOnly && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleGenerateTalisman}
            disabled={isGeneratingTalisman}
            className={`
              px-5 py-2.5 w-full rounded-lg flex items-center justify-center 
              ${
                isGeneratingTalisman
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              }
              transition-all duration-300 shadow-md hover:shadow-lg
            `}
          >
            {isGeneratingTalisman ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                <span>부적 생성 중...</span>
              </div>
            ) : (
              <>
                <span className="mr-2 text-xl">🧧</span>
                <span>행운의 부적 받기</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {talismanError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {talismanError}
        </div>
      )}

      {/* 입력 영역 (읽기 전용이 아닐 때만 표시) */}
      {!readOnly && (
        <>
          {currentStep === "DIRECT_INPUT" && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <ChatInput
                onSend={handleDirectInput}
                disabled={!!typingMessageId || isLoading}
              />
            </div>
          )}

          {currentOptions.length > 0 &&
            initialMessagesComplete &&
            !typingMessageId &&
            currentStep !== "DIRECT_INPUT" && (
              <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {currentOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={!!typingMessageId}
                      className={`
                        px-4 py-2 rounded-full border transition-all duration-300
                         ${
                           selectedOption === option
                             ? "keyword-selected border-purple-500 shadow-md"
                             : "border-purple-300 hover:bg-purple-50"
                         }
                        ${option == "직접 입력하기" ? "bg-purple-300" : ""}
                        ${
                          typingMessageId ? "opacity-50 cursor-not-allowed" : ""
                        }
                      `}
                    >
                      {option}
                    </button>
                  ))}
                  {/* 채팅 종료 버튼 */}
                  {messages.length > 0 &&
                    currentStep === "FORTUNE_RESULT" &&
                    !readOnly && (
                      <button
                        onClick={handleEndChat}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                      >
                        상담 종료
                      </button>
                    )}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
