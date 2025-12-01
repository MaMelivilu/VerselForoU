'use client'
import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '@/firebase/client' // asegúrate de exportar "app" desde client.tsx

interface User {
  displayName: string | null
  email: string | null
  photoURL: string | null
  uid: string
}

export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = cargando

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { displayName, email, photoURL, uid } = firebaseUser
        setUser({ displayName, email, photoURL, uid })
      } else {
        setUser(null) // no hay sesión
      }
    })

    return () => unsubscribe() // limpia el listener al desmontar
  }, [])

  return { user }
}
