"use client";

import SideBar from "@/components/SideBar";
import { Users, BookOpen, Video, Star, PenSquare, GraduationCap } from "lucide-react";

export default function AcercaPage() {
  return (
    <div className="flex">
      <SideBar />

      
      <div className="ml-45 px-0 py-10 h-full w-full">

        
        <div className="w-full bg-blue-400 border-b border-blue-500 py-14 text-center">
          <h1 className="text-5xl font-bold text-white">
            Aprender nunca fue tan colaborativo
          </h1>
          <p className="max-w-4xl mx-auto text-lg text-blue-50 mt-4 leading-relaxed">
            ForoU es una comunidad académica creada para que los estudiantes encuentren respuestas,
            compartan conocimientos y se conecten con personas que estudian lo mismo. Desde dudas
            rápidas hasta debates profundos, siempre hay alguien dispuesto a ayudarte.
          </p>
        </div>

        
        <div className="max-w-4xl mx-auto h-px my-10"></div>

       
        <section className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Qué es ForoU?</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Somos una plataforma hecha por estudiantes y para estudiantes, donde aprender es 
            una experiencia social. Nuestro objetivo es facilitar el acceso a información útil, 
            fomentar el compañerismo y crear espacios donde el conocimiento fluya libremente.
          </p>
        </section>

       
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">

       
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <PenSquare className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Publicaciones</h3>
            <p className="text-gray-700">
              Comparte tus dudas, ideas, experiencias o recursos con otros estudiantes.
            </p>
          </div>

        
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Users className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Comunidades</h3>
            <p className="text-gray-700">
              Únete a grupos temáticos organizados por carreras, ramos o intereses académicos.
            </p>
          </div>

       
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Video className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">ForoShorts</h3>
            <p className="text-gray-700">
              Sube videos cortos explicativos o responde preguntas de forma rápida y visual.
            </p>
          </div>

       
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Star className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Favoritos</h3>
            <p className="text-gray-700">
              Guarda publicaciones importantes para revisarlas en cualquier momento.
            </p>
          </div>
        </section>

       
        <div className="max-w-4xl mx-auto h-px-300 my-24"></div>

    
        
        <div className="w-full bg-yellow-400 h-80 text-center flex items-center justify-center">
            <section className="max-w-3xl mx-auto text-center">
                <GraduationCap className="w-20 h-20 text-indigo-700 mx-auto" />
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Nuestra misión</h2>
                <p className="text-lg text-gray-800 leading-relaxed">
                Crear un espacio seguro, accesible y útil donde cada estudiante pueda aprender, 
                enseñar y formar parte de una comunidad académica fuerte.
                </p>
            </section>
        </div>

      </div>
    </div>
  );
}
