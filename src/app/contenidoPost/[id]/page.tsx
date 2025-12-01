'use client'

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  setDoc 
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { useUser } from "@/hooks/useUser";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import VoteButton from "@/components/VoteButton";
import SideBar from "@/components/SideBar";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

interface Post {
  title: string;
  content: string;
  mediaFiles?: { type: "image" | "video"; url: string }[];
  authorId: string;        // ← CAMBIADO AQUÍ
  authorName: string;
  authorPhoto: string;
  createdAt: any;
  categories: string[];
}

interface Comment {
  id: string;
  text: string;
  authorId: string;        // ← CAMBIADO AQUÍ
  authorName: string;
  authorPhoto: string;
  createdAt: any;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const { user } = useUser();
  const { firestoreUser } = useFirestoreUser();
  const router = useRouter();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar post
  useEffect(() => {
    if (user === null) router.push("/");

    async function fetchPost() {
      try {
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost(postSnap.data() as Post);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Error al cargar el post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, user, router]);

  // Comentarios en tiempo real
  useEffect(() => {
    if (!post) return;
    const commentsRef = collection(db, "posts", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [post, id]);

  // Agregar comentario + actualización de logro + notificaciones
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !firestoreUser || !post) return;

    try {
      const commentsRef = collection(db, "posts", id, "comments");

      // Agregar comentario
      await addDoc(commentsRef, {
        text: commentText,
        authorId: firestoreUser.id,              // ← CAMBIADO
        authorName: firestoreUser.displayName,
        authorPhoto: firestoreUser.photoURL,
        createdAt: serverTimestamp()
      });

      setCommentText("");

      // Actualizar logro
      const logroRef = doc(db, "users", firestoreUser.id, "logros", "comments");
      const snap = await getDoc(logroRef);

      let current = 1;
      let level = 1;
      let goal = 10;
      let leveledUp = false;

      if (snap.exists()) {
        const data = snap.data() as any;
        current = data.current + 1;
        level = data.level;
        goal = data.goal;

        if (current > goal) {
          level += 1;
          current = 0;
          goal += 10;
          leveledUp = true;
        }
      }

      await setDoc(logroRef, { current, goal, level });

      // Notificación al autor del post
      if (firestoreUser.id !== post.authorId) {    // ← CAMBIADO
        const notifRef = doc(collection(db, `users/${post.authorId}/notifications`));
        await setDoc(notifRef, {
          type: "new_comment",
          postId: id,
          postTitle: post.title,
          fromUserId: firestoreUser.id,
          fromUserName: firestoreUser.displayName,
          message: `${firestoreUser.displayName} comentó tu post "${post.title}"`,
          createdAt: serverTimestamp(),
          isRead: false
        });
      }

      // Notificación por subir de nivel
      if (leveledUp) {
        const notifRef = doc(collection(db, `users/${firestoreUser.id}/notifications`));
        await setDoc(notifRef, {
          type: "level_up_comment",
          message: `🗨️ Has subido al nivel ${level}`,
          createdAt: serverTimestamp(),
          isRead: false
        });
      }

    } catch (error) {
      console.error("Error al agregar comentario o actualizar logro:", error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-700">Cargando post...</h1>
      </div>
    </div>
  );

  if (!post) return (
    <div className='grid place-items-center place-content-center h-screen'>
      <main className='grid place-items-center place-content-center bg-white rounded-[10px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] p-6 h-[90vh] w-[70vh]'>
        <h1 className='text-7xl font-bold text-gray-800 text-center'>
          Post no encontrado
        </h1>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <SideBar />

      <main className="min-h-screen w-400 p-6 flex justify-center ml-[8%]">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-6 flex flex-col gap-4 relative">
          <button
            onClick={() => router.push("/posts")}
            className="absolute top-2 right-2 text-red-500 font-bold text-4xl hover:text-red-800 cursor-pointer"
          >
            ×
          </button>

          {/* Post */}
          <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
          <p className="text-gray-700 mt-2">{post.content}</p>

          {/* Multimedia */}
          {post.mediaFiles && post.mediaFiles.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {post.mediaFiles.map((media, idx) => media.type === "video" ? (
                <video key={idx} src={media.url} className="rounded border" controls />
              ) : (
                <img key={idx} src={media.url} alt={`media-${idx}`} className="object-cover rounded border" />
              ))}
            </div>
          )}

          {/* Categorías */}
          {post.categories && post.categories.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">{post.categories.join(", ")}</div>
          )}

          {/* Autor */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-2">
              <img src={post.authorPhoto || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full"/>
              <span className="text-sm text-gray-500">Publicado por {post.authorName}</span>
            </div>
            
            <VoteButton postId={id} />
          </div>

          {/* Comentarios */}
          <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Agrega un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 rounded border border-gray-300 focus:outline-none"
            />
          </form>

          <div className="mt-4 flex flex-col gap-3">
            {comments.map(c => (
              <div key={c.id} className="flex gap-2 items-start bg-gray-50 p-2 rounded">
                <img src={c.authorPhoto || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full"/>
                <div>
                  <span className="text-sm font-semibold">{c.authorName}</span>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
