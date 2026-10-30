import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'*.spec.ts',use:{baseURL:'http://127.0.0.1:4185',headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})},webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4185',url:'http://127.0.0.1:4185',reuseExistingServer:true}});

