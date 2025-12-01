'use client';
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ButtonGit({ children, onClick }: ButtonProps) {
  return (
    <>
      <button className="flex items-center justify-center mt-4 cursor-pointer w-[220px] border-0 rounded-full bg-black text-white py-1 shadow-md hover:bg-gray-800" onClick={onClick}>
        {children}
      </button>
    </>
  );
}
