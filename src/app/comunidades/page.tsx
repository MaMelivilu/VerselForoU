"use client";

import SideBar from "@/components/SideBar";
import { MessageCirclePlus, UsersRound } from "lucide-react";
import { useState } from "react";
import CreateCommunityModal from "@/components/CreateCommunityModal";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import { useCommunities } from "@/hooks/useCommunities";
import Link from "next/link";

export default function ComunidadesPage() {
  const [openModal, setOpenModal] = useState(false);
  const { firestoreUser } = useFirestoreUser();
  const { communities } = useCommunities();

  return (
    <div className="min-h-screen flex">
      <SideBar />

      <main className="min-h-screen p-6 ml-[23%] w-full">

        {/* Título */}
        <div className="flex justify-center gap-2 mb-10">
          <span className="text-3xl font-bold text-blue-600">BUSCA</span>
          <span className="text-3xl font-bold text-gray-600">TU</span>
          <span className="text-3xl font-bold text-yellow-600">COMUNIDAD</span>
        </div>

        {/* GRID de comunidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 px-4">
          {communities.map((c) => (
            <Link key={c.id} href={`/comunidades/${c.id}`}>
              <div className="bg-white rounded-xl shadow-xl border hover:shadow-2xl transition overflow-hidden cursor-pointer">

                {/* Banner */}
                <img
                  src={c.bannerUrl || "/default-banner.png"}
                  alt="banner"
                  className="w-full h-32 object-cover object-center"
                />

                {/* Título + descripción */}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 truncate">{c.titulo}</h2>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {c.descripcion}
                  </p>
                </div>

                {/* Creador + Miembros */}
                <div className="px-4 py-3 border-t flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.creatorPhoto || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Creator"
                    />
                    <span>{c.creatorName}</span>
                  </div>

                  <span className="flex gap-2">
                    <UsersRound className="text-blue-500" /> {c.miembrosCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Botón flotante */}
        <button
          onClick={() => setOpenModal(true)}
          className="fixed bottom-12 right-12 flex items-center justify-center transition cursor-pointer hover:text-blue-800"
        >
          <MessageCirclePlus className="text-blue-600 h-16 w-16 hover:fill-blue-600 hover:stroke-gray-200" />
        </button>

        {/* Modal */}
        <CreateCommunityModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          user={{
            id: firestoreUser?.id,
            name: firestoreUser?.displayName,
            photo: firestoreUser?.photoURL,
          }}
        />
      </main>
    </div>
  );
}
