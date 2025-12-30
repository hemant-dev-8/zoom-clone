"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Simple storage
            router.push('/dashboard');
        } else {
            alert('Login failed');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
            <form onSubmit={handleLogin} className="p-8 bg-gray-800 rounded-xl w-96 space-y-4">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <input
                    className="w-full p-2 bg-gray-700 rounded text-white"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="w-full p-2 bg-gray-700 rounded text-white"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700">Login</button>
                <div className="text-center text-sm text-gray-400 mt-4">
                    Don't have an account? <a href="/register" className="text-blue-400 hover:text-blue-300">Register</a>
                </div>
            </form>
        </div>
    );
}
