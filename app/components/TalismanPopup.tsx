'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TalismanPopupProps {
  imageUrl: string;
  onClose: () => void;
  userName?: string;
}

export default function TalismanPopup({ imageUrl, onClose, userName }: TalismanPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnrolling, setIsUnrolling] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Animation sequence starts when popup is mounted
    const timer1 = setTimeout(() => {
      setIsOpen(true);  // Show popup background
    }, 100);

    const timer2 = setTimeout(() => {
      setIsUnrolling(true);  // Start unrolling the scroll
      // Add a slight shaking effect
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }, 500);

    const timer3 = setTimeout(() => {
      setIsFullyVisible(true);  // Fully unrolled state
    }, 1500);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Handle close animation
  const handleClose = () => {
    setIsFullyVisible(false);
    setIsUnrolling(false);
    setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 500);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'opacity-100 bg-black/50' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-parchment bg-amber-50 rounded-lg shadow-xl p-4 max-w-md w-full mx-4 transition-all duration-500 transform overflow-hidden ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll top decoration */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-amber-700 rounded-t-lg flex justify-center items-center">
          <div className="w-16 h-4 bg-amber-800 rounded-b-lg"></div>
        </div>
        
        {/* Content container */}
        <div className="pt-8 pb-4">
          <h3 className="text-xl font-bold text-center mb-4 text-amber-900">
            {userName ? `${userName}님을 위한 행운의 부적` : '행운의 부적이다냥! 🍀'}
          </h3>
          
          {/* Image container - unrolling scroll animation */}
          <div 
            className={`relative mx-auto rounded-md overflow-hidden transition-all duration-1000 transform-gpu ${
              isUnrolling ? 'opacity-100' : 'h-0 opacity-0'
            } ${isShaking ? 'animate-bounce' : ''}`}
            style={{ 
              width: 'auto', // Auto width to maintain aspect ratio
              maxWidth: '280px',
              aspectRatio: '9/16', // 9:16 aspect ratio
              height: '400px', // Fixed height
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transform: `${isFullyVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.98)'}`,
              transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bounce effect cubic-bezier
            }}
          >
            {/* Shadow effect (top) */}
            <div className={`absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/30 to-transparent z-10 transition-opacity duration-700 ${
              isFullyVisible ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <Image
              src={imageUrl}
              alt="Talisman Image"
              fill
              sizes="(max-width: 768px) 100vw, 280px"
              className={`object-cover transition-all duration-1200 ${
                isFullyVisible ? 'scale-100 filter-none' : 'scale-105 blur-sm'
              }`}
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            
            {/* Shadow effect (bottom) */}
            <div className={`absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent z-10 transition-opacity duration-700 ${
              isFullyVisible ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            {/* Overlay for unrolling effect */}
            <div 
              className={`absolute inset-0 bg-gradient-to-b from-amber-50 to-transparent z-20 transition-all duration-1500 ${
                isFullyVisible ? 'translate-y-[-100%]' : 'translate-y-0'
              }`}
              style={{
                transformOrigin: 'top',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            ></div>
          </div>
          
          {/* Button area */}
          <div className={`mt-6 flex justify-center gap-3 transition-all duration-700 ${
            isFullyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              닫기
            </button>
            <a
              href={imageUrl}
              download="talisman.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
            >
              다운로드
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 