import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraPermissionType } from '@capacitor/camera';

interface UseBarcodeResult {
  scanning: boolean;
  result: string | null;
  error: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  clearResult: () => void;
}

export function useBarcode(containerId: string): UseBarcodeResult {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    setError(null);
    setResult(null);

    try {
      // On native platforms, request camera permission via Capacitor first
      if (Capacitor.isNativePlatform()) {
        const permStatus = await Camera.checkPermissions();
        if (permStatus.camera !== 'granted') {
          const req = await Camera.requestPermissions({ permissions: ['camera'] as CameraPermissionType[] });
          if (req.camera !== 'granted') {
            setError('Permiso de cámara denegado. Actívalo en Ajustes.');
            return;
          }
        }
      }

      const el = document.getElementById(containerId);
      if (!el) {
        setError('Contenedor de cámara no encontrado');
        return;
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (mountedRef.current) {
            setResult(decodedText);
            scanner.stop().catch(() => {});
            setScanning(false);
          }
        },
        () => {
          // ignore scan failures (no code in frame)
        }
      );

      if (mountedRef.current) setScanning(true);
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message ?? 'No se pudo acceder a la cámara');
        setScanning(false);
      }
    }
  }, [containerId]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    if (mountedRef.current) setScanning(false);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return { scanning, result, error, startScanning, stopScanning, clearResult };
}
