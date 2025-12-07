"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, Save } from "lucide-react";

interface ClaimTagFlowProps {
    id: string;
    onClaimed: () => void;
}

export default function ClaimTagFlow({ id, onClaimed }: ClaimTagFlowProps) {
    const { user, signInWithGoogle, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        petName: "",
        ownerName: "",
        address: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            await setDoc(doc(db, "pets", id), {
                ...formData,
                ownerId: user.uid,
                createdAt: new Date(),
            });
            onClaimed();
        } catch (error) {
            console.error("Error saving pet data:", error);
            alert("Error saving data. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Activate this Tag</h2>
                <p className="text-gray-600">
                    This QR code is not yet registered. Sign in to link it to your pet.
                </p>
                <button
                    onClick={signInWithGoogle}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Register Pet</h2>
                <p className="text-sm text-gray-500">ID: {id}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                    <input
                        required
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="e.g. Max"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input
                        required
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Your Name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="City, Neighborhood..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                    <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="+56 9 1234 5678"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Save & Activate
                </button>
            </form>
        </div>
    );
}
