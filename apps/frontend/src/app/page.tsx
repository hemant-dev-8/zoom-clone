"use client";
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
                Zoom Clone
            </h1>
            <p className="text-xl text-gray-400 mb-12">Antigravity Architecture • WebRTC • Scalable</p>

            <div className="flex gap-6 text-xl text-gray-400 mb-12">
                <Link href="/login" className="px-8 py-3 bg-gray-600 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Login
                </Link>
                <Link href="/register" className="px-8 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
