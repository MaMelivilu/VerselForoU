"use client";

import { useState } from "react";
import { db, storage } from "@/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { X, Image as ImageIcon } from "lucide-react";

interface CreateCommunityModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    photo?: string | null;
  } | null;
}

export default function CreateCommunityModal({
  open,
  onClose,
  user,
}: CreateCommunityModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBanner(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!titulo.trim() || !descripcion.trim() || !banner) {
      alert("Todos los campos son obligatorios (incluye el banner).");
      return;
    }

    try {
      setLoading(true);

      // Subir banner al storage
      const bannerRef = ref(
        storage,
        `community_banners/${Date.now()}_${banner.name}`
      );
      await uploadBytes(bannerRef, banner);
      const bannerUrl = await getDownloadURL(bannerRef);

      // Crear comunidad en Firestore
      await addDoc(collection(db, "comunidades"), {
        titulo,
        descripcion,
        bannerUrl,
        creatorId: user.id,
        creatorName: user.name,
        creatorPhoto: user.photo || null,
        miembrosCount: 0,
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error("Error creando comunidad", err);
      alert("Error creando la comunidad. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[450px] shadow-xl relative">
        {/* Close button */}
        <button className="absolute right-4 top-4" onClick={onClose}>
          <X className="text-gray-500 hover:text-black" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Crear Comunidad</h2>

        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded mb-3"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        {/* Subir banner */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => document.getElementById("bannerInput")?.click()}
            className="w-full bg-gray-100 border p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 cursor-pointer"
          >
            <ImageIcon className="text-gray-600" />
            <span className="text-gray-700">
              {banner ? "Cambiar banner" : "Seleccionar banner"}
            </span>
          </button>

          <input
            id="bannerInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              className="w-full h-32 object-cover rounded mt-3 border"
            />
          )}
        </div>

        <button
          disabled={loading}
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-1"
        >
          {loading ? "Creando..." : "Crear Comunidad"}
        </button>
      </div>
    </div>
  );
}
