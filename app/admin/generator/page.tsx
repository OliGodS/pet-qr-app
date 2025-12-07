"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, RefreshCw } from "lucide-react";

export default function QRGeneratorPage() {
    const [count, setCount] = useState(10);
    const [codes, setCodes] = useState<string[]>([]);
    const [baseUrl, setBaseUrl] = useState("https://pet-qr-app.vercel.app"); // Default, user can change

    const generateCodes = () => {
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            // Generate a random 8-character ID (enough for small scale, collision unlikely for MVP)
            const id = Math.random().toString(36).substring(2, 10).toUpperCase();
            newCodes.push(id);
        }
        setCodes(newCodes);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto print:max-w-none">

                {/* Controls - Hidden when printing */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 print:hidden space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">QR Code Generator</h1>
                    <p className="text-gray-600">Generate unique codes for your pet tags. Print this page to get labels.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tags</label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg"
                                min="1"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="https://your-domain.com"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={generateCodes}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Generate
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={codes.length === 0}
                                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid of QR Codes */}
                {codes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 print:grid-cols-4 print:gap-4">
                        {codes.map((code) => (
                            <div key={code} className="flex flex-col items-center p-4 border rounded-lg bg-white break-inside-avoid">
                                <QRCodeSVG
                                    value={`${baseUrl}/p/${code}`}
                                    size={120}
                                    level="H"
                                />
                                <div className="mt-2 text-center">
                                    <p className="font-mono font-bold text-lg">{code}</p>
                                    <p className="text-xs text-gray-500">Scan to Activate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
