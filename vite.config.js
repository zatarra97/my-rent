import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// Leggi la versione dal package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

// Base path per GitHub Pages
// Se il repository è nella root (username.github.io), usa '/'
// Se è un progetto (username.github.io/repository-name), usa '/repository-name/'
// In GitHub Actions, GITHUB_REPOSITORY contiene 'username/repository-name'
// In locale, puoi impostare VITE_BASE_PATH o usare il nome del repository di default
const getBasePath = () => {
  // In produzione su GitHub Pages
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    // Se il repository è 'username.github.io', usa '/', altrimenti '/repository-name/'
    return repoName.endsWith('.github.io') ? '/' : `/${repoName}/`
  }
  // In locale, controlla la variabile d'ambiente o usa '/'
  return process.env.VITE_BASE_PATH || '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'build'
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  }
})