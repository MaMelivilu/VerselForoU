'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { db } from "@/firebase/client"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore"
import { useSavedPosts } from "@/hooks/useSavedPosts"
import { Bookmark, BookmarkCheck } from "lucide-react"
import VoteButton from "@/components/VoteButton"
import SideBar from "@/components/SideBar"
import NotificationsBell from "@/components/NotificationsBell"

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()
  const { firestoreUser, loading: userLoading } = useFirestoreUser()
  const { savedPosts, toggleSave, loading: savedLoading } = useSavedPosts()

  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [search, setSearch] = useState("")

  // NUEVO: logros del usuario
  const [postsLogro, setPostsLogro] = useState<{current: number, goal: number, level: number} | null>(null)
  const [commentsLogro, setCommentsLogro] = useState<{ current:number, goal:number, level:number } | null>(null);

  // Redirigir si no está logeado
  useEffect(() => {
    if (user === null) router.push("/")
  }, [user, router])

  // Cargar posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))
      const onlyGeneralPosts = postsData.filter((p: any) => !p.comunidadId)
      setPosts(onlyGeneralPosts)
      setFilteredPosts(onlyGeneralPosts)
      setLoadingPosts(false)
    })
    return () => unsubscribe()
  }, [])

  // Traer logro de posts del usuario
  useEffect(() => {
    if (!user) return
    const logroRef = doc(db, "users", user.uid, "logros", "posts")
    const unsubscribe = onSnapshot(logroRef, snap => {
      if (snap.exists()) setPostsLogro(snap.data() as any)
      else setPostsLogro(null)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) return;
    const logroRef = doc(db, "users", user.uid, "logros", "comments");
    const unsubscribe = onSnapshot(logroRef, snap => {
      if (snap.exists()) setCommentsLogro(snap.data() as any)
      else setCommentsLogro({ current: 0, goal: 10, level: 1 });
    });
    return () => unsubscribe();
  }, [user]);

  // Búsqueda
  useEffect(() => {
    const queryStr = search.trim().toLowerCase()
    if (!queryStr) { setFilteredPosts(posts); return }

    const categoriesQuery = queryStr.split(" ").filter(q => q.startsWith("#") && q.length > 1)
    const textQuery = queryStr.split(" ").filter(q => !q.startsWith("#")).join(" ")

    const filtered = posts.filter(post => {
      const titleMatch = textQuery ? post.title.toLowerCase().includes(textQuery) : true
      const categoriesMatch = categoriesQuery.length ? 
        categoriesQuery.every(cat => (post.categories || []).some((c:string)=>c.toLowerCase().startsWith(cat))) : true
      return titleMatch && categoriesMatch
    })
    setFilteredPosts(filtered)
  }, [search, posts])

  // Loader
  if (user === undefined || userLoading || loadingPosts || savedLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Cargando...</h1>
        </div>
      </div>
    )
  }

  function getPreview(text: string, wordLimit: number) {
    const words = text.split(" ")
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  return (
    <div className="min-h-screen flex relative">
      <SideBar />

      {/* Feed principal */}
      <main className="min-h-screen p-6 flex justify-center ml-[23%] w-full">
        <div className="w-400 max-w-240 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Buscar posts o categorías (#ejemplo)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-400 w-full"
          />

          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-center mt-10 text-xl">
              No hay posts que coincidan con la búsqueda.
            </p>
          ) : (
            filteredPosts.map(post => {
              const isSaved = savedPosts.some(p => p.id === post.id)
              return (
                <div key={post.id} className="relative bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-4 hover:shadow-lg transition-shadow w-full">
                  <Link href={`/contenidoPost/${post.id}`} className="block">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{post.title}</h2>
                    <p className="text-gray-600 mt-1">{getPreview(post.content, 20)}</p>

                    {post.mediaFiles && post.mediaFiles.length > 0 && (
                      <div className={`grid ${post.mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-4 mt-4 w-full`}>
                        {post.mediaFiles.map((media: any, idx: number) => (
                          <div key={idx} className="h-120 rounded overflow-hidden flex items-center justify-center">
                            {media.type === "video" ? (
                              <video src={media.url} className="max-w-full max-h-full" controls />
                            ) : (
                              <img src={media.url} alt={`media-${idx}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {post.categories && post.categories.length > 0 && (
                      <div className="mt-2 text-sm text-gray-400">{post.categories.join(", ")}</div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <img src={post.authorPhoto || "/default-avatar.png"} alt="avatar" className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-gray-400">Publicado por {post.authorName}</span>
                    </div>
                  </Link>

                  <div className="absolute bottom-3 right-3 flex items-center gap-4">
                    <VoteButton postId={post.id} />
                    {isSaved ? (
                      <BookmarkCheck
                        className="w-6 h-6 text-yellow-700 cursor-pointer hover:text-yellow-500 transition-colors"
                        onClick={e => { e.preventDefault(); toggleSave(post.id) }}
                      />
                    ) : (
                      <Bookmark
                        className="w-6 h-6 text-yellow-500 cursor-pointer hover:text-yellow-700 transition-colors"
                        onClick={e => { e.preventDefault(); toggleSave(post.id) }}
                      />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* NUEVO: Panel de logro flotante a la derecha */}
      {postsLogro && (
        <div className="fixed top-20 right-6 flex flex-col items-center justify-center p-2">
          <div className="relative w-20 h-20">
            {/* Círculo de fondo y progreso */}
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50%" cy="50%" r={47} fill="none" stroke="#e5e7ebff" strokeWidth="6" />
              <circle
                cx="50%"
                cy="50%"
                r={47}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - postsLogro.current / postsLogro.goal)}
                style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
              />
            </svg>

            {/* Icono central */}
            <div className="absolute inset-0 flex items-center justify-center text-lg select-none">
              📝
            </div>
          </div>

          {/* Texto debajo */}
          <div className="text-xs text-gray-600 mt-1 text-center">
            Publica posts
          </div>
          <div className="text-[10px] text-gray-400">
            {postsLogro.current}/{postsLogro.goal} | Nivel {postsLogro.level}
          </div>
        </div>
      )}

      {commentsLogro && (
        <div className="fixed top-[220px] right-6 flex flex-col items-center justify-center p-2">
          <div className="relative w-20 h-20">
            {/* Círculo de fondo y progreso */}
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={47} fill="none" stroke="#e5e7ebff" strokeWidth={6} />
              <circle
                cx="50"
                cy="50"
                r={47}
                fill="none"
                stroke="#f97316"  // Naranja para diferenciar del azul de posts
                strokeWidth={6}
                strokeDasharray={2 * Math.PI * 47}
                strokeDashoffset={2 * Math.PI * 47 * (1 - commentsLogro.current / commentsLogro.goal)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
              />
            </svg>

            {/* Icono central */}
            <div className="absolute inset-0 flex items-center justify-center text-lg select-none">
              🗨️
            </div>
          </div>

          {/* Texto debajo */}
          <div className="text-xs text-gray-600 mt-1 text-center">
            Comenta!!
          </div>
          <div className="text-[10px] text-gray-400">
            {commentsLogro.current}/{commentsLogro.goal} | Nivel {commentsLogro.level}
          </div>
        </div>
      )}

      <div className="relative flex mt-8 mr-50">
        <NotificationsBell />
      </div>
    </div>
  )
}
