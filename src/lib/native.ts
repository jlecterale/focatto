import { Capacitor } from "@capacitor/core";

/** True quando o código roda dentro do app Capacitor (Android ou iOS). */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** True quando o código roda dentro do app iOS. */
export function isIosApp(): boolean {
  return Capacitor.getPlatform() === "ios";
}

/** True quando o código roda dentro do app Android. */
export function isAndroidApp(): boolean {
  return Capacitor.getPlatform() === "android";
}
