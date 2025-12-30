import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMeetingStore } from '../store/meetingStore';

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3003';

export interface Participant {
    userId: string;
    name: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
}

export const useSignaling = (meetingId: string, userId: string, userName: string) => {
    const socket = useRef<Socket>();
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const { addPeer, removePeer, setPeers } = useMeetingStore();

    useEffect(() => {
        socket.current = io(SIGNALING_URL);

        socket.current.on('connect', () => {
            console.log('Connected to Signaling');
            socket.current?.emit('join-room', { meetingId, userId, name: userName }, (response: any) => {
                console.log('Joined room, participants:', response.participants);

                // Initialize participants from response
                if (response.participants) {
                    const participantsList = Object.values(response.participants) as Participant[];
                    setParticipants(participantsList);

                    // Add all existing participants to store
                    participantsList.forEach((p: Participant) => {
                        if (p.userId !== userId) {
                            addPeer({ id: p.userId, name: p.name });
                        }
                    });
                }
            });
        });

        socket.current.on('participant-joined', (data) => {
            console.log('Participant Joined:', data);
            setParticipants(prev => [...prev, { userId: data.userId, name: data.name }]);
            addPeer({ id: data.userId, name: data.name });
        });

        socket.current.on('participant-left', (data) => {
            console.log('Participant Left:', data);
            setParticipants(prev => prev.filter(p => p.userId !== data.userId));
            removePeer(data.userId);
        });

        socket.current.on('chat-message', (data) => {
            setChatMessages((prev) => [...prev, data]);
        });

        socket.current.on('participant-muted', (data) => {
            setParticipants(prev => prev.map(p =>
                p.userId === data.userId ? { ...p, isMuted: data.isMuted } : p
            ));
        });

        socket.current.on('participant-video-toggled', (data) => {
            setParticipants(prev => prev.map(p =>
                p.userId === data.userId ? { ...p, isVideoOff: data.isVideoOff } : p
            ));
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [meetingId, userId, userName]);

    const sendMessage = (content: string) => {
        socket.current?.emit('chat-message', { meetingId, content, senderName: userName });
    };

    const toggleParticipantMute = (participantId: string, muted: boolean) => {
        socket.current?.emit('toggle-participant-mute', { meetingId, participantId, muted });
    };

    return { chatMessages, sendMessage, participants, toggleParticipantMute, socket: socket.current };
};
