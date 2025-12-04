import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (comme API_KEY) pour les injecter dans le build
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Permet d'utiliser process.env.API_KEY dans le code client sans erreur
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});