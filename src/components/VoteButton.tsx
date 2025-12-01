"use client"

import { useState, useEffect } from "react"
import { ArrowBigUp } from "lucide-react"
import { db, auth } from "@/firebase/client"
import { doc, setDoc, deleteDoc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

interface VoteButtonProps {
  postId: string
}

export default function VoteButton({ postId }: VoteButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)

  // Detectar usuario actual
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Escuchar votos en tiempo real
  useEffect(() => {
    const votesCollection = collection(db, "posts", postId, "votos")
    const unsubscribe = onSnapshot(votesCollection, (snapshot) => {
      setVoteCount(snapshot.size)
      if (user) {
        setVoted(snapshot.docs.some(doc => doc.id === user.uid))
      }
    })
    return () => unsubscribe()
  }, [postId, user])

  const handleVote = async () => {
    if (!user) return alert("Debes iniciar sesión para votar.")
    const voteRef = doc(db, "posts", postId, "votos", user.uid)

    if (voted) {
      await deleteDoc(voteRef)
    } else {
      await setDoc(voteRef, { valor: true })
    }
  }

  return (
    <div className="flex items-center gap-1 cursor-pointer select-none">
      <ArrowBigUp
        className={`w-6 h-6 transition-colors ${
          voted ? "text-blue-600 fill-current" : "text-gray-400"
        }`}
        onClick={handleVote}
      />
      <span className="text-sm text-gray-700">{voteCount}</span>
    </div>
  )
}
