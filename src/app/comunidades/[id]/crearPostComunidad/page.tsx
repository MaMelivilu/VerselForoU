"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import { addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db, storage } from "@/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useCommunities, Community } from "@/hooks/useCommunities";

interface MediaFile {
  url: string;
  type: "image" | "video";
}

export default function CreateCommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // 🔥 params es un Promise → debe usarse así en Next 15:
  const { id: comunidadId } = use(params);

  const { user } = useUser();
  const { firestoreUser, loading: userLoading } = useFirestoreUser();
  const { communities } = useCommunities();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seleccionar la comunidad correspondiente
  const community: Community | undefined = communities.find(c => c.id === comunidadId);

  useEffect(() => {
    if (user === null) router.push("/");
  }, [user, router]);

  if (!user || userLoading || !firestoreUser || !community)
    return <div>Cargando usuario...</div>;

  const handleAddMedia = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : null;

    if (!fileType) {
      alert("Solo se permiten imágenes o videos");
      return;
    }

    setUploading(true);

    try {
      const storageRef = ref(
        storage,
        `post_media/${user.uid}/${file.name}_${Date.now()}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setMediaFiles((prev) => [...prev, { url, type: fileType }]);
    } catch (error) {
      console.error("Error subiendo archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!firestoreUser || !community) return;

  // Asegurarse de tener comunidadId disponible
  const comunidadIdValue = community.id; // <- usa esto en lugar de communityId

  try {
    // 1️⃣ Crear post
    const postRef = await addDoc(collection(db, "posts"), {
      title,
      content,
      categories: categories.split(" ").filter((c) => c.startsWith("#")),
      mediaFiles,
      comunidadId: comunidadIdValue, // aquí usamos comunidadIdValue
      createdAt: serverTimestamp(),
      authorId: firestoreUser.id,
      authorName: firestoreUser.displayName,
      authorPhoto: firestoreUser.photoURL,
    });

    // 2️⃣ Obtener usuarios unidos a la comunidad (excepto autor)
    const usersSnap = await getDocs(
      query(
        collection(db, "users"),
        where("communitiesJoined", "array-contains", comunidadIdValue)
      )
    );

    const batch = writeBatch(db);
    usersSnap.forEach(userDoc => {
      if (userDoc.id === firestoreUser.id) return;

      const notifRef = doc(collection(db, `users/${userDoc.id}/notifications`));
      batch.set(notifRef, {
        type: "new_post",
        communityId: comunidadIdValue, // <- también aquí
        communityName: community.titulo,
        postId: postRef.id,
        message: `Se publicó un nuevo post en la comunidad "${community.titulo}"`,
        createdAt: serverTimestamp(),
        isRead: false
      });
    });

    await batch.commit();
    router.push(`/comunidades/${comunidadIdValue}`);
  } catch (error) {
    console.error("Error creando post o notificaciones:", error);
  }
};

  return (
    <div className="grid place-items-center h-screen">
      <main className="bg-white rounded-[10px] shadow-xl p-6 w-[90vh] h-[90vh] overflow-y-auto relative">

        {/* Cerrar */}
        <button
          onClick={() => router.push(`/comunidades/${comunidadId}`)}
          className="absolute top-2 right-2 text-red-500 text-4xl"
        >
          ×
        </button>

        <h1 className="text-3xl font-bold mb-6">Crear Post</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Título del post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="p-2 bg-gray-50 rounded"
          />

          <textarea
            placeholder="Contenido del post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="p-2 bg-gray-50 rounded h-40 resize-none"
          />

          <button
            type="button"
            onClick={handleAddMedia}
            className="bg-yellow-500 text-white py-2 rounded cursor-pointer hover:bg-yellow-700"
          >
            {uploading ? "Subiendo..." : "Subir multimedia"}
          </button>

          <div className="flex flex-wrap gap-2 mt-2">
            {mediaFiles.map((file, idx) => 
              file.type === 'image' ? (
                <img key={idx} src={file.url} alt={`preview-${idx}`} className="w-24 h-24 object-cover rounded border" />
              ) : (
                <video key={idx} src={file.url} className="w-32 h-24 rounded border" controls />
              )
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          <input
            type="text"
            placeholder="Categorías (ej: #nextjs #react)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="p-2 bg-gray-50 rounded"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded cursor-pointer hover:bg-blue-700"
          >
            Crear Post
          </button>
        </form>
      </main>
    </div>
  );
}
