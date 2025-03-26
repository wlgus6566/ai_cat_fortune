"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  zIndex = 50,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 bg-black/70"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden"
        style={{ width: "85vw", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
