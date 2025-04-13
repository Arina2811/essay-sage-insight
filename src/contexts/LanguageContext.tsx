
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationKeys } from '@/i18n';

type LanguageContextType = {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => void;
  availableLanguages: Language[];
};

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  t: () => '',
  changeLanguage: () => {},
  availableLanguages: ['en', 'es', 'fr'],
});

export const useLanguage = () => useContext(LanguageContext);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from localStorage or use browser language or default to English
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      return savedLanguage;
    }

    // Try to match browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && Object.keys(translations).includes(browserLang as Language)) {
      return browserLang as Language;
    }

    return defaultLanguage;
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const availableLanguages: Language[] = Object.keys(translations) as Language[];

  // Translate function that traverses the nested translation objects
  const translate = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key} for language ${language}`);
        
        // Fallback to English
        let fallback: any = translations['en'];
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return key; // Last resort fallback is the key itself
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      t: translate, 
      changeLanguage,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
