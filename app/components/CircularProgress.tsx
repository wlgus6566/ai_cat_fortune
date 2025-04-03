"use client";

import React from "react";

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color?: string;
  backgroundColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  color = "#990dfa",
  backgroundColor = "rgba(255, 255, 255, 0.2)",
}) => {
  // 원의 둘레 계산
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 퍼센트에 따른 원호 길이 계산
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 배경 원 */}
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* 진행 상태 원호 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
