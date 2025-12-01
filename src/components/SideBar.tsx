'use client'

import Link from "next/link"
import { LogOut, House, PencilLine, Users, Video, Star, ScrollText, Info, BookOpen } from "lucide-react"
import { logout } from "@/firebase/client"
import { useUser } from "@/hooks/useUser"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { useRouter } from "next/navigation"

export default function SideBar() {
  const { user } = useUser()
  const router = useRouter()
  const { firestoreUser } = useFirestoreUser()

  return (
    <aside className="w-64 bg-white shadow-2xl flex flex-col p-4 fixed h-full">
      
      {/* USUARIO */}
      {firestoreUser && (
        <Link href="/perfil">
          <div className="flex items-center gap-3 mb-6 cursor-pointer">
            <img
              src={firestoreUser.photoURL || "/default-avatar.png"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover object-center"
            />
            <span className="font-semibold">{firestoreUser.displayName}</span>
          </div>
        </Link>
      )}

      {/* HOME */}
      <Link
        href="/posts"
        className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
      >
        <House className="mr-2" />
        Home
      </Link>

      {/* CREAR POST */}
      <Link
        href="/crearPost"
        className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
      >
        <PencilLine className="mr-2" />
        Crear Post
      </Link>



      {/* COMUNIDADES */}
      <Link
        href="/comunidades"
        className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
      >
        <Users className="mr-2" />
        Comunidades
      </Link>

      {/* 🔥 ForoShorts restaurado */}
        <Link
          href="/videos"
          className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
        >
          <Video className="mr-2" />
          ForoShorts
        </Link>

        {/* ⭐ Favoritos */}
        <Link
          href="/saved"
          className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
        >
          <Star className="mr-2" />
          Favoritos
        </Link>

        <div className="mt-auto flex flex-col">

          <Link
            href="/info/acerca"
            className="mb-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
          >
            <BookOpen className="mr-2" />
            Acerca de ForoU
          </Link>


          
          <Link
            href="/info/reglas"
            className="mb-7 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 flex items-center gap-2"
          >
            <ScrollText className="mr-2" />
            Reglas ForoU
          </Link>




          {/* LOGOUT */}
          <button
            onClick={() => logout(router)}
            className="mt-auto px-3 py-2 text-red-400 rounded hover:bg-gray-100 hover:text-red-500 text-[18px] flex items-center gap-2"
          >
            <LogOut className="mr-2" />
            Cerrar sesión
          </button>
        </div>
    </aside>
  )
}
