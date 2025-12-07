"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Plus, QrCode, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/firebase";

interface Pet {
    id: string;
    name: string;
    ownerName: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                fetchPets(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchPets = async (userId: string) => {
        try {
            const q = query(collection(db, "pets"), where("ownerId", "==", userId));
            const querySnapshot = await getDocs(q);
            const petsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Pet[];
            setPets(petsData);
        } catch (error) {
            console.error("Error fetching pets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline">
                            {user?.displayName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 transition"
                            title="Sign out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {pets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode className="text-blue-500" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No pets registered yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Add your first pet to generate a QR code tag.
                        </p>
                        <Link
                            href="/dashboard/add"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm"
                        >
                            <Plus size={20} />
                            Add New Pet
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pets.map((pet) => (
                            <div
                                key={pet.id}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {pet.name.charAt(0).toUpperCase()}
                                    </div>
                                    <Link
                                        href={`/dashboard/edit/${pet.id}`}
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        <Settings size={20} />
                                    </Link>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {pet.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Owner: {pet.ownerName}
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/p/${pet.id}`}
                                        target="_blank"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
                                    >
                                        <QrCode size={16} />
                                        View QR
                                    </Link>
                                </div>
                            </div>
                        ))}
                        <Link
                            href="/dashboard/qr-tool"
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition gap-2"
                        >
                            <QrCode size={32} />
                            <span className="font-medium">QR Generator Tool</span>
                        </Link>
                        <Link
                            href="/dashboard/add"
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition gap-2"
                        >
                            <Plus size={32} />
                            <span className="font-medium">Add Another Pet</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
