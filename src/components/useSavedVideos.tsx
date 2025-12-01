"use client"

import { useEffect, useState } from "react"
import { db } from "@/firebase/client"
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useUser } from "./useUser"

export function useSavedVideos() {
  const { user } = useUser()
  const [myVideos, setMyVideos] = useState<any[]>([])
  const [likedVideos, setLikedVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMyVideos([])
      setLikedVideos([])
      setLoading(false)
      return
    }

    // Mis videos
    const q1 = query(collection(db, "videos"), where("userId", "==", user.uid))
    const unsub1 = onSnapshot(q1, (snap) => {
      setMyVideos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      )
    })

    // Videos que me gustaron
    const q2 = query(collection(db, "videos"), where("likes", "array-contains", user.uid))
    const unsub2 = onSnapshot(q2, (snap) => {
      setLikedVideos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      )
      setLoading(false)
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [user])

  const removeLike = async (videoId: string, likes: string[]) => {
    if (!user) return

    const filtered = likes.filter((id) => id !== user.uid)

    await updateDoc(doc(db, "videos", videoId), {
      likes: filtered,
    })
  }

  const deleteVideo = async (videoId: string) => {
    const ok = confirm("¿Seguro que quieres eliminar este video?")
    if (!ok) return

    await deleteDoc(doc(db, "videos", videoId))
  }

  return { myVideos, likedVideos, loading, removeLike, deleteVideo }
}
