import { create } from 'zustand';
import api from '../services/api';

interface Camera {
  camera_id: string;
  location_id: string;
  terminal: string;
  zone: string;
  location_name: string;
}

interface CameraStore {
  cameras: Camera[];
  selectedCamera: Camera | null;
  fetchCameras: () => Promise<void>;
  selectCamera: (camera: Camera | null) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  cameras: [],
  selectedCamera: null,

  fetchCameras: async () => {
    try {
      const { data } = await api.get('/cameras');
      set({ cameras: data.cameras || [] });
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
    }
  },

  selectCamera: (camera) => set({ selectedCamera: camera }),
}));
