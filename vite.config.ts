import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
 plugins:[react(),tailwindcss()],base:'./',
 build:{rollupOptions:{output:{manualChunks(id){
  if(id.endsWith('/src/tactics.json'))return 'tactics-catalog';
  if(id.includes('/node_modules/')&&id.includes('motion'))return 'motion';
  if(id.includes('/node_modules/')&&(id.includes('react')||id.includes('scheduler')))return 'react-ui';
 }}}}
});
