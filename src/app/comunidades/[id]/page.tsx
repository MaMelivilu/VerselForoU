'use client'

import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/firebase/client"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { useSavedPosts } from "@/hooks/useSavedPosts"
import { useCommunities, Community } from "@/hooks/useCommunities"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore"
import { Bookmark, BookmarkCheck, UsersRound } from "lucide-react"
import VoteButton from "@/components/VoteButton"
import SideBar from "@/components/SideBar"
import CreateCommunityPostButton from "@/components/CreateCommunityPost"

export default function CommunityFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: comunidadId } = use(params)
  const router = useRouter()
  const { firestoreUser, loading: userLoading } = useFirestoreUser()
  const { savedPosts, toggleSave, loading: savedLoading } = useSavedPosts()
  const { communities } = useCommunities()

  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [search, setSearch] = useState("")

  // Seleccionar la comunidad correspondiente
  const community: Community | undefined = communities.find(c => c.id === comunidadId)

  // Cargar posts de la comunidad en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("comunidadId", "==", comunidadId),
      orderBy("createdAt", "desc")
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }))
      setPosts(postsData)
      setFilteredPosts(postsData)
      setLoadingPosts(false)
    })
    return () => unsubscribe()
  }, [comunidadId])

  // Búsqueda local
  useEffect(() => {
    const queryStr = search.trim().toLowerCase()
    if (!queryStr) {
      setFilteredPosts(posts)
      return
    }

    const categoriesQuery = queryStr
      .split(" ")
      .filter((q) => q.startsWith("#") && q.length > 1)

    const textQuery = queryStr
      .split(" ")
      .filter((q) => !q.startsWith("#"))
      .join(" ")

    const filtered = posts.filter((post: any) => {
      const titleMatch = textQuery
        ? post.title.toLowerCase().includes(textQuery)
        : true

      const categoriesMatch = categoriesQuery.length
        ? categoriesQuery.every((cat) =>
            (post.categories || []).some((c: string) =>
              c.toLowerCase().startsWith(cat)
            )
          )
        : true

      return titleMatch && categoriesMatch
    })

    setFilteredPosts(filtered)
  }, [search, posts])

  if (userLoading || loadingPosts || savedLoading || !community) {
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

  // Función para unirse/salir de comunidad
  const toggleJoinCommunity = async () => {
    if (!firestoreUser || !community) return
    const userRef = doc(db, "users", firestoreUser.id)
    const communityRef = doc(db, "comunidades", comunidadId)
    const isJoined = firestoreUser.communitiesJoined?.includes(comunidadId) || false

    try {
      if (!isJoined) {
        await updateDoc(userRef, {
          communitiesJoined: arrayUnion(comunidadId)
        })
        await updateDoc(communityRef, { miembrosCount: increment(1) })
      } else {
        await updateDoc(userRef, {
          communitiesJoined: arrayRemove(comunidadId)
        })
        await updateDoc(communityRef, { miembrosCount: increment(-1) })
      }
    } catch (error) {
      console.error("Error al actualizar la comunidad:", error)
    }
  }

  const isJoined = firestoreUser?.communitiesJoined?.includes(comunidadId)

  return (
    <div className="min-h-screen flex">
      <SideBar />

      <main className="min-h-screen p-6 ml-[23%] w-full flex flex-col gap-6">

        {/* Banner comunidad */}
        <div className="relative -ml-[10%] w-370 h-80 rounded-lg overflow-hidden shadow-lg">
          {community.bannerUrl ? (
            <img src={community.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Sin banner</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 flex justify-between items-center">
            <div>
              <h1 className="text-white text-2xl font-bold">{community.titulo}</h1>
              <p className="text-gray-300">{community.descripcion}</p>
            </div>

            {firestoreUser && (
              <div className="flex flex-col items-end">
                <span className="text-white font-semibold flex gap-2 mb-2">
                  <UsersRound />{community.miembrosCount}
                </span>
                <button
                  className={`px-4 py-2 rounded text-white transition ${
                    isJoined ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                  onClick={toggleJoinCommunity}
                >
                  {isJoined ? 'Salir' : 'Unirse'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mostrar botón de crear post solo si está unido */}
        {isJoined && <CreateCommunityPostButton communityId={comunidadId} />}

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
              No hay posts en esta comunidad.
            </p>
          ) : (
            filteredPosts.map((post: any) => {
              const isSaved = savedPosts.some((p) => p.id === post.id)
              return (
                <div
                  key={post.id}
                  className="relative bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-4 hover:shadow-lg transition-shadow w-full"
                >
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
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(post.id)
                        }}
                      />
                    ) : (
                      <Bookmark
                        className="w-6 h-6 text-yellow-500 cursor-pointer hover:text-yellow-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(post.id)
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
