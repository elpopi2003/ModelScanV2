import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modelkitscan.app',
  appName: 'ModelKitScan',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos'],
    },
  },
};

export default config;
