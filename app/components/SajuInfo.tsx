'use client';

import React from 'react';
import { SajuElements } from '@/app/type/types';

interface SajuInfoProps {
  birthInfo: string;
  saju: SajuElements;
}

const SajuInfo: React.FC<SajuInfoProps> = ({ birthInfo, saju }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-6">
      {/* 생년월일시 정보 */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-semibold text-gray-800">{birthInfo}</h2>
      </div>
      
      {/* 사주팔자 - 천간 (첫번째 줄) */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-teal-500 text-white font-bold">{saju.cheongan.year}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-gray-700 text-white font-bold">{saju.cheongan.month}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-amber-500 text-white font-bold">{saju.cheongan.day}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-teal-500 text-white font-bold">{saju.cheongan.time}</div>
      </div>

      {/* 사주팔자 - 지지 (두번째 줄) */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-amber-500 text-white font-bold">{saju.jiji.year}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-amber-500 text-white font-bold">{saju.jiji.month}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-teal-500 text-white font-bold">{saju.jiji.day}</div>
        <div className="rounded-full w-8 h-8 text-sm flex items-center justify-center bg-gray-700 text-white font-bold">{saju.jiji.time}</div>
      </div>
      
      {/* 일주 정보 */}
      <div className="text-center">
        <p className="text-md text-gray-700">{saju.ilju} 여자</p>
      </div>
    </div>
  );
};

export default SajuInfo; 