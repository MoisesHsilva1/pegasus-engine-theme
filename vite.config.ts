/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

const aliases = {
  '@': path.resolve(__dirname, './src/renderer'),
  '@shared': path.resolve(__dirname, './src/shared'),
  '@main': path.resolve(__dirname, './src/main'),
  '@preload': path.resolve(__dirname, './src/preload'),
}

export default defineConfig({
  root: path.join(__dirname, 'src/renderer'),
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: path.resolve(__dirname, 'src/main/index.ts'),
        vite: {
          resolve: {
            alias: aliases,
          },
          build: {
            outDir: path.join(__dirname, 'dist-electron/main'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      preload: {
        input: path.resolve(__dirname, 'src/preload/index.ts'),
        vite: {
          resolve: {
            alias: aliases,
          },
          build: {
            outDir: path.join(__dirname, 'dist-electron/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: aliases,
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
  },
  test: {
    root: __dirname,
    globals: true,
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: [path.resolve(__dirname, './tests/setup.ts')],
    include: [path.resolve(__dirname, './tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}')],
  },
})
