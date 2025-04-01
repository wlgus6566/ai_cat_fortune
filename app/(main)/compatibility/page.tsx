"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import { useUser } from "@/app/contexts/UserContext";
import PageHeader from "@/app/components/PageHeader";

export default function CompatibilityPage() {
  const router = useRouter();
  const { userProfile, isLoaded } = useUser();
  const { setState } = useCompatibility();
  const [formData, setFormData] = useState({
    person1: {
      name: "",
      birthdate: "",
      gender: "여" as "남" | "여",
      birthtime: "",
    },
    person2: {
      name: "",
      birthdate: "",
      gender: "남" as "남" | "여",
      birthtime: "",
    },
  });
  const [error, setError] = useState("");

  // 사용자 프로필 정보로 폼 데이터 초기화
  useEffect(() => {
    if (userProfile && isLoaded) {
      // gender 형식 변환 ("남성"/"여성" -> "남"/"여")
      const gender =
        userProfile.gender === "남성"
          ? "남"
          : userProfile.gender === "여성"
          ? "여"
          : "남"; // 기본값은 남성

      // birthTime 형식 변환
      let birthtime = "12:00"; // 기본값
      if (userProfile.birthTime && userProfile.birthTime !== "모름") {
        // 예: "자시(23:00-01:00)" -> "23:00"
        const timeMatch = userProfile.birthTime.match(
          /\((\d{2}):00-\d{2}:00\)/
        );
        if (timeMatch) {
          birthtime = `${timeMatch[1]}:00`;
        }
      }

      // formData 업데이트
      setFormData((prev) => ({
        ...prev,
        person1: {
          name: userProfile.name || "",
          birthdate: userProfile.birthDate || "",
          gender: gender as "남" | "여",
          birthtime: birthtime,
        },
      }));
    }
  }, [userProfile, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.person1.name || !formData.person2.name) {
      setError("두 사람의 이름을 모두 입력해주세요.");
      return;
    }

    if (!formData.person1.birthdate || !formData.person2.birthdate) {
      setError("두 사람의 생년월일을 모두 선택해주세요.");
      return;
    }

    if (!formData.person1.birthtime || !formData.person2.birthtime) {
      setError("두 사람의 태어난 시간을 모두 선택해주세요.");
      return;
    }

    // Context 상태 업데이트
    setState(formData);

    // 결과 페이지로 이동
    router.push("/compatibility/result");
  };

  const handleInputChange = (
    person: "person1" | "person2",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value,
      },
    }));
  };

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]">
      <PageHeader title="궁합보기" className="bg-transparent shadow-none" />

      <div className="container max-w-md mx-auto px-4 py-6 relative">
        {/* 배경 요소 */}
        {/* <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Image
              src="/assets/images/star.png"
              alt="별"
              width={100}
              height={100}
              className="w-full h-full"
            />
          </motion.div>
        </div> */}

        {/* <div className="absolute bottom-20 left-0 w-16 h-16 opacity-20">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/assets/images/moon.png"
              alt="달"
              width={60}
              height={60}
              className="w-full h-full"
            />
          </motion.div>
        </div> */}

        {/* 메인 컨텐츠 */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* <motion.div className="flex justify-center" variants={itemVariants}>
            <Image
              src="/cat_book.png"
              alt="고양이 마법사"
              width={100}
              height={100}
              className="w-24 h-24 object-contain"
            />
          </motion.div> */}

          <motion.h2
            className="text-xl font-bold text-center text-[#3B2E7E] mb-6 font-gothic"
            variants={itemVariants}
          >
            사주로 보는 너와 나의 궁합
          </motion.h2>

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* 첫 번째 사람 정보 */}
              <div className="p-4 bg-[#F9F5FF] rounded-xl">
                <h3 className="font-semibold text-[#3B2E7E] mb-4">
                  첫 번째 사람
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={formData.person1.name}
                      onChange={(e) =>
                        handleInputChange("person1", "name", e.target.value)
                      }
                      placeholder="이름"
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      성별
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person1", "gender", "남")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person1.gender === "남"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person1", "gender", "여")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person1.gender === "여"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        여성
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={formData.person1.birthdate}
                      onChange={(e) =>
                        handleInputChange(
                          "person1",
                          "birthdate",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      태어난 시간
                    </label>
                    <input
                      type="time"
                      value={formData.person1.birthtime}
                      onChange={(e) =>
                        handleInputChange(
                          "person1",
                          "birthtime",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      정확한 시간을 모르시면 12:00으로 입력해주세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 두 번째 사람 정보 */}
              <div className="p-4 bg-[#F9F5FF] rounded-xl">
                <h3 className="font-semibold text-[#3B2E7E] mb-4">
                  두 번째 사람
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={formData.person2.name}
                      onChange={(e) =>
                        handleInputChange("person2", "name", e.target.value)
                      }
                      placeholder="이름"
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      성별
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person2", "gender", "남")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person2.gender === "남"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person2", "gender", "여")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person2.gender === "여"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        여성
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={formData.person2.birthdate}
                      onChange={(e) =>
                        handleInputChange(
                          "person2",
                          "birthdate",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      태어난 시간
                    </label>
                    <input
                      type="time"
                      value={formData.person2.birthtime}
                      onChange={(e) =>
                        handleInputChange(
                          "person2",
                          "birthtime",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      정확한 시간을 모르시면 12:00으로 입력해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="mt-8" variants={itemVariants}>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-[#990dfa] text-white font-medium hover:bg-[#8A0AE0] transition-colors"
              >
                궁합 확인하기
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* 하단 설명 */}
        <motion.div
          className="text-center text-sm text-[#3B2E7E]/70"
          variants={itemVariants}
        >
          <p>
            사주 정보를 바탕으로 두 사람의 궁합을 분석해드립니다.
            <br />
            정확한 정보를 입력할수록 더 정확한 결과를 얻을 수 있어요.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
