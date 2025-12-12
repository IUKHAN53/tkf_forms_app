import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

export interface DeviceInfo {
  platform: string;
  os_version: string;
  device_name: string;
  device_model: string;
  device_brand: string;
  app_version: string;
  app_build: string;
  is_device: boolean;
  device_year: number | null;
}

export function useDeviceInfo() {
  const getDeviceInfo = (): DeviceInfo => {
    return {
      platform: Platform.OS,
      os_version: Platform.Version?.toString() || 'unknown',
      device_name: Device.deviceName || 'unknown',
      device_model: Device.modelName || 'unknown',
      device_brand: Device.brand || 'unknown',
      app_version: Application.nativeApplicationVersion || Constants.expoConfig?.version || 'unknown',
      app_build: Application.nativeBuildVersion || 'unknown',
      is_device: Device.isDevice,
      device_year: Device.deviceYearClass,
    };
  };

  return { getDeviceInfo };
}
