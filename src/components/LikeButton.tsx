"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { db, auth } from "@/firebase/client";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, arrayRemove } from "firebase/firestore";

interface LikeButtonProps {
  videoId: string;
}

export default function LikeButton({ videoId }: LikeButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const videoRef = doc(db, "videos", videoId);

    const unsub = onSnapshot(videoRef, (snapshot) => {
      const data = snapshot.data();

      if (!data) return;

      const likesArray = data.likes || [];
      setLikeCount(likesArray.length);

      if (user) {
        setLiked(likesArray.includes(user.uid));
      }
    });

    return () => unsub();
  }, [videoId, user]);

  const handleLike = async () => {
    if (!user) return alert("Debes iniciar sesión para dar like.");

    const videoRef = doc(db, "videos", videoId);

    if (liked) {
      await updateDoc(videoRef, {
        likes: arrayRemove(user.uid),
      });
    } else {
      await updateDoc(videoRef, {
        likes: arrayUnion(user.uid),
      });
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
