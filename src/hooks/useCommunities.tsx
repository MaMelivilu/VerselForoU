"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";

// Tipo actualizado de comunidad
export interface Community {
  id: string;
  titulo: string;
  descripcion: string;
  bannerUrl: string;
  creatorId: string;
  creatorName: string;       // ⭐ NUEVO
  creatorPhoto?: string | null; // ⭐ NUEVO
  miembrosCount: number;
  createdAt?: any;
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "comunidades"), (snapshot) => {
      const data: Community[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Community, "id">),
      }));
      setCommunities(data);
    });

    return () => unsub();
  }, []);

  return { communities };
}
