"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { MapPin, Clock, ExternalLink } from "lucide-react";

interface ScanData {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: any;
}

export default function ScanHistory({ petId }: { petId: string }) {
    const [scans, setScans] = useState<ScanData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "pets", petId, "scans"),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newScans = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ScanData[];
            setScans(newScans);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [petId]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading history...</div>;

    if (scans.length === 0) return null;

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-red-500" size={20} />
                Recent Locations
            </h3>

            <div className="space-y-4">
                {scans.map((scan) => (
                    <div key={scan.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Clock size={14} />
                                {scan.timestamp?.toDate().toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-400">
                                Lat: {scan.latitude.toFixed(4)}, Lng: {scan.longitude.toFixed(4)}
                            </p>
                        </div>

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${scan.latitude},${scan.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                            title="View on Google Maps"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
