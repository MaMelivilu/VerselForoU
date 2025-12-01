'use client';
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ButtonGoogle({ children, onClick }: ButtonProps) {
  return (
    <>
      <button className="flex items-center justify-center mt-4 cursor-pointer w-[220px] border-0 rounded-full bg-gray-50 text-black py-1 shadow-md hover:bg-blue-50" onClick={onClick}>
        {children}
      </button>
    </>
  );
}