import { create } from 'zustand';
import api from '../services/api';
import { demoCameras, DEMO_MEDIA_MAP } from '../demo/data';

interface Camera {
  camera_id: string;
  location_id: string;
  terminal: string;
  zone: string;
  location_name: string;
}

interface CameraMedia {
  video_url: string;
  audio_url: string;
}

interface CameraStore {
  cameras: Camera[];
  selectedCamera: Camera | null;
  media: CameraMedia | null;
  fetchCameras: () => Promise<void>;
  selectCamera: (camera: Camera | null) => void;
}

// Monotonic token to discard out-of-order /media/videos responses when the
// user clicks cameras faster than the network responds.
let mediaRequestToken = 0;

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: [],
  selectedCamera: null,
  media: null,

  fetchCameras: async () => {
    try {
      const { data } = await api.get('/cameras');
      const cameras = data.cameras || [];
      const first = cameras[0] ?? null;
      set({ cameras, selectedCamera: first });
      if (first) get().selectCamera(first);
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
      const first = demoCameras[0] ?? null;
      set({ cameras: demoCameras, selectedCamera: first });
      if (first) get().selectCamera(first);
    }
  },

  selectCamera: async (camera) => {
    const myToken = ++mediaRequestToken;
    set({ selectedCamera: camera, media: null });
    if (!camera) return;
    try {
      const { data } = await api.get(`/media/videos/${camera.camera_id}`);
      if (myToken !== mediaRequestToken) return; // a newer selection superseded us
      set({
        media: {
          video_url: data.video_url,
          audio_url: data.audio_url,
        },
      });
    } catch (err) {
      if (myToken !== mediaRequestToken) return;
      console.warn('Camera media fallback to demo:', err);
      const fallback = DEMO_MEDIA_MAP[camera.camera_id] ?? {
        video_url: '/media/videos/terminal_corridor.mp4',
        audio_url: '/media/audio/terminal_crowd.wav',
      };
      set({ media: fallback });
    }
  },
}));
