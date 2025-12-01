'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useUser } from './useUser'

interface FirestoreUser {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  communitiesJoined?: string[] // <- nuevo campo
}

export function useFirestoreUser() {
  const { user } = useUser()
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFirestoreUser(null)
      setLoading(false)
      return
    }

    const userRef = doc(db, 'users', user.uid)

    // Escucha cambios en tiempo real
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          // Aseguramos que communitiesJoined siempre exista
          const data = docSnap.data()
          setFirestoreUser({
            id: docSnap.id,
            displayName: data.displayName || null,
            email: data.email || null,
            photoURL: data.photoURL || null,
            communitiesJoined: data.communitiesJoined || [],
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching Firestore user:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { firestoreUser, loading }
}
