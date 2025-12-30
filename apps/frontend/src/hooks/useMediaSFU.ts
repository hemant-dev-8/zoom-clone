import { useEffect, useRef } from 'react';
import { Device } from 'mediasoup-client';
import { io, Socket } from 'socket.io-client';
import { useMeetingStore } from '../store/meetingStore';

const SFU_URL = 'http://localhost:3004'; // Media SFU

export const useMediaSFU = (meetingId: string) => {
    const device = useRef(new Device());
    const socket = useRef<Socket>();
    const sendTransport = useRef<any>();
    const receiveTransport = useRef<any>();

    useEffect(() => {
        socket.current = io(SFU_URL);

        socket.current.on('connect', async () => {
            console.log('Connected to SFU');
            const { rtpCapabilities } = await request(socket.current, 'join-as-speaker', { meetingId });
            await device.current.load({ routerRtpCapabilities: rtpCapabilities });

            await initTransports(meetingId);
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [meetingId]);

    const request = (sock: any, type: string, data = {}) => {
        return new Promise<any>((resolve) => {
            sock.emit(type, data, resolve);
        });
    };

    const initTransports = async (meetingId: string) => {
        // Producer Transport
        const params = await request(socket.current, 'create-transport', { meetingId, consuming: false });
        sendTransport.current = device.current.createSendTransport(params);

        sendTransport.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await request(socket.current, 'connect-transport', { transportId: sendTransport.current.id, dtlsParameters });
                callback();
            } catch (error) {
                errback(error);
            }
        });

        sendTransport.current.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
                const { id } = await request(socket.current, 'produce', {
                    transportId: sendTransport.current.id,
                    kind,
                    rtpParameters,
                    appData: { ...appData, meetingId },
                });
                callback({ id });
            } catch (error) {
                errback(error);
            }
        });
    };

    const produce = async (track: MediaStreamTrack) => {
        if (!sendTransport.current) return;
        await sendTransport.current.produce({ track });
    };

    return { produce };
};
