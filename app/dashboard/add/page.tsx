"use client";

import PetForm from "@/components/PetForm";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

function AddPetContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefilledId = searchParams.get("id");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // If there's an ID, keep it in the URL when redirecting to login (optional improvement for later)
                router.push("/login");
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleAddPet = async (data: any) => {
        if (!user) return;

        try {
            const { writeBatch, doc, getDoc, collection, addDoc } = await import("firebase/firestore");
            const batch = writeBatch(db);

            if (prefilledId) {
                const normalizedId = prefilledId.toUpperCase();

                // 1. Validate QR
                const qrRef = doc(db, "qrs", normalizedId);
                const qrSnap = await getDoc(qrRef);

                if (!qrSnap.exists() || qrSnap.data().status !== "available") {
                    alert("Este código QR no es válido o ya ha sido utilizado.");
                    return;
                }

                // 2. Create Pet
                const petRef = doc(db, "pets", normalizedId);
                batch.set(petRef, {
                    ...data,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                    photoURL: null,
                });

                // 3. Link QR
                batch.update(qrRef, {
                    status: "linked",
                    petId: normalizedId,
                    ownerId: user.uid,
                    linkedAt: serverTimestamp(),
                });

                await batch.commit();
            } else {
                // Generate a new ID (using addDoc)
                // Note: This flow might be restricted in the future
                await addDoc(collection(db, "pets"), {
                    ...data,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                    photoURL: null,
                });
            }
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding pet:", error);
            alert("Error al registrar la mascota. Por favor intenta de nuevo.");
        }
    };

    if (!user) return null;

    return (
        <PetForm
            title={prefilledId ? `Activar Etiqueta: ${prefilledId}` : "Registrar Nueva Mascota"}
            buttonText="Registrar Mascota"
            onSubmit={handleAddPet}
        />
    );
}

export default function AddPetPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddPetContent />
        </Suspense>
    );
}
