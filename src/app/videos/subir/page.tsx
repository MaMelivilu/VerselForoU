"use client";

import { useState } from "react";
import { db, storage } from "@/firebase/client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@/hooks/useUser";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import { Upload } from "lucide-react";

export default function UploadVideo() {
  const { user } = useUser();
  const { firestoreUser } = useFirestoreUser();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);


  const MAX_TITLE = 50;
  const MAX_DESCRIPTION = 150;
  const MAX_DURATION = 60; 

  const handleUpload = async () => {
    if (!user) return alert("Debes iniciar sesión para subir un video.");
    if (!videoFile) return alert("Selecciona un archivo de video.");


    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(videoFile);

    const isValidDuration = await new Promise<boolean>((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(videoElement.duration <= MAX_DURATION);
      };
    });

    if (!isValidDuration) {
      return alert("El video no puede durar más de 60 segundos.");
    }

    setUploading(true);

    try {
      const fileRef = ref(storage, `post_media/${user.uid}/${Date.now()}_${videoFile.name}`);
      const uploadResult = await uploadBytes(fileRef, videoFile);
      const videoURL = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, "videos"), {
        title,
        description,
        videoURL,
        userId: user.uid,
        username: firestoreUser?.displayName || "Usuario",
        usernamePhoto: firestoreUser?.photoURL || "",
        likes: [],
        createdAt: serverTimestamp(),
      });

      alert("Video subido con éxito");

      setVideoFile(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error subiendo el video:", err);
      alert("Error al subir el video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg w-[430px]">
      <h1 className="text-2xl font-bold mb-4">Subir Video</h1>

      <div className="w-full flex flex-col gap-3">
    
        <input
          type="text"
          value={title}
          placeholder="Título"
          maxLength={MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <p className="text-sm text-gray-500 text-right">
          {title.length}/{MAX_TITLE}
        </p>

        
        <textarea
          value={description}
          placeholder="Descripción"
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full h-24 resize-none"
        />
        <p className="text-sm text-gray-500 text-right">
          {description.length}/{MAX_DESCRIPTION}
        </p>

        <label className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center gap-2 justify-center">
          <Upload size={18} />
          Seleccionar archivo
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        <p
          className={`text-sm ${
            videoFile ? "text-green-600" : "text-gray-500 italic"
          }`}
        >
          {videoFile ? "Archivo seleccionado" : "Sin archivo seleccionado"}
        </p>

        <div className="w-full h-[240px] flex items-center justify-center bg-gray-100 border rounded-lg">
          {videoFile ? (
            <video
              src={URL.createObjectURL(videoFile)}
              controls
              className="rounded-lg w-full h-full object-cover"
            />
          ) : (
            <p className="text-gray-400">Vista previa del video</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-3 py-2 rounded text-white ${
            uploading ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Subiendo..." : "Subir Video"}
        </button>
      </div>
    </div>
  );
}
