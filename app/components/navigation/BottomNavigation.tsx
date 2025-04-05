"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AppTab } from "@/app/type/types";
import { Home, MessageCircle, User, Archive } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  useEffect(() => {
    if (pathname === "/") {
      setActiveTab("home");
    } else if (pathname?.includes("/chat")) {
      setActiveTab("chat");
    } else if (pathname?.includes("/profile")) {
      setActiveTab("profile");
    } else if (pathname?.includes("/consultations")) {
      setActiveTab("consultations");
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "home" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">홈</span>
      </Link>

      <Link
        href="/chat"
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "chat" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-xs mt-1">상담</span>
      </Link>

      <Link
        href="/consultations"
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "consultations" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <Archive className="h-6 w-6" />
        <span className="text-xs mt-1">보관함</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "profile" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">프로필</span>
      </Link>
    </nav>
  );
}
