'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { useUser } from "@/hooks/useUser"
import { useUserPosts } from "@/hooks/useUserPosts"
import { useSavedPosts } from "@/hooks/useSavedPosts"
import { useSavedVideos } from "@/hooks/useSavedVideos"
import { updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db, storage } from "@/firebase/client"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Link from "next/link"
import { Trash2, BookmarkMinus } from "lucide-react"

export default function ProfilePage() {
  const { user } = useUser()
  const { firestoreUser, loading } = useFirestoreUser()
  const { posts, loading: loadingPosts } = useUserPosts()
  const { savedPosts, toggleSave, loading: loadingSaved } = useSavedPosts()
  const { myVideos, deleteVideo } = useSavedVideos()
  const router = useRouter()

  const [displayName, setDisplayName] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user === null) router.push("/")
    if (firestoreUser) {
      setDisplayName(firestoreUser.displayName || "")
      setPhotoURL(firestoreUser.photoURL || "")
    }
  }, [user, firestoreUser, router])

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]
    if (!file) return

    try {
      const storageRef = ref(storage, `user_photos/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
    } catch (error) {
      console.error("Error al subir la foto:", error)
      alert("No se pudo subir la foto")
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { displayName, photoURL })
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      alert("Ocurrió un error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este post?")
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "posts", postId))
    } catch (error) {
      console.error("Error al eliminar el post:", error)
    }
  }

  if (!user || loading || !firestoreUser || loadingPosts || loadingSaved) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Cargando perfil...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="grid place-items-center min-h-screen py-10">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-6 flex flex-col gap-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={() => router.push("/posts")}
          className="absolute top-2 right-2 text-red-500 font-bold text-4xl hover:text-red-800 cursor-pointer"
        >
          ×
        </button>

        {/* Información del perfil */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Mi Perfil</h1>
        <div className="flex flex-col items-center gap-4 border-b pb-6">
          <img
            src={photoURL || "/default-avatar.png"}
            alt="avatar"
            className="w-24 h-24 rounded-full border border-gray-300 cursor-pointer hover:opacity-80 object-cover object-center"
            onClick={handlePhotoClick}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500">Nombre de usuario</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre"
              className="p-2 rounded border border-gray-300 w-full text-center focus:outline-none"
            />
          </div>

          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500">Email conectado</label>
            <input
              type="email"
              value={firestoreUser.email}
              disabled
              className="p-2 rounded border border-gray-300 w-full text-center bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {/* Sección inferior */}
        <div className="flex flex-col md:flex-row gap-6 mt-6 justify-center">
          {/* Mis Posts */}
          <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-xl shadow-inner max-h-64 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3 text-center text-gray-700">Mis Posts</h2>
            {posts.length === 0 ? (
              <p className="text-gray-500 text-center">Aún no has creado ningún post.</p>
            ) : (
              <ul className="divide-y divide-gray-300">
                {posts.map((post) => (
                  <li key={post.id} className="flex justify-between items-center py-2">
                    <Link
                      href={`/contenidoPost/${post.id}`}
                      className="text-blue-500 hover:text-blue-800 truncate flex-1"
                      title={post.title}
                    >
                      {post.title}
                    </Link>

                    <Trash2
                      className="w-5 h-5 text-red-400 hover:text-red-800 cursor-pointer flex-shrink-0 transition-colors"
                      onClick={() => handleDeletePost(post.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mis Videos */}
          <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-xl shadow-inner max-h-64 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3 text-center text-gray-700">Mis Videos</h2>
            {myVideos.length === 0 ? (
              <p className="text-gray-500 text-center">No has subido videos.</p>
            ) : (
              <ul className="divide-y divide-gray-300">
                {myVideos.map((v) => (
                  <li key={v.id} className="flex justify-between items-center py-2">
                    <button
                      onClick={() => router.push(`/videos/${v.id}`)}
                      className="text-blue-600 hover:text-blue-800 truncate flex-1 text-left pr-3 cursor-pointer"
                    >
                      {v.title}
                    </button>

                    <button
                      onClick={() => deleteVideo(v.id)}
                      className="p-1 rounded transition"
                    >
                      <Trash2 className="hover:text-red-800 w-5 h-5 text-red-400 cursor-pointer" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
