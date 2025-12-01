'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useUser } from './useUser'

// Tipado de un post
export interface UserPost {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: Timestamp
  [key: string]: any // opcional si agregas más campos dinámicos
}

export function useUserPosts() {
  const { user } = useUser()
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userPosts: UserPost[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UserPost, 'id'>),
        }))
        setPosts(userPosts)
        setLoading(false)
      },
      (error) => {
        console.error('Error en snapshot listener:', error)
        setPosts([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { posts, loading }
}
