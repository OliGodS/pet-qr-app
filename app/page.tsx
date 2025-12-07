"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [id, setId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim()) {
      router.push(`/p/${id.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-full shadow-sm hover:bg-blue-50 transition-colors"
        >
          <LogIn size={18} />
          Acceso Dueño
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <QrCode className="text-blue-600 w-10 h-10" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Pet QR Safety
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Protege a tu amigo peludo. Escanea una etiqueta para encontrar al dueño, o ingresa el ID manualmente abajo.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto relative">
          <input
            type="text"
            placeholder="Ingresa ID de Etiqueta (ej. 12345)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-lg transition shadow-sm pr-14"
          />
          <button
            type="submit"
            disabled={!id.trim()}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 transition"
          >
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">¿Encontraste una mascota?</h3>
            <p className="text-sm text-gray-500">Escanea su etiqueta o ingresa el ID para contactar al dueño inmediatamente.</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">¿Nueva Etiqueta?</h3>
            <p className="text-sm text-gray-500">Ingresa el ID de tu nueva etiqueta para activarla y vincular a tu mascota.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
