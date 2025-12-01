'use client'

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { db } from "@/firebase/client"
import { useUser } from "@/hooks/useUser"
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore"

interface Notification {
  id: string
  type: string
  message: string
  createdAt: any
  isRead: boolean
  [key: string]: any
}

export default function NotificationsBell() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  // 🔔 Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Notification)
      }))
      setNotifications(nots)
    })

    return () => unsubscribe()
  }, [user])

  // Marcar todas como leídas al abrir la lista
  const handleOpen = async () => {
    setOpen(!open)
    if (!open) {
      const unread = notifications.filter(n => !n.isRead)
      unread.forEach(async (n) => {
        const notifRef = doc(db, `users/${user!.uid}/notifications`, n.id)
        await updateDoc(notifRef, { isRead: true })
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    const notifRef = doc(db, `users/${user.uid}/notifications`, id)
    await deleteDoc(notifRef)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      {/* Campana */}
      <button onClick={handleOpen} className="relative focus:outline-none">
        <Bell className={`cursor-pointer w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Lista de notificaciones */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No hay notificaciones</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="flex justify-between items-start p-3 border-b border-gray-100 hover:bg-gray-50 ">
                <div className="flex-1 pr-2">
                  <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {notif.message}
                  </p>
                  <span className="text-xs text-gray-400">{notif.createdAt?.toDate?.()?.toLocaleString()}</span>
                </div>
                <button onClick={() => handleDelete(notif.id)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
