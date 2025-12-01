"use client";

import { FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCommunityPostButton({ communityId }: { communityId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/comunidades/${communityId}/crearPostComunidad`)}
      className="fixed bottom-12 right-12 flex items-center justify-center transition cursor-pointer hover:text-blue-800"
    >
      <FilePlus className="text-yellow-600 h-16 w-16 hover:fill-yellow-600 hover:stroke-gray-100" />
    </button>
  );
}
