import { requireNativeModule } from 'expo-modules-core';

const PackageCheckerModule = requireNativeModule('PackageChecker');

export async function isPackageInstalled(packageName: string): Promise<boolean> {
  return PackageCheckerModule.isPackageInstalled(packageName);
}

export async function launchApp(packageName: string): Promise<boolean> {
  return PackageCheckerModule.launchApp(packageName);
}

export async function uninstallApp(packageName: string): Promise<boolean> {
  return PackageCheckerModule.uninstallApp(packageName);
}
