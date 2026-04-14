import { useEffect, useRef, useState } from 'react';
import { useCameraStore } from '../../stores/cameraStore';
import { Camera } from 'lucide-react';

export default function CameraFeed() {
  const { cameras, selectedCamera, fetchCameras, selectCamera } = useCameraStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    if (!selectedCamera || !videoRef.current) return;
    // HLS playback — requires HLS.js in production
    // For demo, shows placeholder
    setError(false);
  }, [selectedCamera]);

  return (
    <div className="bg-gray-900 rounded border border-gray-700">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Camera size={14} />
          <span>CCTV Feed</span>
        </div>
        <select
          className="bg-gray-800 text-gray-300 text-xs border border-gray-600 rounded px-2 py-1"
          value={selectedCamera?.camera_id ?? ''}
          onChange={(e) => {
            const cam = cameras.find((c) => c.camera_id === e.target.value);
            selectCamera(cam ?? null);
          }}
        >
          <option value="">Select camera</option>
          {cameras.map((cam) => (
            <option key={cam.camera_id} value={cam.camera_id}>
              {cam.camera_id} — {cam.location_name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative bg-black aspect-video flex items-center justify-center">
        {selectedCamera ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onError={() => setError(true)}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <Camera size={32} className="mb-2 opacity-30" />
                <span className="text-sm">{selectedCamera.camera_id}</span>
                <span className="text-xs mt-1 opacity-60">Stream unavailable</span>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded">
              {selectedCamera.camera_id}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <Camera size={32} className="mb-2 opacity-30" />
            <span className="text-sm">No camera selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
