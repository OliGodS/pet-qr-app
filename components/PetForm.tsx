"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface PetData {
    name: string;
    ownerName: string;
    phone: string;
    address: string;
    notes?: string;
}

interface PetFormProps {
    initialData?: PetData;
    onSubmit: (data: PetData) => Promise<void>;
    title: string;
    buttonText: string;
}

export default function PetForm({
    initialData,
    onSubmit,
    title,
    buttonText,
}: PetFormProps) {
    const [formData, setFormData] = useState<PetData>(
        initialData || {
            name: "",
            ownerName: "",
            phone: "",
            address: "",
            notes: "",
        }
    );
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver al Panel
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la Mascota
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                placeholder="Ej: Rocky"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Dueño
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.ownerName}
                                onChange={(e) =>
                                    setFormData({ ...formData, ownerName: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                placeholder="Tu Nombre"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono de Contacto
                        </label>
                        <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                            placeholder="+56 9 1234 5678"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Este número será visible para quien escanee la etiqueta.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección / Ubicación
                        </label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition h-24 resize-none"
                            placeholder="Calle, Número, Comuna, Ciudad"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Ej: Av. Providencia 1234, Providencia, Santiago
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas Adicionales (Opcional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition h-20 resize-none"
                            placeholder="Necesidades médicas, alergias, recompensas, etc."
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
