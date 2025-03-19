import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isSystem = message.sender === 'system';
  
  return (
    <div className={`mb-4 flex ${isSystem ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`
          relative max-w-[80%] p-3 rounded-lg 
          ${isSystem 
            ? 'bg-purple-100 rounded-bl-none' 
            : 'bg-blue-100 rounded-br-none text-right'
          }
        `}
      >
        {/* 말풍선 꼬리 부분 */}
        <div 
          className={`
            absolute bottom-0 w-3 h-3 
            ${isSystem 
              ? 'left-0 -translate-x-1/2 translate-y-1/3 bg-purple-100 clip-triangle-left' 
              : 'right-0 translate-x-1/2 translate-y-1/3 bg-blue-100 clip-triangle-right'
            }
          `}
        />
        
        <p className="relative z-10 text-sm md:text-base">{message.text}</p>
      </div>
    </div>
  );
} 