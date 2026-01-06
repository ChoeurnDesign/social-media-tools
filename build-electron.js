import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { renameSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildElectron() {
  // Build main process
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main/index.js'),
        formats: ['es'],
        fileName: () => 'main.js',
      },
      outDir: 'dist-electron',
      emptyOutDir: true,
      rollupOptions: {
        external: [
          'electron', 
          'electron-store', 
          'crypto-js', 
          'puppeteer-core',
          'better-sqlite3',
          'url',
          'path',
          'fs',
          'node:url',
          'node:path',
          'node:fs',
        ],
        output: {
          format: 'es',
        },
      },
      target: 'node18',
      ssr: true,
    },
  });

  // Build preload script
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main/preload.js'),
        formats: ['cjs'],
        fileName: () => 'preload.js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs',
        },
      },
      target: 'node18',
      ssr: true,
    },
  });

  // Build mobile preload script
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/mobile/mobile-preload.js'),
        formats: ['cjs'],
        fileName: () => 'mobile-preload.js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs',
        },
      },
      target: 'node18',
      ssr: true,
    },
  });

  // Copy storage and session files
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main/storage.js'),
        formats: ['es'],
        fileName: () => 'storage.js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron-store', 'crypto-js'],
        output: {
          format: 'es',
        },
      },
      target: 'node18',
      ssr: true,
    },
  });

  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main/session.js'),
        formats: ['es'],
        fileName: () => 'session.js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'es',
        },
      },
      target: 'node18',
      ssr: true,
    },
  });
}

buildElectron()
  .then(() => {
    // Rename index.js to main.js
    const indexPath = resolve(__dirname, 'dist-electron/index.js');
    const mainPath = resolve(__dirname, 'dist-electron/main.js');
    if (existsSync(indexPath)) {
      renameSync(indexPath, mainPath);
    }
  })
  .catch(console.error);
