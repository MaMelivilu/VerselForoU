import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAil3tVwDcnX3mnXLT1zYgrYwGcEzkIe4U",
  authDomain: "forou-336b0.firebaseapp.com",
  projectId: "forou-336b0",
  storageBucket: "forou-336b0.firebasestorage.app",
  messagingSenderId: "565614132198",
  appId: "1:565614132198:web:75f371c94701f762103427",
  measurementId: "G-2C4L751QG8"
};

// Inicializar app
export const app = initializeApp(firebaseConfig);

// Inicializar auth
export const auth = getAuth(app);

// Inicializar fireStore
export const db = getFirestore(app);

// Inicializar Storage
export const storage = getStorage(app);



// Guardar usuario en Firestore
async function createUserIfNotExists(user: any) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Si no existe, crear el documento
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date()
    });
  }
  // Si ya existe, no hace nada
}

// Login con Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserIfNotExists(result.user);
  return result.user;
}

// Login con GitHub
export const loginWithGithub = async () => {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserIfNotExists(result.user);
  return result.user;
}

// Logout
export const logout = async (router: any) => {
  await auth.signOut();
  router.push("/");
}