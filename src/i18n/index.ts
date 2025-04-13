
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

export const translations = {
  en,
  es,
  fr
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;
