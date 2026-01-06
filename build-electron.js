import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildElectron() {
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
        external: ['electron', 'electron-store', 'crypto-js', 'puppeteer-core'],
        output: {
          format: 'es',
        },
      },
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
    },
  });
}

buildElectron().catch(console.error);
