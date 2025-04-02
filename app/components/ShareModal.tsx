import { motion } from "framer-motion";
import Image from "next/image";
import { Copy, X } from "lucide-react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareKakao: () => void;
  onCopyLink: () => void;
  title?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  onShareKakao,
  onCopyLink,
  title = "공유하기",
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-sm p-6 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-center mb-6 text-[#3B2E7E]">
          {title}
        </h3>

        <div className="space-y-4">
          <button
            onClick={onShareKakao}
            className="w-full py-3 px-4 bg-[#FEE500] rounded-xl flex items-center justify-center text-black font-medium"
          >
            <Image
              src="/kakao-logo.png"
              alt="카카오톡"
              width={24}
              height={24}
              className="mr-2"
            />
            카카오톡으로 공유하기
          </button>

          <button
            onClick={onCopyLink}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-800 font-medium"
          >
            <Copy size={20} className="mr-2" />
            링크 복사하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
