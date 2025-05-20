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
        description:"Acronym game like Acrophobia. Play online with friends to construct backronyms from random letters.",
        icons:[{
          src: '/android-chrome-192x192.png',
          sizes:'192x192',
          type:'image/png',
          purpose:'any maskable'
        },
        {
          src: '/android-chrome-384x384.png',
          sizes:'384x384',
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
          sizes:'192x192',
          type:'image/png',
          purpose:'any',
        }
        ],
        screenshots: [{
          src: "/wide-enter.png",
          sizes: "1024x768",
          type: "image/png",
          form_factor: "wide",
          label: "Enter your acronym"
        },
        {
          src: "/narrow-enter.png",
          sizes: "412x915",
          type: "image/png",
          form_factor: "narrow",
          label: "Enter your acronym"
        },
        {
          src: "/wide-vote.png",
          sizes: "1024x768",
          type: "image/png",
          form_factor: "wide",
          label: "Vote for your favorite"
        },
        {
          src: "/narrow-vote.png",
          sizes: "412x915",
          type: "image/png",
          form_factor: "narrow",
          label: "Vote for your favorite"
        },
        {
          src: "/wide-results.png",
          sizes: "1024x768",
          type: "image/png",
          form_factor: "wide",
          label: "Earn points"
        },
        {
          src: "/narrow-results.png",
          sizes: "412x915",
          type: "image/png",
          form_factor: "narrow",
          label: "Earn points"
        }],
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
