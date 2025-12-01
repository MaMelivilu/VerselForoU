"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/client";
import { collection, onSnapshot } from "firebase/firestore";
import LikeButton from "@/components/LikeButton";
import UploadVideo from "@/app/videos/subir/page";
import { PlusCircle } from "lucide-react";
import SideBar from "@/components/SideBar";

export default function ForoShorts() {
  const [videos, setVideos] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [volumeLevels, setVolumeLevels] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "videos"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setVideos(list);
    });

    return () => unsub();
  }, []);

  const handleVideoClick = (index: number) => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      } else v.pause();
    });
  };

  const handleVolumeChange = (index: number, value: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.volume = value;
      video.muted = value === 0;
      setVolumeLevels((prev) => ({ ...prev, [index]: value }));
    }
  };

  return (
    <div className="flex bg-white min-h-screen">

      {/* 👉 SIDEBAR (solo en pantallas medianas o grandes) */}
      <div className="hidden md:block">
        <SideBar />
      </div>

      {/* 👉 CONTENIDO PRINCIPAL */}
      <div className="flex flex-col items-center w-full ml-0 md:ml-64 
                      overflow-y-auto snap-y snap-mandatory scroll-smooth relative">

        {/* Título + botón subir */}
        <div className="flex items-center gap-3 my-4">
          <h1 className="text-black text-2xl font-bold">ForoShorts</h1>
          <button
            onClick={() => setShowUpload(true)}
            className="text-black hover:text-blue-500 transition"
          >
            <PlusCircle size={28} />
          </button>
        </div>

        {/* Subir video modal */}
        {showUpload && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/20 z-50">
            <div className="bg-white p-4 rounded-xl shadow-lg relative">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              >
                ✕
              </button>
              <UploadVideo />
            </div>
          </div>
        )}

        {/* LISTA DE VIDEOS */}
        {videos.map((v, i) => (
          <div
            key={v.id}
            className="bg-gray-100 border border-gray-300 rounded-2xl shadow-lg 
                       overflow-hidden w-full max-w-3xl flex flex-col items-center relative 
                       snap-center my-24"
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current[i] = el;
              }}
              src={v.videoURL}
              className="w-full max-h-[87vh] object-contain cursor-pointer"
              loop
              muted
              playsInline
              onClick={() => handleVideoClick(i)}
              autoPlay={i === 0}
            />

            {/* Usuario */}
            <div className="absolute top-4 left-4 bg-white/70 px-3 py-2 rounded-xl flex items-center gap-2">
              <img
                src={v.usernamePhoto || "/default-avatar.png"}
                className="w-9 h-9 rounded-full object-cover border border-black/40"
              />
              <span className="text-black font-semibold text-sm">
                {v.username || "Usuario"}
              </span>
            </div>

            {/* Volumen */}
            <div className="absolute top-4 right-4 bg-white/80 px-3 py-2 rounded-lg flex items-center gap-2">
              <span className="text-black text-sm">
                {volumeLevels[i] === 0
                  ? "🔇"
                  : volumeLevels[i] && volumeLevels[i] < 0.5
                  ? "🔉"
                  : "🔊"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumeLevels[i] ?? 0}
                onChange={(e) =>
                  handleVolumeChange(i, parseFloat(e.target.value))
                }
                className="w-24 cursor-pointer accent-blue-500"
              />
            </div>

            {/* Texto + Like */}
            <div className="p-4 w-full text-black bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 h-38">
              <h2 className="font-semibold mt-9 text-gray-100 text-lg">{v.title}</h2>

              <p
                className="
                  text-gray-300 
                  mb-2 
                  max-w-full 
                  leading-tight 
                  break-words 
                  overflow-hidden 
                  line-clamp-2
                "
              >
                {v.description}
              </p>

              <div className="flex justify-end items-center mt-2">
                <LikeButton videoId={v.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
