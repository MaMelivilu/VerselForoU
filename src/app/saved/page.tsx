'use client'

import SideBar from "@/components/SideBar"
import { useSavedVideos } from "@/hooks/useSavedVideos"
import { useSavedPosts } from "@/hooks/useSavedPosts"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HeartCrack, BookmarkMinus } from "lucide-react"

export default function SavedLikePage() {
  const { savedPosts, toggleSave, loading: loadingSaved } = useSavedPosts()
  const { likedVideos, removeLike, loading: loadingVideos } = useSavedVideos()
  const router = useRouter()

  const loading = loadingSaved || loadingVideos

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-xl font-semibold text-gray-600">Cargando...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <SideBar />

      <div className="min-h-screen p-6 flex justify-center ml-[23%]">
        <div className="w-250 bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Contenidos Guardados
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Posts Guardados */}
            <section className="bg-gray-50 p-4 rounded-xl shadow-inner max-h-200 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-3 text-center">Posts Guardados</h2>
              {savedPosts.length === 0 ? (
                <p className="text-gray-500 text-center">Aún no tienes posts guardados.</p>
              ) : (
                <ul className="divide-y divide-gray-300">
                  {savedPosts.map((post) => (
                    <li key={post.id} className="flex justify-between items-center py-2">
                      <Link
                        href={`/contenidoPost/${post.id}`}
                        className="text-blue-500 hover:text-blue-800 truncate flex-1"
                        title={post.title}
                      >
                        {post.title}
                      </Link>
                      <button onClick={() => toggleSave(post.id)}>
                        <BookmarkMinus className="w-5 h-5 text-yellow-500 hover:text-yellow-700" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Videos que me gustaron */}
            <section className="bg-gray-50 p-4 rounded-xl shadow-inner max-h-200 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-3 text-center">Videos que me gustaron</h2>
              {likedVideos.length === 0 ? (
                <p className="text-gray-500 text-center">Aún no has dado like.</p>
              ) : (
                <ul className="divide-y divide-gray-300">
                  {likedVideos.map((v) => (
                    <li key={v.id} className="flex justify-between items-center py-2">
                      <button
                        onClick={() => router.push(`/videos/${v.id}`)}
                        className="text-blue-600 hover:text-blue-800 truncate flex-1 text-left pr-3 cursor-pointer"
                      >
                        {v.title}
                      </button>
                      <button onClick={() => removeLike(v.id, v.likes)}>
                        <HeartCrack className="w-5 h-5 text-pink-500 cursor-pointer" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
