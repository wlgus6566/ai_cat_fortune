import { ChatMessage as ChatMessageType } from "../type/types";
import Image from "next/image";

interface ChatMessageProps {
  message: ChatMessageType;
  isTyping?: boolean;
}

export default function ChatMessage({
  message,
  isTyping = false,
}: ChatMessageProps) {
  const isSystem = message.sender === "system";
  const isImageOnly = message.imageUrl && !message.text?.trim();

  return (
    <div className={`mb-4 flex ${isSystem ? "justify-start" : "justify-end"}`}>
      <div
        className={`
          relative max-w-[80%] p-3 rounded-lg 
          ${
            isSystem
              ? "bg-purple-100 rounded-bl-none"
              : "bg-blue-100 rounded-br-none text-right"
          }
          ${isImageOnly ? "px-0 py-0 bg-transparent" : ""}
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
            {message.text && (
              <p className="relative z-10 text-sm md:text-base whitespace-pre-wrap">
                {message.text}
              </p>
            )}

            {message.imageUrl && (
              <div
                className={`${message.text ? "mt-2" : ""} flex justify-center`}
              >
                <div className="relative">
                  <Image
                    src={message.imageUrl}
                    alt="고양이 이모티콘"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
