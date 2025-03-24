import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import TalismanPopup from './TalismanPopup';
import { ChatMessage as ChatMessageType, ChatStep, ConcernType, InputMode, UserProfile } from '../type/types';
import { CONCERN_TYPES, DETAILED_CONCERNS } from '../data';
import { CONCERN_TYPES_EN, DETAILED_CONCERNS_EN } from '../data.en'; // ✅ 영어 데이터 불러오기
// 직접 입력창 컴포넌트
const ChatInput = ({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
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
          !input.trim() || disabled ? 'bg-gray-300' : 'bg-purple-600 text-white'
        }`}
      >
        전송
      </button>
    </form>
  );
};

interface FortuneChatProps {
  userName: string;
  userProfile: UserProfile;
}

export default function FortuneChat({ userName, userProfile }: FortuneChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>('INITIAL');
  const [selectedConcern, setSelectedConcern] = useState<ConcernType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [initialMessagesComplete, setInitialMessagesComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  
  // 4단계 세부 고민 선택을 위한 상태
  // inputMode는 JSX 조건부 렌더링에 사용 (linter 경고 수정)
  const [inputMode, setInputMode] = useState<InputMode>('SELECTION');
  const [detailLevel1, setDetailLevel1] = useState<string | null>(null);
  const [detailLevel2, setDetailLevel2] = useState<string | null>(null);
  // detailLevel3는 API 호출에 사용되므로 유지 (linter 경고 억제)
  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars
  const [detailLevel3, setDetailLevel3] = useState<string | null>(null);
  
  // 부적 생성 관련 상태
  const [showTalismanButton, setShowTalismanButton] = useState(false);
  const [currentConcernText, setCurrentConcernText] = useState('');
  const [isGeneratingTalisman, setIsGeneratingTalisman] = useState(false);
  const [talismanError, setTalismanError] = useState<string | null>(null);
  
  // 부적 팝업 관련 상태
  const [showTalismanPopup, setShowTalismanPopup] = useState(false);
  const [talismanImageUrl, setTalismanImageUrl] = useState<string | null>(null);
  
  // 채팅창 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 환영 메시지 배열
  const welcomeMessages = [
    `안냥! ${userName}냥, 난 고민을 들어주는 고민마스터 '묘묘' 다냥! 😺`,
    '너의 비밀은 꼭꼭 지켜줄 테니 안심하라냥!',
    '내가 따뜻한 조언과 귀여운 응원을 보내줄 거라냥~! 💖',
    '어떤 고민이 있나냥! 말해봐라냥! 😽'
  ];
  
  // 타이핑 효과를 위한 함수
  const addMessageWithTypingEffect = useCallback((text: string, delay: number = 1000, typingDelay: number = 1200) => {
    return new Promise<void>((resolve) => {
      // 먼저 타이핑 중인 메시지 추가
      const typingId = uuidv4();
      const typingMessage: ChatMessageType = {
        id: typingId,
        sender: 'system',
        text: '...'
      };
      
      setTypingMessageId(typingId);
      setMessages(prev => [...prev, typingMessage]);
      scrollToBottom();
      
      // 적절한 타이핑 시간 계산 (텍스트 길이에 비례)
      const calculatedTypingDelay = Math.max(1000, Math.min(typingDelay, text.length * 40));
      
      // 타이핑 효과를 표시하는 시간
      setTimeout(() => {
        // 일정 시간 후 실제 메시지로 교체
        setTypingMessageId(null);
        setMessages(prev => prev.map(msg => 
          msg.id === typingId 
            ? { ...msg, text }
            : msg
        ));
        scrollToBottom();
        
        // 메시지 표시 후 다음 작업을 위한 딜레이
        setTimeout(() => {
          resolve();
        }, delay);
      }, calculatedTypingDelay);
    });
  }, []);
  
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 환영 메시지를 순차적으로 표시
      for (let i = 0; i < welcomeMessages.length; i++) {
        // 메시지 길이에 따라 타이핑 시간과 표시 시간 조정
        const typingDelay = 300; // 타이핑 시간
        const readDelay = 300; // 읽는 시간
        
        await addMessageWithTypingEffect(welcomeMessages[i], readDelay, typingDelay);
      }
      
      // 선택 옵션과 직접 입력 옵션 제공
      setCurrentOptions([...CONCERN_TYPES, '직접 입력하기']);
      setCurrentStep('CONCERN_SELECT');
      setInitialMessagesComplete(true);
    };
    
    showWelcomeMessages();
    
    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      setTypingMessageId(null);
    };
  }, [addMessageWithTypingEffect, welcomeMessages]);
  
  // 부적 이미지 생성 함수
  const handleGenerateTalisman = async () => {
    if (!currentConcernText || isGeneratingTalisman) return;
    
    setIsGeneratingTalisman(true);
    setTalismanError(null);
    
    try {
      // 부적 생성 진행 중 메시지 추가
      const processingMessage = '행운의 부적을 만들고 있어요...';
      await addMessageWithTypingEffect(processingMessage, 500, 800);
      
      // 부적 이미지 생성 API 호출 (사용자 정보 포함)
      const talismanResponse = await fetch('/api/replicate/talisman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          concern: currentConcernText,
          userName: userName,
          userId: userProfile.id // 유저 ID 전달 (Supabase Storage 저장용)
        }),
      });
      
      const data = await talismanResponse.json();
      
      if (!data.success && !data.imageUrl) {
        throw new Error(data.error?.message || '이미지 생성에 실패했습니다');
      }
      
      // 이미지 URL 저장 (팝업용)
      setTalismanImageUrl(data.imageUrl || data.storedImageUrl);
      
      // 부적 생성 완료 메시지
      const successMessage = '행운의 부적이 만들어졌어요! 지금 확인해보세요 ✨';
      await addMessageWithTypingEffect(successMessage, 500, 800);
      
      // 팝업 표시
      setShowTalismanPopup(true);
      
      // 부적 생성 버튼 숨기기 (한 번만 생성 가능하도록)
      setShowTalismanButton(false);
      
    } catch (err) {
      console.error('부적 이미지 생성 오류:', err);
      setTalismanError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      
      // 오류 메시지 표시
      const errorMessage = '부적 생성에 실패했어요. 잠시 후 다시 시도해주세요. 😿';
      await addMessageWithTypingEffect(errorMessage, 500, 800);
    } finally {
      setIsGeneratingTalisman(false);
    }
  };
  
  // 직접 입력 처리 함수
  const handleDirectInput = async (text: string) => {
    if (typingMessageId) return; // 타이핑 중이면 무시
    
    // inputMode 변수 활용 - 직접 입력 모드로 변경
    setInputMode('DIRECT_INPUT');
    
    // 사용자 메시지 추가
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      sender: 'user',
      text: text,
    };
    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();
    
    // 고민 텍스트 저장
    setCurrentConcernText(text);
    
    // 로딩 시작
    setIsLoading(true);
    setCurrentOptions([]);
    
    // 잠시 딜레이 후 응답
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 로딩 메시지 추가 (타이핑 효과 적용)
    await addMessageWithTypingEffect('고민을 살펴보고 있어요...', 500, 1000);
    
    try {
      // OpenAI API 호출 - 직접 입력 모드 (사용자 정보 포함)
      const response = await fetch('/api/fortune/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userQuery: text,
          userName: userName,
          userProfile: userProfile
        }),
      });
      
      if (!response.ok) {
        throw new Error('API 요청 실패');
      }
      
      const data = await response.json();
      const fortuneText = data.fortune;
      
      // 운세 메시지 추가
      setMessages(prev => [...prev.slice(0, -1), {
        id: uuidv4(),
        sender: 'system',
        text: fortuneText,
      }]);
      scrollToBottom();
      
      // 부적 생성 버튼 표시
      setShowTalismanButton(true);
      
      // 결과 화면에서 '다시 상담하기' 옵션 추가
      setTimeout(() => {
        setCurrentOptions(['다시 상담하기']);
        setCurrentStep('FORTUNE_RESULT');
      }, 1000);
    } catch (error: unknown) {
      console.error('오류 발생:', error instanceof Error ? error.message : '알 수 없는 오류');
      
      // 마지막 메시지를 에러 메시지로 교체
      setMessages(prev => [...prev.slice(0, -1), {
        id: uuidv4(),
        sender: 'system',
        text: '죄송합니다, 질문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      }]);
      scrollToBottom();
      
      // 다시 상담하기 옵션 추가
      setTimeout(() => {
        setCurrentOptions(['다시 상담하기']);
        setCurrentStep('FORTUNE_RESULT');
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
        sender: 'user',
        text: option,
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();
      
      if (option === '직접 입력하기') {
        // 직접 입력 모드로 전환 - inputMode 활용
        setInputMode('DIRECT_INPUT');
        setCurrentStep('DIRECT_INPUT');
        setCurrentOptions([]);
        addMessageWithTypingEffect('자유롭게 이야기해주라냥!', 0, 1000);
      } else if (option === '다시 상담하기') {
        resetChat();
      } else {
        switch (currentStep) {
          case 'CONCERN_SELECT':
            handleConcernSelect(option as ConcernType);
            break;
          case 'DETAIL_LEVEL_1_SELECT':
            handleDetailLevel1Select(option);
            break;
          case 'DETAIL_LEVEL_2_SELECT':
            handleDetailLevel2Select(option);
            break;
          case 'DETAIL_LEVEL_3_SELECT':
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 세부 고민 메시지 추가 (타이핑 효과 적용)
    const responseText = `${concern}에 관한 고민이구냥. 좀 더 구체적으로 알려달라냥!`;
    await addMessageWithTypingEffect(responseText, 800, 1500);
    
    // 1단계 세부 고민 옵션 제공
    const level1Options = Object.keys(DETAILED_CONCERNS[concern].level1);
    setCurrentOptions(level1Options);
    setCurrentStep('DETAIL_LEVEL_1_SELECT');
  };
  
  // 1단계 세부 고민 선택 처리
  const handleDetailLevel1Select = async (option: string) => {
    setDetailLevel1(option);
    setCurrentOptions([]);
    
    // 잠시 딜레이 후 응답
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 2단계 세부 고민 메시지 추가
    const responseText = `${option}에 대해 더 구체적인 상황을 알려달라냥!`;
    await addMessageWithTypingEffect(responseText, 800, 1200);
    
    // 2단계 세부 고민 옵션 제공
    if (selectedConcern) {
      const level2Options = Object.keys(DETAILED_CONCERNS[selectedConcern].level1[option].level2);
      setCurrentOptions(level2Options);
      setCurrentStep('DETAIL_LEVEL_2_SELECT');
    }
  };
  
  // 2단계 세부 고민 선택 처리
  const handleDetailLevel2Select = async (option: string) => {
    setDetailLevel2(option);
    setCurrentOptions([]);
    
    // 잠시 딜레이 후 응답
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3단계 세부 고민 메시지 추가
    const responseText = `${option}에 대해 마지막으로 좀 더 자세히 알려달라냥!`;
    await addMessageWithTypingEffect(responseText, 800, 1200);
    
    // 3단계 세부 고민 옵션 제공
    if (selectedConcern && detailLevel1) {
      const level3Options = DETAILED_CONCERNS[selectedConcern].level1[detailLevel1].level2[option];
      setCurrentOptions(level3Options);
      setCurrentStep('DETAIL_LEVEL_3_SELECT');
    }
  };
  
  // 3단계 세부 고민 선택 처리
  const handleDetailLevel3Select = async (option: string) => {
    setDetailLevel3(option);
    setIsLoading(true);
    setCurrentOptions([]);
    
    // 고민 텍스트 저장 - 부적 생성에 사용
    if (selectedConcern && detailLevel1 && detailLevel2) {
      setCurrentConcernText(`${selectedConcern}, ${detailLevel1}, ${detailLevel2}, ${option}`);
    }
    
    // 잠시 딜레이 후 응답
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 로딩 메시지 추가
    await addMessageWithTypingEffect('운세를 살펴보고 있어요...', 1000, 1200);
    
    try {
      // OpenAI API 호출 (사용자 정보 포함)
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          concern: selectedConcern,
          detailLevel1,
          detailLevel2,
          detailLevel3: option,
          userName: userName,
          userProfile: userProfile
        }),
      });
      
      if (!response.ok) {
        throw new Error('API 요청 실패');
      }
      
      const data = await response.json();
      const fortuneText = data.fortune;
      
      // 운세 메시지를 먼저 표시
      setMessages(prev => [...prev.slice(0, -1), {
        id: uuidv4(),
        sender: 'system',
        text: fortuneText,
      }]);
      scrollToBottom();
      
      // 부적 생성 버튼 표시
      setShowTalismanButton(true);
      
      // 결과 화면에서 '다시 상담하기' 옵션 추가
      setTimeout(() => {
        setCurrentOptions(['다시 상담하기']);
      }, 1000);
    } catch (error: unknown) {
      console.error('운세 생성 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
      
      // 마지막 메시지를 에러 메시지로 교체
      setMessages(prev => [...prev.slice(0, -1), {
        id: uuidv4(),
        sender: 'system',
        text: '죄송합니다, 운세를 볼 수 없습니다. 다시 시도해주세요.',
      }]);
      scrollToBottom();
      
      // 오류 발생 시에도 '다시 상담하기' 옵션 추가
      setTimeout(() => {
        setCurrentOptions(['다시 상담하기']);
      }, 1000);
    } finally {
      setIsLoading(false);
      setCurrentStep('FORTUNE_RESULT');
    }
  };

  // 다시 상담하기 처리
  const resetChat = async () => {
    // 초기화 플래그 리셋
    initializedRef.current = false;
    
    setCurrentStep('INITIAL');
    setSelectedConcern(null);
    setCurrentOptions([]);
    setInitialMessagesComplete(false);
    setMessages([]);
    setInputMode('SELECTION');
    setDetailLevel1(null);
    setDetailLevel2(null);
    setDetailLevel3(null);
    setShowTalismanButton(false);
    setCurrentConcernText('');
    setTalismanError(null);
    setTalismanImageUrl(null);
    
    // 다시 초기화 플래그 설정 (이중 실행 방지)
    initializedRef.current = true;
    
    // 약간의 딜레이 후 시작
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 환영 메시지를 다시 표시
    for (let i = 0; i < welcomeMessages.length; i++) {
      // 메시지 길이에 따라 타이핑 시간과 표시 시간 조정
      const typingDelay = 200; // 타이핑 시간
      const readDelay = 200; // 읽는 시간
      
      await addMessageWithTypingEffect(welcomeMessages[i], readDelay, typingDelay);
    }
    
    setCurrentOptions([...CONCERN_TYPES, '직접 입력하기']);
    setCurrentStep('CONCERN_SELECT');
    setInitialMessagesComplete(true);
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto mb-4 p-2">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            isTyping={message.id === typingMessageId}
          />
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && !typingMessageId && (
          <div className="flex justify-center py-2">
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600"></div>
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      {/* 부적 생성 버튼 */}
      {showTalismanButton && !isLoading && !typingMessageId && (
        <div className="p-3 border-t border-gray-200 bg-red-50">
          <button
            onClick={handleGenerateTalisman}
            disabled={isGeneratingTalisman}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 
              ${isGeneratingTalisman 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
              }`}
          >
            {isGeneratingTalisman ? (
              <div className="flex items-center justify-center">
                <span>부적 생성 중...</span>
                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            ) : '행운의 부적 이미지 생성하기 ✨'}
          </button>
          
          {talismanError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded">
              {talismanError}
            </div>
          )}
        </div>
      )}
      
      {/* 입력 영역 - 직접 입력 모드일 때만 표시 */}
      {currentStep === 'DIRECT_INPUT' && !typingMessageId && inputMode === 'DIRECT_INPUT' && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <ChatInput 
            onSend={handleDirectInput} 
            disabled={!!typingMessageId || isLoading}
          />
        </div>
      )}
      
      {/* 선택지 영역 - 선택 모드이고 선택지가 있을 때만 표시 */}
      {currentOptions.length > 0 && initialMessagesComplete && !typingMessageId && currentStep !== 'DIRECT_INPUT' && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {currentOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                disabled={!!typingMessageId}
                className={`
                  px-4 py-2 rounded-full border transition-all duration-300
                  ${selectedOption === option
                    ? 'keyword-selected border-purple-500 shadow-md'
                    : 'bg-white border-purple-300 hover:bg-purple-50'
                  }
                  ${typingMessageId ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 부적 이미지 팝업 */}
      {showTalismanPopup && talismanImageUrl && (
        <TalismanPopup 
          imageUrl={talismanImageUrl} 
          userName={userName}
          onClose={() => setShowTalismanPopup(false)} 
        />
      )}
    </div>
  );
} 