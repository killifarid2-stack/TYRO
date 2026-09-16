/**
 * WAB-TKD Public Display runtime contract.
 * One design coordinate system is used by Preview and every audience window.
 */
export const MASTER_CANVAS = { width: 1920, height: 1080, aspect: 16 / 9 } as const;
export type DisplayCalibration = 'fit' | 'fill' | '16:9';
export type PublicDisplayConnection = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'READY' | 'DISPLAY ERROR';

export interface DisplayRect { id: string; x: number; y: number; width: number; height: number; visible?: boolean; allowOverlap?: boolean; }
export interface DisplayDiagnostics {
  resolution: string; aspect: string; scale: number; canvas: string; safe: boolean;
  overlaps: string[]; outOfBounds: string[]; calibration: DisplayCalibration;
}

export function getUniformScale(width: number, height: number, calibration: DisplayCalibration = '16:9') {
  const sx = width / MASTER_CANVAS.width;
  const sy = height / MASTER_CANVAS.height;
  return calibration === 'fill' ? Math.max(sx, sy) : Math.min(sx, sy);
}

export function validateMasterRects(rects: DisplayRect[], safeInset = 0): Pick<DisplayDiagnostics, 'overlaps' | 'outOfBounds' | 'safe'> {
  const visible = rects.filter(r => r.visible !== false);
  const overlaps: string[] = [];
  const outOfBounds: string[] = [];
  for (let i = 0; i < visible.length; i++) {
    const a = visible[i];
    if (a.x < safeInset || a.y < safeInset || a.x + a.width > MASTER_CANVAS.width - safeInset || a.y + a.height > MASTER_CANVAS.height - safeInset) outOfBounds.push(a.id);
    for (let j = i + 1; j < visible.length; j++) {
      const b = visible[j];
      if (a.allowOverlap || b.allowOverlap) continue;
      if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) overlaps.push(`${a.id} ↔ ${b.id}`);
    }
  }
  return { overlaps, outOfBounds, safe: outOfBounds.length === 0 };
}
