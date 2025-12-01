"use client"

import { useState, useEffect } from "react"
import { db } from "@/firebase/client"
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
} from "firebase/firestore"
import { useUser } from "./useUser"

// Tipos
interface Post {
  id: string
  title: string
}

export function useSavedPosts() {
  const { user } = useUser()
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSavedPosts([])
      setLoading(false)
      return
    }

    const ref = doc(db, "savedPosts", user.uid)

    // Escucha en tiempo real los IDs de posts guardados
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      if (snapshot.exists()) {
        const postIds: string[] = snapshot.data().posts || []

        if (postIds.length === 0) {
          setSavedPosts([])
        } else {
          try {
            const postsQuery = query(collection(db, "posts"))
            const postsSnapshot = await getDocs(postsQuery)
            const allPosts = postsSnapshot.docs.map(doc => {
              const data = doc.data() as { title?: string } // 🔹 tipado parcial
              return { id: doc.id, title: data.title || "Sin título" }
            })
            const filteredPosts = allPosts.filter(post => postIds.includes(post.id))
            setSavedPosts(filteredPosts)
          } catch (error) {
            console.error("Error al obtener posts guardados:", error)
            setSavedPosts([])
          }
        }
      } else {
        setSavedPosts([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // 🔹 Alternar guardado/desguardado
  const toggleSave = async (postId: string) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar un post.")
      return
    }

    const ref = doc(db, "savedPosts", user.uid)
    try {
      const snap = await getDoc(ref)
      const currentPosts: string[] = snap.exists() ? snap.data().posts || [] : []
      const isSaved = currentPosts.includes(postId)

      if (!snap.exists()) {
        await setDoc(ref, { posts: [postId] })
      } else {
        await updateDoc(ref, {
          posts: isSaved ? arrayRemove(postId) : arrayUnion(postId),
        })
      }
    } catch (error) {
      console.error("Error al actualizar guardado:", error)
    }
  }

  return { savedPosts, toggleSave, loading }
}
