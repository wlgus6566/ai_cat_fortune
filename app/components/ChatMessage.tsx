import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isTyping?: boolean;
}

export default function ChatMessage({ message, isTyping = false }: ChatMessageProps) {
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
        {isTyping ? (
          <div className="flex items-center justify-center space-x-1 py-2 min-h-[28px]">
            <span className="typing-dot w-2 h-2 bg-purple-500"></span>
            <span className="typing-dot w-2 h-2 bg-purple-500"></span>
            <span className="typing-dot w-2 h-2 bg-purple-500"></span>
          </div>
        ) : (
          <p className="relative z-10 text-sm md:text-base">{message.text}</p>
        )}
      </div>
    </div>
  );
} 