"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { Loader2, CheckCircle, AlertTriangle, Download } from "lucide-react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function SeedPage() {
    const [singleId, setSingleId] = useState("");

    // Batch state
    const [prefix, setPrefix] = useState("PET-");
    const [startNum, setStartNum] = useState(100);
    const [count, setCount] = useState(10);
    const [customBaseUrl, setCustomBaseUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleGenerateSingle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!singleId.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const { setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "qrs", singleId.trim().toUpperCase()), {
                status: "available",
                createdAt: serverTimestamp(),
            });
            setMessage({ type: "success", text: `QR "${singleId.toUpperCase()}" generado correctamente.` });
            setSingleId("");
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Error al generar QR." });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const batch = writeBatch(db);
            const zip = new JSZip();
            const generatedIds: string[] = [];

            // Base URL: Use custom if provided, otherwise detect current
            const baseUrl = customBaseUrl.trim() || window.location.origin;

            for (let i = 0; i < count; i++) {
                const num = startNum + i;
                // Pad number with zeros (e.g. 001)
                const paddedNum = num.toString().padStart(3, '0');
                const id = `${prefix}${paddedNum}`.toUpperCase();

                // 1. Add to Firestore Batch
                const qrRef = doc(db, "qrs", id);
                batch.set(qrRef, {
                    status: "available",
                    createdAt: serverTimestamp(),
                });

                // 2. Generate QR Image
                const url = `${baseUrl}/p/${id}`;
                const qrDataUrl = await QRCode.toDataURL(url, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff',
                    },
                });

                // 3. Add to ZIP (remove "data:image/png;base64," prefix)
                const base64Data = qrDataUrl.split(',')[1];
                zip.file(`${id}.png`, base64Data, { base64: true });

                generatedIds.push(id);
            }

            // Commit to Firestore
            await batch.commit();

            // Generate and download ZIP
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `qrs-${prefix}${startNum}-to-${startNum + count - 1}.zip`);

            setMessage({
                type: "success",
                text: `Se generaron ${count} QRs usando base "${baseUrl}" y se descargó el ZIP.`
            });

        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Error en la generación masiva." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Generador de QRs (Admin)</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Single QR */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Individual</h2>
                        <form onSubmit={handleGenerateSingle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Manual</label>
                                <input
                                    type="text"
                                    value={singleId}
                                    onChange={(e) => setSingleId(e.target.value)}
                                    placeholder="Ej: TEST-001"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !singleId.trim()}
                                className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                Generar Uno
                            </button>
                        </form>
                    </div>

                    {/* Batch QR */}
                    <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Masivo + Descarga</h2>
                        <form onSubmit={handleGenerateBatch} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-800 mb-1">Prefijo</label>
                                    <input
                                        type="text"
                                        value={prefix}
                                        onChange={(e) => setPrefix(e.target.value)}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-800 mb-1">Inicio #</label>
                                    <input
                                        type="number"
                                        value={startNum}
                                        onChange={(e) => setStartNum(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    max={500}
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-blue-600 mt-1">Máximo recomendado: 100 por lote</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-1">Base URL (Opcional)</label>
                                <input
                                    type="text"
                                    value={customBaseUrl}
                                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                                    placeholder="Ej: http://192.168.1.5:3000"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-blue-600 mt-1">Útil para pruebas locales en móvil (usa tu IP local)</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                Generar y Descargar ZIP
                            </button>
                        </form>
                    </div>
                </div>

                {message && (
                    <div className={`mt-8 p-4 rounded-lg flex items-start gap-3 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                        {message.type === "success" ? <CheckCircle className="shrink-0 mt-0.5" size={20} /> : <AlertTriangle className="shrink-0 mt-0.5" size={20} />}
                        <p>{message.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
