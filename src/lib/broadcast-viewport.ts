import { useEffect } from 'react';
import { MASTER_CANVAS, type DisplayCalibration, getUniformScale } from './public-display-runtime';

const DESIGN_W = MASTER_CANVAS.width;
const DESIGN_H = MASTER_CANVAS.height;

/** Central viewport adapter. The physical viewport is measured once, then a
 * single uniform scale is exposed. It never exposes separate X/Y scales. */
export function useBroadcastViewport(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    let raf = 0;
    let calibration: DisplayCalibration = '16:9';
    let observer: ResizeObserver | null = null;

    const readFlags = () => ({
      guides: localStorage.getItem('wab-display-guides') === '1',
      test: localStorage.getItem('wab-display-test-mode') === '1',
    });

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = Math.max(1, Math.round(window.innerWidth));
        const height = Math.max(1, Math.round(window.innerHeight));
        const scale = getUniformScale(width, height, calibration);
        const canvasWidth = DESIGN_W * scale;
        const canvasHeight = DESIGN_H * scale;
        const offsetX = Math.round((width - canvasWidth) / 2);
        const offsetY = Math.round((height - canvasHeight) / 2);
        const safeX = Math.round(offsetX + canvasWidth * 0.05);
        const safeY = Math.round(offsetY + canvasHeight * 0.05);
        const flags = readFlags();
        root.style.setProperty('--wab-display-width', `${width}px`);
        root.style.setProperty('--wab-display-height', `${height}px`);
        root.style.setProperty('--wab-design-width', `${DESIGN_W}px`);
        root.style.setProperty('--wab-design-height', `${DESIGN_H}px`);
        root.style.setProperty('--wab-broadcast-fit-scale', String(scale));
        root.style.setProperty('--wab-broadcast-cover-scale', String(scale));
        root.style.setProperty('--wab-broadcast-canvas-width', `${canvasWidth}px`);
        root.style.setProperty('--wab-broadcast-canvas-height', `${canvasHeight}px`);
        root.style.setProperty('--wab-broadcast-safe-x', `${safeX}px`);
        root.style.setProperty('--wab-broadcast-safe-y', `${safeY}px`);
        root.style.setProperty('--wab-broadcast-offset-x', `${offsetX}px`);
        root.style.setProperty('--wab-broadcast-offset-y', `${offsetY}px`);
        root.dataset.wabBroadcastCanvas = '1920x1080';
        root.dataset.wabBroadcastScale = scale.toFixed(6);
        root.dataset.wabBroadcastCalibration = calibration;
        root.dataset.wabDisplayGuides = String(flags.guides);
        root.dataset.wabDisplayTest = String(flags.test);
      });
    };


    root.classList.add('wab-public-display'); body.classList.add('wab-public-display');
    const api = window.electronAPI;
    void api?.getDisplayCalibration().then(v => { calibration = v.mode; update(); });
    void api?.getDisplayOverlay?.().then(v => { localStorage.setItem('wab-display-guides', v.guides ? '1' : '0'); localStorage.setItem('wab-display-test-mode', v.test ? '1' : '0'); update(); });
    const offOverlay = api?.onDisplayOverlayChanged?.(v => { localStorage.setItem('wab-display-guides', v.guides ? '1' : '0'); localStorage.setItem('wab-display-test-mode', v.test ? '1' : '0'); update(); });
    const onStorage = () => update();
    window.addEventListener('storage', onStorage); window.addEventListener('wab-display-test-mode-changed', onStorage); window.addEventListener('resize', update, { passive: true }); window.addEventListener('orientationchange', update, { passive: true }); window.addEventListener('fullscreenchange', update);
    observer = new ResizeObserver(update); observer.observe(document.documentElement); update();
    const timer = window.setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf); window.clearInterval(timer); observer?.disconnect();
      window.removeEventListener('storage', onStorage); window.removeEventListener('wab-display-test-mode-changed', onStorage); window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update); window.removeEventListener('fullscreenchange', update);
      offOverlay?.(); root.classList.remove('wab-public-display'); body.classList.remove('wab-public-display');
    };
  }, [enabled]);
}
export const BROADCAST_DESIGN_WIDTH = DESIGN_W;
export const BROADCAST_DESIGN_HEIGHT = DESIGN_H;
