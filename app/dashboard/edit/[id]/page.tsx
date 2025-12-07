"use client";

import PetForm from "@/components/PetForm";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";
import { Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EditPetPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [pet, setPet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                fetchPet(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, [router, id]);

    const fetchPet = async (userId: string) => {
        try {
            const docRef = doc(db, "pets", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId !== userId) {
                    alert("You do not have permission to edit this pet.");
                    router.push("/dashboard");
                    return;
                }
                setPet(data);
            } else {
                alert("Pet not found");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching pet:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePet = async (data: any) => {
        try {
            const docRef = doc(db, "pets", id);
            await updateDoc(docRef, data);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating pet:", error);
            alert("Failed to update pet.");
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `pet-qr-${pet.name}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    if (loading || !user || !pet) return <div className="p-8 text-center">Loading...</div>;

    const publicUrl = `${window.location.origin}/p/${id}`;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PetForm
                title={`Edit ${pet.name}`}
                buttonText="Save Changes"
                initialData={pet}
                onSubmit={handleUpdatePet}
            />

            <div className="max-w-2xl mx-auto px-4 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code Tag</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <QRCodeCanvas
                                id="qr-code"
                                value={publicUrl}
                                size={200}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <p className="text-gray-600">
                                This QR code links directly to your pet's public profile.
                                Print it and attach it to your pet's collar.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={downloadQR}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Download size={18} />
                                    Download QR Code
                                </button>
                                <Link
                                    href={`/p/${id}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <ExternalLink size={18} />
                                    Test Public Link
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
