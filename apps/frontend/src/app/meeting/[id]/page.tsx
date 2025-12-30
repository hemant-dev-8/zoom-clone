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
    const { chatMessages, sendMessage, participants, toggleParticipantMute } = useSignaling(params.id, user.id, user.name);
    const { peers } = useMeetingStore();

    const [chatOpen, setChatOpen] = useState(false);
    const [participantsOpen, setParticipantsOpen] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

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

    const copyMeetingLink = () => {
        const meetingLink = `${window.location.origin}/meeting/${params.id}`;
        navigator.clipboard.writeText(meetingLink);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    const allPeers = Object.values(peers); // Remotes
    const displayPeers = localStream
        ? [{ id: user.id, stream: localStream, name: 'Me (Local)' }, ...allPeers]
        : allPeers;

    // Total participants including self
    const totalParticipants = participants.length;

    return (
        <div className="h-screen w-screen flex flex-col bg-black text-white">
            <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                <div>
                    <h1 className="text-xl font-bold">Meeting: {params.id}</h1>
                    <p className="text-sm text-gray-400">{totalParticipants} Participant{totalParticipants !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={copyMeetingLink}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {showCopied ? '✓ Copied!' : '🔗 Share Link'}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 overflow-y-auto">
                    <VideoGrid peers={displayPeers} />
                </div>

                {/* Participants Sidebar */}
                {participantsOpen && (
                    <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-900">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="font-bold">Participants ({totalParticipants})</h2>
                            <button
                                onClick={() => setParticipantsOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {/* Current User */}
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name} (You)</p>
                                        <p className="text-xs text-gray-400">Host</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isMuted && <span className="text-red-500">🔇</span>}
                                    {isVideoOff && <span className="text-red-500">📷❌</span>}
                                </div>
                            </div>

                            {/* Other Participants */}
                            {participants.filter(p => p.userId !== user.id).map((participant) => (
                                <div key={participant.userId} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{participant.name}</p>
                                            <p className="text-xs text-gray-400">Participant</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {participant.isMuted && <span className="text-red-500 text-sm">🔇</span>}
                                        {participant.isVideoOff && <span className="text-red-500 text-sm">📷❌</span>}
                                        <button
                                            onClick={() => toggleParticipantMute(participant.userId, !participant.isMuted)}
                                            className="p-1 hover:bg-gray-700 rounded"
                                            title={participant.isMuted ? 'Unmute participant' : 'Mute participant'}
                                        >
                                            <span className="text-xs">🎤</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Sidebar */}
                {chatOpen && (
                    <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-900">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="font-bold">Chat</h2>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className="bg-gray-800 rounded-lg p-3">
                                    <p className="font-bold text-blue-400 text-sm">{msg.senderName}</p>
                                    <p className="text-sm mt-1">{msg.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendChat} className="p-4 border-t border-gray-800">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                >
                                    Send
                                </button>
                            </div>
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
                    className={`p-3 rounded-full hover:bg-gray-600 transition-colors ${participantsOpen ? 'bg-blue-600' : 'bg-gray-700'}`}
                    onClick={() => setParticipantsOpen(!participantsOpen)}
                    title={participantsOpen ? 'Hide participants' : 'Show participants'}
                >
                    👥
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
