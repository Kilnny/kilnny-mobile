import { NativeModules, Platform } from 'react-native';

const PackageCheckerModule = Platform.OS === 'android' ? NativeModules.PackageChecker : null;

export async function isPackageInstalled(packageName: string): Promise<boolean> {
  if (!PackageCheckerModule) return false;
  return PackageCheckerModule.isPackageInstalled(packageName);
}

export async function launchApp(packageName: string): Promise<boolean> {
  if (!PackageCheckerModule) return false;
  return PackageCheckerModule.launchApp(packageName);
}

export async function uninstallApp(packageName: string): Promise<boolean> {
  if (!PackageCheckerModule) return false;
  return PackageCheckerModule.uninstallApp(packageName);
}
