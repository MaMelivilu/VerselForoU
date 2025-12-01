'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useUser } from './useUser'

export function useUserPosts() {
  const { user } = useUser()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si no hay usuario, limpia los posts y detén la carga
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    // Referencia a la colección de posts con filtro por usuario y orden descendente
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    // Escucha en tiempo real los cambios en los posts del usuario
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

    // Limpieza al desmontar el componente o cambiar de usuario
    return () => unsubscribe()
  }, [user])

  return { posts, loading }
}
