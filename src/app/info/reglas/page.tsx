"use client";

import SideBar from "@/components/SideBar";
import {
  Handshake,
  BookOpenText,
  ShieldAlert,
  Quote,
  MegaphoneOff,
  Ban,
} from "lucide-react";

export default function ReglasPage() {
  return (
    <main className="flex">
      <SideBar />

      <div className="ml-45 px-0 py-9 h-full w-full">

        <div className="w-full bg-yellow-400 py-14 text-center">
          <h1 className="text-5xl font-bold text-gray-900">Reglas de ForoU</h1>
          <p className="max-w-3xl mx-auto text-gray-800 text-lg mt-4 leading-relaxed">
            Estas normas mantienen la comunidad segura, respetuosa y enfocada en el aprendizaje.
          </p>
        </div>

        <div className="max-w-4xl mx-auto h-px my-10"></div>

        <section className="max-w-4xl mx-auto text-center mb-16 px-6">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">¿Por qué existen estas reglas?</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            ForoU es un espacio académico donde buscamos mantener la colaboración, el respeto y el 
            intercambio de información útil entre estudiantes.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto px-6 pb-20">

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Handshake className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Respeto entre usuarios</h3>
            <p className="text-gray-700">
              No se permiten insultos, discriminación, acoso o actitudes hostiles. Este foro promueve
              el apoyo académico y un ambiente sano.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <BookOpenText className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Contenido académico y relevante</h3>
            <p className="text-gray-700">
              Las publicaciones deben estar relacionadas con estudios, materiales, proyectos,
              vida universitaria y dudas sobre DUOC UC.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No compartir información personal</h3>
            <p className="text-gray-700">
              Está prohibido publicar correos, RUT, direcciones, documentos o datos sensibles tuyos o de otros.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Ban className="h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Contenido ilegal o inapropiado</h3>
            <p className="text-gray-700">
              No se permite contenido sexual, violento, ilegal, filtraciones o venta de trabajos académicos.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <Quote className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Citas y fuentes cuando corresponda</h3>
            <p className="text-gray-700">
              Cuando compartas material académico, intenta acreditar fuentes y respetar el uso justo del contenido.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
            <MegaphoneOff className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No spam ni publicidad</h3>
            <p className="text-gray-700">
              No promociones servicios, ventas o redes sociales sin autorización. Evita el contenido repetitivo.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
