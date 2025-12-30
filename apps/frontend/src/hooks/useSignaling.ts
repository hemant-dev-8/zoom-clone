import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMeetingStore } from '../store/meetingStore';

const SIGNALING_URL = 'http://localhost:3003';

export const useSignaling = (meetingId: string, userId: string, userName: string) => {
    const socket = useRef<Socket>();
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const { addPeer, removePeer } = useMeetingStore();

    useEffect(() => {
        socket.current = io(SIGNALING_URL);

        socket.current.on('connect', () => {
            console.log('Connected to Signaling');
            socket.current?.emit('join-room', { meetingId, userId, name: userName }, (response: any) => {
                // Handle existing participants if needed
                // response.participants is a Map/Obj from Redis
                console.log('Joined room, participants:', response.participants);
            });
        });

        socket.current.on('participant-joined', (data) => {
            console.log('Participant Joined:', data);
            addPeer({ id: data.userId, name: data.name }); // Add to store
        });

        socket.current.on('participant-left', (data) => {
            console.log('Participant Left:', data);
            removePeer(data.userId);
        });

        socket.current.on('chat-message', (data) => {
            setChatMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [meetingId, userId, userName]);

    const sendMessage = (content: string) => {
        socket.current?.emit('chat-message', { meetingId, content, senderName: userName });
    };

    return { chatMessages, sendMessage };
};
