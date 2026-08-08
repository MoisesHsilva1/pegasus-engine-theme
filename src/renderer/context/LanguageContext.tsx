import * as React from 'react'
import type { Language } from '@shared/types'
import { translations, type TranslationSchema } from '../locales'

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type TranslationKey = NestedKeyOf<TranslationSchema>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

export interface LanguageProviderProps {
  children: React.ReactNode
  initialLanguage?: Language
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = React.useState<Language>(initialLanguage || 'en')

  React.useEffect(() => {
    let isMounted = true
    if (!initialLanguage && typeof window !== 'undefined' && window.pegasus?.settings?.get) {
      window.pegasus.settings
        .get()
        .then((res) => {
          if (isMounted && res.success && res.data?.language) {
            setLanguageState(res.data.language)
          }
        })
        .catch(() => {
          // Ignore error and fall back to default 'en'
        })
    }
    return () => {
      isMounted = false
    }
  }, [initialLanguage])

  const setLanguage = React.useCallback((newLang: Language) => {
    setLanguageState(newLang)
    if (typeof window !== 'undefined' && window.pegasus?.settings?.update) {
      window.pegasus.settings.update({ language: newLang }).catch(() => {
        // Silently catch persistence error
      })
    }
  }, [])

  const t = React.useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const activeDict = translations[language] || translations['en']
      let val = getNestedValue(activeDict, key)

      if (val === undefined) {
        val = getNestedValue(translations['en'], key) || key
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          val = val!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
        })
      }

      return val
    },
    [language]
  )

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

const defaultT = (key: TranslationKey, params?: Record<string, string | number>): string => {
  let val = getNestedValue(translations['en'], key) || key
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      val = val!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
    })
  }
  return val
}

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
}

export function useTranslation() {
  const context = React.useContext(LanguageContext)
  return context || defaultContext
}
