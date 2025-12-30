export default function VideoGrid({ peers }: { peers: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full bg-gray-900">
            {peers.map((peer) => (
                <div key={peer.id} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <video
                        autoPlay
                        playsInline
                        ref={(el) => {
                            if (el && peer.stream) el.srcObject = peer.stream;
                        }}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                        {peer.name || 'Unknown'}
                    </div>
                </div>
            ))}
        </div>
    );
}
