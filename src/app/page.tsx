'use client';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link';
import Button from '@/components/ButtonGit';
import ButtonGit from '@/components/ButtonGit';
import ButtonGoogle from '@/components/ButtonGoogle';
import { loginWithGithub, loginWithGoogle } from '@/firebase/client';
import { useUser } from '@/hooks/useUser'


export default function Home() {

  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      router.push('/posts') // redirige al feed si está logueado
    }
  }, [user, router])

  if (user === undefined) return 
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h1 className="text-2xl font-bold text-gray-700">Cargando...</h1>
    </div>
  </div>
   // espera mientras carga

  
  return (

    <div className='grid place-items-center place-content-center h-screen'>
      <main className='grid place-items-center place-content-center bg-white rounded-[10px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] p-6 h-[90vh] w-[70vh]'>
        <h1 className='text-7xl font-bold text-gray-800'>
          Foro<span className='text-yellow-600'>U</span>
        </h1>
        <h2 className='text-2xl font-normal text-[#1e546d] mt-4 text-center'>
          Comparte tus conocimientos y resuelve <br /> tus dudas con la comunidad
        </h2>
        
        {/* Botones de inicio de sesión */}
        
        <ButtonGit onClick={loginWithGithub}>
          <img src="/github.png" className='w-10 mr-2 -ml-3'/>
          Iniciar con Github
        </ButtonGit>
        <ButtonGoogle onClick={loginWithGoogle}>
          <img src="/google.png" className='w-10 mr-2 -ml-3'/>
          Iniciar con Google
        </ButtonGoogle>
      </main>
    </div>
    
    
  );
}
