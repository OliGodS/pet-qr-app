"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone, MapPin, AlertTriangle, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";

interface Pet {
    name: string;
    ownerName: string;
    phone: string;
    address: string;
    notes?: string;
    ownerId: string;
}

export default function PublicProfile() {
    const params = useParams();
    const id = params.id as string;
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locationStatus, setLocationStatus] = useState<"pending" | "success" | "denied" | "error">("pending");
    const [isUnregistered, setIsUnregistered] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPetAndRecordScan();
        }
    }, [id]);

    const fetchPetAndRecordScan = async () => {
        try {
            // Normalize ID to uppercase for consistency
            const normalizedId = id.toUpperCase();

            // 1. Fetch Pet Data (Try normalized ID first as that's our new standard)
            let docRef = doc(db, "pets", normalizedId);
            let docSnap = await getDoc(docRef);

            // Fallback: Try exact ID if normalized didn't work (for legacy/lowercase urls compatibility if needed)
            if (!docSnap.exists() && id !== normalizedId) {
                const originalDocRef = doc(db, "pets", id);
                const originalDocSnap = await getDoc(originalDocRef);
                if (originalDocSnap.exists()) {
                    docRef = originalDocRef;
                    docSnap = originalDocSnap;
                }
            }

            if (docSnap.exists()) {
                setPet(docSnap.data() as Pet);
                // 2. Request Location & Record Scan
                requestLocationAndRecord(docSnap.id, docSnap.data().ownerId);
            } else {
                // 3. If pet doesn't exist, check if it's a valid QR (always check normalized)
                const qrRef = doc(db, "qrs", normalizedId);
                const qrSnap = await getDoc(qrRef);

                if (qrSnap.exists() && qrSnap.data().status === "available") {
                    setIsUnregistered(true);
                } else {
                    setError("Este código QR no es válido o no ha sido activado por el administrador.");
                }
            }
        } catch (err) {
            console.error("Error fetching pet:", err);
            setError("Ocurrió un error al cargar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    const requestLocationAndRecord = (petId: string, ownerId: string) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Success
                    setLocationStatus("success");
                    await recordScan(petId, ownerId, {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                async (error) => {
                    // Error or Denied
                    console.warn("Geolocation error:", error);
                    setLocationStatus(error.code === 1 ? "denied" : "error");
                    await recordScan(petId, ownerId, null);
                }
            );
        } else {
            // Not supported
            setLocationStatus("error");
            recordScan(petId, ownerId, null);
        }
    };

    const recordScan = async (petId: string, ownerId: string, location: { lat: number; lng: number } | null) => {
        try {
            await addDoc(collection(db, "scans"), {
                petId,
                ownerId,
                location,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
            });
        } catch (err) {
            console.error("Error recording scan:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (isUnregistered) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PlusCircle className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Nueva Etiqueta Detectada!</h1>
                    <p className="text-gray-600 mb-8">
                        Este código QR (ID: <span className="font-mono font-bold">{id}</span>) aún no está vinculado a una mascota.
                    </p>
                    <Link
                        href={`/dashboard/add?id=${id}`}
                        className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                    >
                        Activar esta Etiqueta
                    </Link>
                    <p className="mt-4 text-xs text-gray-400">
                        Necesitarás iniciar sesión para registrar esta etiqueta.
                    </p>
                </div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <AlertTriangle className="text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil No Encontrado</h1>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 p-4 pb-20">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-blue-500">
                <div className="bg-blue-600 p-6 text-center text-white">
                    <h1 className="text-3xl font-extrabold mb-2">I'm Lost!</h1>
                    <p className="text-blue-100">Please help me get home.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-1">{pet.name}</h2>
                        <p className="text-gray-500">My Owner: {pet.ownerName}</p>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-red-700">Important Notes</h3>
                            <p className="text-red-600 text-sm">{pet.notes || "No special medical needs or notes."}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <a
                            href={`tel:${pet.phone}`}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg transition transform active:scale-95"
                        >
                            <Phone size={24} />
                            Call Owner
                        </a>

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pet.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-lg font-bold transition"
                        >
                            <MapPin size={24} />
                            View Home Address
                        </a>
                    </div>

                    <div className="pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                        <p>Scan Location Status: {locationStatus === "success" ? "Shared ✅" : locationStatus === "denied" ? "Denied ❌" : "Pending..."}</p>
                        <p className="mt-1">Thank you for helping!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
