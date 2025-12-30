import { create } from 'zustand';

interface MeetingState {
    meetingId: string | null;
    userId: string | null;
    role: 'host' | 'participant';
    peers: Record<string, any>;
    setMeetingId: (id: string) => void;
    setUserId: (id: string) => void;
    addPeer: (peer: any) => void;
    removePeer: (peerId: string) => void;
    setPeers: (peers: Record<string, any>) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
    meetingId: null,
    userId: null,
    role: 'participant',
    peers: {},
    setMeetingId: (id) => set({ meetingId: id }),
    setUserId: (id) => set({ userId: id }),
    addPeer: (peer) => set((state) => ({ peers: { ...state.peers, [peer.id]: peer } })),
    removePeer: (id) => set((state) => {
        const { [id]: _, ...rest } = state.peers;
        return { peers: rest };
    }),
    setPeers: (peers) => set({ peers }),
}));
