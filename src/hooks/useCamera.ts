import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export async function takePhoto(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return photo.dataUrl ?? null;
  } catch {
    return null;
  }
}

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}
