"use client"

import { useState } from "react"
import { db, storage } from "@/firebase/client"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"

export default function UploadVideo() {
  const { firestoreUser } = useFirestoreUser()

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!firestoreUser) return alert("Debes iniciar sesión para subir un video.")
    if (!videoFile) return alert("Selecciona un archivo de video.")

    setUploading(true)

    try {
      const videoRef = ref(
        storage,
        `videos/${firestoreUser.id}_${Date.now()}.mp4`
      )
      await uploadBytes(videoRef, videoFile)
      const videoURL = await getDownloadURL(videoRef)

      await addDoc(collection(db, "posts"), {
        authorID: firestoreUser.id,
        authorName: firestoreUser.name || "Usuario",
        authorPhoto: firestoreUser.photo || "",
        createdAt: serverTimestamp(),
        mediaFile: { url: videoURL },
        type: "video",
        title,
        votosTotales: 0,
      })

      alert("✅ Video subido correctamente!")
      setVideoFile(null)
      setTitle("")
    } catch (error) {
      console.error(error)
      alert("❌ Error al subir el video.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">

      {/* Foto + Nombre */}
      <div className="flex items-center gap-3">
        {firestoreUser?.photo ? (
          <img
            src={firestoreUser.photo}
            alt="User"
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300" />
        )}

        <span className="font-semibold text-lg">
          {firestoreUser?.name || "Usuario"}
        </span>
      </div>

      {/* Input título */}
      <input
        type="text"
        placeholder="Título del video..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-3 rounded-lg w-full"
      />

      {/* Input archivo */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        className="p-2"
      />

      {/* Botón */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Subiendo..." : "Subir video"}
      </button>
    </div>
  )
}
