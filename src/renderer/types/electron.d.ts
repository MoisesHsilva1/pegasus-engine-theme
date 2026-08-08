/// <reference types="vite/client" />

import type { PegasusApi } from '@shared/ipc'

declare global {
  interface Window {
    pegasus?: PegasusApi
  }
}
