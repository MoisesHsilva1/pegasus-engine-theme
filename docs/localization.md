# Pegasus Engine Theme — Localization (i18n) Guide

This document describes how internationalization and localization are implemented, structured, and extended in **Pegasus Engine Theme**.

---

## 1. Supported Languages

- **English (`en`)**: Default fallback language.
- **Brazilian Portuguese (`pt-BR`)**: Complete native translation.

---

## 2. Directory Layout & Translation Files

All localization files live under `src/renderer/locales/`:

```text
src/renderer/locales/
├── en.ts        # English translations dictionary
├── pt-BR.ts     # Brazilian Portuguese translations dictionary
└── index.ts     # Locales export & type definitions
```

---

## 3. Localization Architecture

- **Context Provider**: `src/renderer/context/LanguageContext.tsx`
- **Hook**: `useTranslation()`
- **Persistence**: Active language choice is saved to `localStorage` key `pegasus_language` and restored on app launch.

---

## 4. Usage in Components

Import `useTranslation` hook in any React component:

```tsx
import { useTranslation } from '@/context/LanguageContext'

export function MyComponent() {
  const { t, language, setLanguage } = useTranslation()

  return (
    <div>
      <h2>{t('nav.home')}</h2>
      <button onClick={() => setLanguage('pt-BR')}>
        {language === 'en' ? 'Português' : 'English'}
      </button>
    </div>
  )
}
```

---

## 5. Key Conventions

Translation keys follow dot-notation namespace hierarchy:

- `nav.*`: Navigation items (`nav.home`, `nav.themes`, `nav.settings`)
- `sidebar.*`: Sidebar branding and titles
- `home.*`: Overview cards, system metrics, and status badges
- `themes.*`: Theme grid controls, filters, apply buttons
- `settings.*`: Preferences form titles, language select, package version

---

## 6. Adding a New Language

To add a new language (e.g. Spanish `es`):

1. Create a new dictionary file `src/renderer/locales/es.ts` implementing all keys defined in `en.ts`.
2. Register the locale in `src/renderer/locales/index.ts`:

   ```typescript
   import { en } from './en'
   import { ptBR } from './pt-BR'
   import { es } from './es'

   export const locales = {
     en,
     'pt-BR': ptBR,
     es,
   } as const

   export type Language = keyof typeof locales
   ```

3. Add the language option to the Settings language dropdown (`src/renderer/features/settings/LanguageSettings.tsx`).
4. Run localization unit tests:

   ```bash
   pnpm test
   ```
