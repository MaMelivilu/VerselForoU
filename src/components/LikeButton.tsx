"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { db, auth } from "@/firebase/client";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { arrayUnion, arrayRemove } from "firebase/firestore";

interface LikeButtonProps {
  videoId: string;
}

interface VideoData {
  likes?: string[];
}

export default function LikeButton({ videoId }: LikeButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Detectar usuario
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Escuchar likes del video
  useEffect(() => {
    if (!videoId) return;

    const videoRef = doc(db, "videos", videoId);

    const unsub = onSnapshot(videoRef, (snapshot) => {
      const data = snapshot.data() as VideoData | undefined;

      if (!data) return;

      const likesArray = data.likes ?? [];
      setLikeCount(likesArray.length);

      if (user) {
        setLiked(likesArray.includes(user.uid));
      }
    });

    return () => unsub();
  }, [videoId, user]);

  // Acción de like / unlike
  const handleLike = async () => {
    if (!user) {
      alert("Debes iniciar sesión para dar like.");
      return;
    }

    const videoRef = doc(db, "videos", videoId);

    try {
      if (liked) {
        await updateDoc(videoRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(videoRef, { likes: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error("Error al actualizar like:", error);
    }
  };

  return (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={handleLike}
    >
      <Heart
        className={`w-6 h-6 transition-colors ${
          liked ? "text-red-600 fill-red-600" : "text-gray-400"
        }`}
      />
      <span className="text-sm text-white">{likeCount}</span>
    </div>
  );
}
