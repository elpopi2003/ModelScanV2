import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Keyboard, AlertTriangle } from 'lucide-react';
import './scanner.css';

const EAN_FORMATS = [
  BarcodeFormat.Ean13,
  BarcodeFormat.Ean8,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
];
const WEB_READER_ID = 'ean-web-reader';

interface Props {
  onScanned: (code: string) => void;
  onClose: () => void;
  onManual: () => void;
}

export function BarcodeScannerModal({ onScanned, onClose, onManual }: Props) {
  const isNative = Capacitor.isNativePlatform();
  const [error, setError] = useState<string | null>(null);
  const html5Ref = useRef<Html5Qrcode | null>(null);
  const listenerRef = useRef<{ remove: () => Promise<void> } | null>(null);
  const doneRef = useRef(false);

  const stopNative = useCallback(async () => {
    try {
      document.body.classList.remove('barcode-scanner-active');
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      await BarcodeScanner.stopScan();
    } catch {
      /* noop */
    }
  }, []);

  const stopWeb = useCallback(async () => {
    if (html5Ref.current) {
      try {
        await html5Ref.current.stop();
      } catch {
        /* noop */
      }
      try {
        html5Ref.current.clear();
      } catch {
        /* noop */
      }
      html5Ref.current = null;
    }
  }, []);

  const stopAll = useCallback(async () => {
    if (isNative) await stopNative();
    else await stopWeb();
  }, [isNative, stopNative, stopWeb]);

  const finish = useCallback(
    async (code: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      await stopAll();
      onScanned(code);
    },
    [stopAll, onScanned],
  );

  const handleClose = useCallback(async () => {
    await stopAll();
    onClose();
  }, [stopAll, onClose]);

  const handleManual = useCallback(async () => {
    await stopAll();
    onManual();
  }, [stopAll, onManual]);

  // --- Nativo: ML Kit (cámara detrás del webview) ---
  useEffect(() => {
    if (!isNative) return;
    let cancelled = false;
    (async () => {
      try {
        const { supported } = await BarcodeScanner.isSupported();
        if (!supported) {
          setError('Este dispositivo no soporta el escáner.');
          return;
        }
        const { camera } = await BarcodeScanner.requestPermissions();
        if (camera !== 'granted' && camera !== 'limited') {
          setError('Permiso de cámara denegado. Actívalo en los Ajustes del sistema.');
          return;
        }
        if (cancelled) return;
        listenerRef.current = await BarcodeScanner.addListener('barcodesScanned', (event) => {
          const value = event?.barcodes?.[0]?.rawValue;
          if (value) void finish(value);
        });
        document.body.classList.add('barcode-scanner-active');
        await BarcodeScanner.startScan({ formats: EAN_FORMATS });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al iniciar el escáner');
      }
    })();
    return () => {
      cancelled = true;
      void stopNative();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNative]);

  // --- Web (dev/PWA): html5-qrcode ---
  useEffect(() => {
    if (isNative) return;
    (async () => {
      try {
        const scanner = new Html5Qrcode(WEB_READER_ID);
        html5Ref.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 150 }, aspectRatio: 1 },
          (decoded) => void finish(decoded),
          () => {
            /* ignora fallos por frame sin código */
          },
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo acceder a la cámara.');
      }
    })();
    return () => {
      void stopWeb();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNative]);

  return (
    <div className="barcode-scanner-modal fixed inset-0 z-50 text-white">
      {/* En web, preview de la cámara; en nativo la cámara va detrás del webview */}
      {!isNative && <div id={WEB_READER_ID} className="scanner-video absolute inset-0 bg-black" />}

      {/* Retícula blueprint */}
      {!error && (
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          <div className="flex items-center justify-between p-4 font-mono text-[10px] tracking-widest text-accent">
            <span>EAN·SCAN</span>
            <span>FOCUS·AF</span>
            <span>1/35</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-[150px] w-[260px]">
              <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-accent" />
              <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-accent" />
              <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-accent" />
              <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-accent" />
              <span className="ean-scanline absolute left-2 right-2 h-0.5 bg-accent" />
            </div>
          </div>

          <div className="p-4 pb-28 text-center font-mono text-xs text-accent">
            Apunta al código de barras de la caja
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6">
        <button
          onClick={handleClose}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={handleManual}
          className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs backdrop-blur"
        >
          <Keyboard className="h-4 w-4" /> Introducir a mano
        </button>
      </div>

      {/* Estado de error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 p-6 text-center text-foreground">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="max-w-xs text-sm">{error}</p>
          <div className="flex gap-2">
            <button onClick={handleManual} className="rounded-full border border-border px-4 py-2 text-sm">
              Introducir a mano
            </button>
            <button onClick={onClose} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
