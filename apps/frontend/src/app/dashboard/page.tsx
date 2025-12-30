"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [meetingId, setMeetingId] = useState('');

    const startMeeting = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await fetch('http://localhost:3002/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host_id: user.id || 'test-host', title: 'New Meeting' })
        });
        const data = await res.json();
        router.push(`/meeting/${data.id}`);
    };

    const joinMeeting = () => {
        if (meetingId) router.push(`/meeting/${meetingId}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="flex gap-8">
                <div onClick={startMeeting} className="w-40 h-40 bg-orange-500 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition">
                    <span className="text-4xl">📹</span>
                    <span className="font-bold mt-2">New Meeting</span>
                </div>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            className="bg-gray-800 p-2 rounded border border-gray-700"
                            placeholder="Meeting ID"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                        />
                        <button onClick={joinMeeting} className="bg-blue-600 px-4 rounded hover:bg-blue-700">Join</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
