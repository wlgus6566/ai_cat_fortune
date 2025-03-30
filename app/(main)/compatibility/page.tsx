"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCompatibility } from "@/app/context/CompatibilityContext";

export default function CompatibilityPage() {
  const router = useRouter();
  const { setState } = useCompatibility();
  const [formData, setFormData] = useState({
    person1: {
      name: "",
      birthdate: "",
      gender: "남" as "남" | "여",
      birthtime: "",
    },
    person2: {
      name: "",
      birthdate: "",
      gender: "여" as "남" | "여",
      birthtime: "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    <motion.div
      className="container max-w-screen-md mx-auto px-4 py-6 relative z-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 이미지 영역 */}
      <div className="flex justify-center mb-8">
        <Image
          src="/compatibility-header.png" // 상단 이미지 경로
          alt="사주 궁합 테스트"
          width={480}
          height={240}
          className="rounded-lg"
        />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-2xl font-bold text-center text-[#3B2E7E] mb-6"
          variants={itemVariants}
        >
          이름과 생년월일을 입력하고,
          <br />
          우리의 사주 궁합을 테스트해 보세요
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 첫 번째 사람 정보 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">
              첫 번째 사람
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#6F5945] mb-1">이름</label>
                <input
                  type="text"
                  value={formData.person1.name}
                  onChange={(e) =>
                    handleInputChange("person1", "name", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">생년월일</label>
                <input
                  type="date"
                  value={formData.person1.birthdate}
                  onChange={(e) =>
                    handleInputChange("person1", "birthdate", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">성별</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="남"
                      checked={formData.person1.gender === "남"}
                      onChange={(e) =>
                        handleInputChange("person1", "gender", e.target.value)
                      }
                      className="mr-2"
                    />
                    남성
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="여"
                      checked={formData.person1.gender === "여"}
                      onChange={(e) =>
                        handleInputChange("person1", "gender", e.target.value)
                      }
                      className="mr-2"
                    />
                    여성
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">태어난 시간</label>
                <input
                  type="time"
                  value={formData.person1.birthtime}
                  onChange={(e) =>
                    handleInputChange("person1", "birthtime", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
            </div>
          </div>

          {/* 두 번째 사람 정보 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">
              두 번째 사람
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#6F5945] mb-1">이름</label>
                <input
                  type="text"
                  value={formData.person2.name}
                  onChange={(e) =>
                    handleInputChange("person2", "name", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">생년월일</label>
                <input
                  type="date"
                  value={formData.person2.birthdate}
                  onChange={(e) =>
                    handleInputChange("person2", "birthdate", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">성별</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="남"
                      checked={formData.person2.gender === "남"}
                      onChange={(e) =>
                        handleInputChange("person2", "gender", e.target.value)
                      }
                      className="mr-2"
                    />
                    남성
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="여"
                      checked={formData.person2.gender === "여"}
                      onChange={(e) =>
                        handleInputChange("person2", "gender", e.target.value)
                      }
                      className="mr-2"
                    />
                    여성
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[#6F5945] mb-1">태어난 시간</label>
                <input
                  type="time"
                  value={formData.person2.birthtime}
                  onChange={(e) =>
                    handleInputChange("person2", "birthtime", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E9E4F0] focus:outline-none focus:border-[#8D6FD1]"
                  required
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <motion.button
            type="submit"
            className="w-full bg-[#990dfa] text-white py-4 rounded-lg font-medium text-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            궁합 확인하기
          </motion.button>
        </form>
      </motion.div>

      {/* 앱 홍보 영역 */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-r from-[#990dfa] to-[#7609c1] rounded-xl p-8 text-white"
      ></motion.section>
    </motion.div>
  );
}
