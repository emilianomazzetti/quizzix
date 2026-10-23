import { useState, useEffect, useCallback } from 'react';

/**
 * Universal Fullscreen API utilities for tablets, smartphones, and desktop browsers.
 * Supports standard Fullscreen API, WebKit prefix (iOS/Safari/Android Chrome), and fallbacks.
 */

export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
  );
};

export const isAppFullscreen = (): boolean => {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
  );
};

export const requestAppFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  const target = element || document.documentElement;

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    } else if ((target as any).webkitRequestFullscreen) {
      await (target as any).webkitRequestFullscreen();
      return true;
    } else if ((target as any).webkitEnterFullscreen) {
      await (target as any).webkitEnterFullscreen();
      return true;
    } else if ((target as any).mozRequestFullScreen) {
      await (target as any).mozRequestFullScreen();
      return true;
    } else if ((target as any).msRequestFullscreen) {
      await (target as any).msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Richiesta Schermo Intero non consentita o bloccata dal browser:', err);
  }
  return false;
};

export const exitAppFullscreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
      return true;
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
      return true;
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Errore durante l\'uscita dallo Schermo Intero:', err);
  }
  return false;
};

/**
 * Custom React hook for tracking and controlling fullscreen state on student devices.
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isAppFullscreen);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(isFullscreenSupported());
    setIsFullscreen(isAppFullscreen());

    const handleFsChange = () => {
      setIsFullscreen(isAppFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const enter = useCallback(async () => {
    const res = await requestAppFullscreen();
    setIsFullscreen(isAppFullscreen());
    return res;
  }, []);

  const exit = useCallback(async () => {
    const res = await exitAppFullscreen();
    setIsFullscreen(isAppFullscreen());
    return res;
  }, []);

  const toggle = useCallback(async () => {
    if (isAppFullscreen()) {
      return await exit();
    } else {
      return await enter();
    }
  }, [enter, exit]);

  return {
    isFullscreen,
    isSupported,
    enter,
    exit,
    toggle
  };
};
