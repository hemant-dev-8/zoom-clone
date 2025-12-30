export const config = {
    mediasoup: {
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
            logLevel: 'warn',
            logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
        },
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000,
                    },
                },
            ],
        },
        webRtcTransport: {
            listenIps: [
                {
                    ip: '0.0.0.0', // In prod, use public IP or announced IP
                    announcedIp: '127.0.0.1', // Change directly in prod
                },
            ],
            initialAvailableOutgoingBitrate: 1000000,
        },
    },
};
