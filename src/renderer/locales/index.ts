import { en, type TranslationSchema } from './en'
import { ptBR } from './pt-BR'
import type { Language } from '@shared/types'

export const translations: Record<Language, TranslationSchema> = {
  en,
  'pt-BR': ptBR,
}

export type { TranslationSchema }
