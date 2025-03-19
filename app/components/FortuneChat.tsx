import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType, ChatStep, ConcernType } from '../types';
import { CONCERN_TYPES, SUB_CONCERNS } from '../data';

export default function FortuneChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>('INITIAL');
  const [selectedConcern, setSelectedConcern] = useState<ConcernType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // 초기 메시지 설정
  useEffect(() => {
    setMessages([
      {
        id: uuidv4(),
        sender: 'system',
        text: '안녕! 무슨 고민이 있냥?',
      },
    ]);
    setCurrentOptions(CONCERN_TYPES);
    setCurrentStep('CONCERN_SELECT');
  }, []);
  
  // 사용자가 옵션을 선택했을 때의 핸들러
  const handleOptionSelect = async (option: string) => {
    setSelectedOption(option);
    
    // 잠시 강조 효과를 보여준 후 다음 단계로 진행
    setTimeout(() => {
      // 사용자 선택 메시지 추가
      const userMessage: ChatMessageType = {
        id: uuidv4(),
        sender: 'user',
        text: option,
      };
      setMessages(prev => [...prev, userMessage]);
      
      switch (currentStep) {
        case 'CONCERN_SELECT':
          handleConcernSelect(option as ConcernType);
          break;
        case 'SUB_CONCERN_SELECT':
          handleSubConcernSelect(option);
          break;
        default:
          break;
      }
      
      setSelectedOption(null);
    }, 300);
  };
  
  // 고민 유형 선택 처리
  const handleConcernSelect = (concern: ConcernType) => {
    setSelectedConcern(concern);
    
    // 세부 고민 메시지 추가
    const subConcernMessage: ChatMessageType = {
      id: uuidv4(),
      sender: 'system',
      text: `${concern}에 관한 고민이구냥. 어떤 게 고민되느냥!`,
    };
    
    setMessages(prev => [...prev, subConcernMessage]);
    setCurrentOptions(SUB_CONCERNS[concern]);
    setCurrentStep('SUB_CONCERN_SELECT');
  };
  
  // 세부 고민 선택 처리
  const handleSubConcernSelect = async (subConcern: string) => {
    setIsLoading(true);
    setCurrentOptions([]);
    
    // 로딩 메시지 추가
    const loadingMessage: ChatMessageType = {
      id: uuidv4(),
      sender: 'system',
      text: '운세를 살펴보고 있어요...',
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      // OpenAI API 호출
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          concern: selectedConcern,
          subConcern: subConcern 
        }),
      });
      
      if (!response.ok) {
        throw new Error('API 요청 실패');
      }
      
      const data = await response.json();
      
      // 로딩 메시지 제거하고 결과 메시지 추가
      setMessages(prev => 
        prev.filter(msg => msg.id !== loadingMessage.id).concat({
          id: uuidv4(),
          sender: 'system',
          text: data.fortune,
        })
      );
      
      // 결과 화면에서 '다시 상담하기' 옵션 추가
      setCurrentOptions(['다시 상담하기']);
    } catch (error: unknown) {
      console.error('운세 생성 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
      // 에러 메시지 추가
      setMessages(prev => 
        prev.filter(msg => msg.id !== loadingMessage.id).concat({
          id: uuidv4(),
          sender: 'system',
          text: '죄송합니다, 운세를 볼 수 없습니다. 다시 시도해주세요.',
        })
      );
      
      // 오류 발생 시에도 '다시 상담하기' 옵션 추가
      setCurrentOptions(['다시 상담하기']);
    } finally {
      setIsLoading(false);
      setCurrentStep('FORTUNE_RESULT');
    }
  };

  // 다시 상담하기 처리
  const resetChat = () => {
    setCurrentStep('INITIAL');
    setSelectedConcern(null);
    setMessages([
      {
        id: uuidv4(),
        sender: 'system',
        text: '안녕! 무슨 고민이 있냥?',
      },
    ]);
    setCurrentOptions(CONCERN_TYPES);
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto mb-4 p-2">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600"></div>
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-purple-600" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      {/* 선택지 영역 - 항상 하단에 고정 */}
      {currentOptions.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {currentOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`
                  px-4 py-2 rounded-full border transition-all duration-300
                  ${selectedOption === option
                    ? 'keyword-selected border-purple-500 shadow-md'
                    : 'bg-white border-purple-300 hover:bg-purple-50'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 결과 화면에서 '다시 상담하기' 버튼은 큰 버튼으로 표시 */}
      {currentStep === 'FORTUNE_RESULT' && currentOptions.length === 0 && (
        <div className="mt-4 text-center p-3 border-t border-gray-200">
          <button
            onClick={resetChat}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
          >
            다시 상담하기
          </button>
        </div>
      )}
    </div>
  );
} 