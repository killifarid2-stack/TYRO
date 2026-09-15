import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_FLAG_STYLE,
  FLAG_STYLE_CHANNEL,
  FLAG_STYLE_EVENT,
  FLAG_STYLE_STORAGE_KEY,
  FlagStyle,
  readStoredFlagStyle,
  sanitizeFlagStyle,
  writeStoredFlagStyle,
} from '@/lib/flag-style';

interface FlagSettingsValue {
  style: FlagStyle;
  setStyle: (patch: Partial<FlagStyle>) => void;
  reset: () => void;
}

const FlagSettingsContext = createContext<FlagSettingsValue>({
  style: DEFAULT_FLAG_STYLE,
  setStyle: () => {},
  reset: () => {},
});

/**
 * Holds the single flag appearance used by the WHOLE app — operator screen,
 * admin, brackets, and the separate public/broadcast window.
 *
 * It follows exactly the same synchronization pattern as I18nProvider
 * (localStorage + `storage` event + BroadcastChannel + a same-window custom
 * event) because the public display runs in its own Electron window: a
 * `storage` event alone is not reliable there, and the operator changing
 * the flag style must be reflected on air immediately without a reload.
 *
 * The public window is a *consumer* only — it never writes the style.
 */
export function FlagSettingsProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyleState] = useState<FlagStyle>(() => readStoredFlagStyle());

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(FLAG_STYLE_CHANNEL);
      channel.onmessage = (event) => setStyleState(sanitizeFlagStyle(event.data));
    } catch { /* BroadcastChannel unavailable — storage event still applies */ }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== FLAG_STYLE_STORAGE_KEY || !event.newValue) return;
      try { setStyleState(sanitizeFlagStyle(JSON.parse(event.newValue))); } catch { /* ignore malformed */ }
    };
    const onLocal = (event: Event) => setStyleState(sanitizeFlagStyle((event as CustomEvent).detail));

    window.addEventListener('storage', onStorage);
    window.addEventListener(FLAG_STYLE_EVENT, onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(FLAG_STYLE_EVENT, onLocal);
      try { channel?.close(); } catch { /* already closed */ }
    };
  }, []);

  const publish = useCallback((next: FlagStyle) => {
    setStyleState(next);
    writeStoredFlagStyle(next);
    window.dispatchEvent(new CustomEvent(FLAG_STYLE_EVENT, { detail: next }));
    try {
      const ch = new BroadcastChannel(FLAG_STYLE_CHANNEL);
      ch.postMessage(next);
      ch.close();
    } catch { /* ignore */ }
  }, []);

  const setStyle = useCallback((patch: Partial<FlagStyle>) => {
    setStyleState(prev => {
      const next = sanitizeFlagStyle({ ...prev, ...patch });
      writeStoredFlagStyle(next);
      window.dispatchEvent(new CustomEvent(FLAG_STYLE_EVENT, { detail: next }));
      try {
        const ch = new BroadcastChannel(FLAG_STYLE_CHANNEL);
        ch.postMessage(next);
        ch.close();
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => publish({ ...DEFAULT_FLAG_STYLE }), [publish]);

  const value = useMemo(() => ({ style, setStyle, reset }), [style, setStyle, reset]);
  return <FlagSettingsContext.Provider value={value}>{children}</FlagSettingsContext.Provider>;
}

/** Current global flag appearance. Safe to call outside the provider — it
 *  falls back to the default style rather than throwing, so an isolated
 *  component (or a test) never crashes a broadcast screen. */
export function useFlagSettings(): FlagSettingsValue {
  return useContext(FlagSettingsContext);
}
