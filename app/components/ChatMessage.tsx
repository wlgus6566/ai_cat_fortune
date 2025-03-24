import { ChatMessage as ChatMessageType } from '../type/types';
import Image from 'next/image';
import { useState } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  isTyping?: boolean;
}

export default function ChatMessage({ message, isTyping = false }: ChatMessageProps) {
  const isSystem = message.sender === 'system';
  const [imageLoading, setImageLoading] = useState(true);
  
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
          <>
            <p className="relative z-10 text-sm md:text-base">{message.text}</p>
            
            {message.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-lg">
                <div className="relative h-48 w-full">
                  <Image
                    src={message.imageUrl}
                    alt="행운의 부적 이미지"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                    onLoadingComplete={() => setImageLoading(false)}
                  />
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 