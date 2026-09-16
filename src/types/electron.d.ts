export interface ElectronDisplay {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  size: { width: number; height: number };
  isPrimary: boolean;
  kind?: 'PC' | 'TV' | 'External';
  workArea?: { x: number; y: number; width: number; height: number };
  scaleFactor?: number;
  rotation?: number;
}

export interface PublicDisplayStatus {
  open: boolean;
  displayId: number | null;
  openDisplays?: number[];
  connection?: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'READY' | 'DISPLAY ERROR';
  selectedDisplayId?: number | null;
}

export interface ElectronAPI {
  isElectron: true;
  secureStorageGet: (key: string) => Promise<string | null>;
  secureStorageSet: (key: string, value: string) => Promise<boolean>;
  secureStorageDelete: (key: string) => Promise<boolean>;

  broadcastMatchState: (state: unknown) => void;
  onMatchStateSync: (callback: (state: any) => void) => () => void;
  broadcastDesign: (design: unknown) => void;
  getBroadcastDesign: () => Promise<any>;
  onBroadcastDesignSync: (callback: (design: any) => void) => () => void;

  openPublicDisplay: (displayId?: number) => Promise<PublicDisplayStatus>;
  closePublicDisplay: (displayId?: number) => Promise<PublicDisplayStatus>;
  getPublicDisplayStatus: () => Promise<PublicDisplayStatus>;
  onPublicDisplayStatusChanged: (callback: (status: PublicDisplayStatus) => void) => () => void;
  onNewExternalDisplay: (callback: (display: ElectronDisplay) => void) => () => void;

  getDisplays: () => Promise<ElectronDisplay[]>;
  onDisplaysChanged: (callback: (displays: ElectronDisplay[]) => void) => () => void;
  selectDisplay: (displayId: number) => Promise<{ selectedDisplayId: number }>;
  getSelectedDisplay: () => Promise<{ selectedDisplayId: number | null }>;
  preparePublicDisplay: (payload?: { ready?: boolean; canvas?: { width: number; height: number }; animation?: string }) => Promise<{ ready: boolean; displayId: number | null }>;
  emergencyPublicDisplay: () => Promise<{ ok: boolean; displays: number[] }>;
  publicDisplayHeartbeat: (payload?: { displayId?: number; ready?: boolean; animation?: string }) => void;
  onPublicDisplayEmergency: (callback: () => void) => () => void;
  getDisplayOverlay: () => Promise<{ guides: boolean; test: boolean }>;
  setDisplayOverlay: (overlay: Partial<{ guides: boolean; test: boolean }>) => Promise<{ guides: boolean; test: boolean }>;
  onDisplayOverlayChanged: (callback: (overlay: { guides: boolean; test: boolean }) => void) => () => void;
  getDisplayCalibration: () => Promise<{ mode: 'fit' | 'fill' | '16:9' }>;
  setDisplayCalibration: (calibration: { mode: 'fit' | 'fill' | '16:9' }) => Promise<{ mode: 'fit' | 'fill' | '16:9' }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
