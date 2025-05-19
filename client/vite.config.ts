import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType:'prompt',
      manifest:{
        name:"Acronymph",
        short_name:"Acronymph",
        description:"Acronym game like Acrophobia",
        icons:[{
          src: '/android-chrome-192x192.png',
          sizes:'192x192',
          type:'image/png',
          purpose:'any maskable'
        },
        {
          src:'/android-chrome-512x512.png',
          sizes:'512x512',
          type:'image/png',
          purpose:'any maskable'
        },
        {
          src: '/apple-touch-icon.png',
          sizes:'180x180',
          type:'image/png',
          purpose:'any',
        },
        {
          src: '/maskable_icon.png',
          sizes:'512x512',
          type:'image/png',
          purpose:'any maskable',
        }
      ],
      theme_color:'#2b7fff',
      background_color:'#fff',
      display:"standalone",
      scope:'/',
      start_url:"/",
      orientation:'portrait'
      }
    }) 
  ],
  base: './'
})
