"use client";

import { signInWithGoogle } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err) {
            setError("Error al iniciar sesión. Por favor intenta de nuevo.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Inicia sesión en tu cuenta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gestiona tus mascotas y códigos QR
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    );
}
