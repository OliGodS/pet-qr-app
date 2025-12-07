"use client";

import { useState } from "react";
import { Phone, MapPin, User as UserIcon, Send, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PetData {
    petName: string;
    ownerName: string;
    address?: string;
    phone: string;
    ownerId: string;
}

interface PublicPetProfileProps {
    data: PetData;
    isOwner: boolean;
    onEdit: () => void;
    petId: string;
}

export default function PublicPetProfile({ data, isOwner, onEdit, petId }: PublicPetProfileProps) {
    const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocationStatus("loading");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await addDoc(collection(db, "pets", petId, "scans"), {
                        latitude,
                        longitude,
                        timestamp: serverTimestamp(),
                        userAgent: navigator.userAgent,
                    });
                    setLocationStatus("success");
                } catch (error) {
                    console.error("Error saving location:", error);
                    setLocationStatus("error");
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationStatus("error");
            }
        );
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg overflow-hidden relative">
            <div className="bg-blue-600 h-32 absolute top-0 left-0 w-full z-0"></div>

            <div className="relative z-10 flex flex-col items-center mt-12">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md mb-4 flex items-center justify-center">
                    {/* Placeholder for Pet Image - could be added later */}
                    <span className="text-4xl">🐶</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-1">{data.petName}</h1>
                <p className="text-gray-500 mb-6">I am lost, please help me!</p>

                <div className="w-full space-y-4">
                    <a
                        href={`tel:${data.phone}`}
                        className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-3 text-lg"
                    >
                        <Phone size={24} />
                        Call Owner
                    </a>

                    {/* Location Sharing Section */}
                    {!isOwner && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-orange-800 mb-3 font-medium">
                                Help the owner find {data.petName} by sharing your current location.
                            </p>

                            {locationStatus === "success" ? (
                                <div className="text-green-600 font-semibold flex items-center justify-center gap-2">
                                    <MapPin size={18} /> Location Sent!
                                </div>
                            ) : (
                                <button
                                    onClick={handleShareLocation}
                                    disabled={locationStatus === "loading"}
                                    className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {locationStatus === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    Share My Location
                                </button>
                            )}
                            {locationStatus === "error" && (
                                <p className="text-xs text-red-500 mt-2">Could not get location. Please allow permissions.</p>
                            )}
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                        <div className="flex items-start gap-3 text-gray-700">
                            <UserIcon className="text-blue-500 shrink-0 mt-1" size={20} />
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Owner</p>
                                <p className="font-medium">{data.ownerName}</p>
                            </div>
                        </div>

                        {data.address && (
                            <div className="flex items-start gap-3 text-gray-700">
                                <MapPin className="text-red-500 shrink-0 mt-1" size={20} />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Address</p>
                                    <p className="font-medium">{data.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={onEdit}
                        className="mt-8 text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
}
