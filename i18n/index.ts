import { getLocales } from "expo-localization";
import { en, type Translations } from "./en";
import { es } from "./es";

const translations: Record<string, Translations> = { en, es };

function getDeviceLocale(): string {
  try {
    const locales = getLocales();
    if (locales.length > 0) {
      const lang = locales[0].languageCode;
      if (lang && lang in translations) return lang;
    }
  } catch {
    // fallback
  }
  return "en";
}

const deviceLocale = getDeviceLocale();

export const t: Translations = translations[deviceLocale] ?? en;
export const locale = deviceLocale;
