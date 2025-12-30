"use client";
import { useEffect, useState } from 'react';
import { useMediaSFU } from '../../../hooks/useMediaSFU';
import { useSignaling } from '../../../hooks/useSignaling';
import VideoGrid from '../../../components/VideoGrid';
import { useMeetingStore } from '../../../store/meetingStore';

export default function MeetingPage({ params }: { params: { id: string } }) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Mock User (Should come from Auth/Context)
    const [user, setUser] = useState({ id: `user-${Math.random()}`, name: 'Me' });

    // Hooks
    const { produce } = useMediaSFU(params.id);
    const { chatMessages, sendMessage } = useSignaling(params.id, user.id, user.name);
    const { peers } = useMeetingStore();

    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        // Only access navigator in client
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));

            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                setLocalStream(stream);
                stream.getTracks().forEach(track => produce(track));
            });
        }
    }, []);

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        sendMessage(chatInput);
        setChatInput('');
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const handleLeave = () => {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        // Navigate back to home
        window.location.href = '/';
    };

    const allPeers = Object.values(peers); // Remotes
    // In a real app, we'd merge local stream into the grid or show it as PiP
    const displayPeers = localStream
        ? [{ id: user.id, stream: localStream, name: 'Me (Local)' }, ...allPeers]
        : allPeers;

    return (
        <div className="h-screen w-screen flex flex-col bg-black text-white">
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">Meeting: {params.id}</h1>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-800 rounded text-sm"> {allPeers.length + 1} Participants</span>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <VideoGrid peers={displayPeers} />
                </div>

                {chatOpen && (
                    <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-900">
                        <div className="p-4 border-b border-gray-800 font-bold">Chat</div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className="text-sm">
                                    <span className="font-bold text-gray-400">{msg.senderName}: </span>
                                    <span>{msg.content}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendChat} className="p-4 border-t border-gray-800">
                            <input
                                className="w-full bg-gray-800 rounded p-2 text-sm"
                                placeholder="Type message..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                            />
                        </form>
                    </div>
                )}
            </main>

            <footer className="h-20 border-t border-gray-800 flex justify-center items-center gap-4 bg-gray-900">
                <button
                    className={`p-3 rounded-full hover:bg-gray-600 transition-colors ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}
                    onClick={toggleAudio}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? '🔇' : '🎙️'}
                </button>
                <button
                    className={`p-3 rounded-full hover:bg-gray-600 transition-colors ${isVideoOff ? 'bg-red-600' : 'bg-gray-700'}`}
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? '📷❌' : '📷'}
                </button>
                <button
                    className="px-6 py-2 rounded-full bg-red-600 font-bold hover:bg-red-700 transition-colors"
                    onClick={handleLeave}
                    title="Leave meeting"
                >
                    Leave
                </button>
                <button
                    className={`p-3 rounded-full hover:bg-gray-600 transition-colors ${chatOpen ? 'bg-blue-600' : 'bg-gray-700'}`}
                    onClick={() => setChatOpen(!chatOpen)}
                    title={chatOpen ? 'Close chat' : 'Open chat'}
                >
                    💬
                </button>
            </footer>
        </div>
    );
}
