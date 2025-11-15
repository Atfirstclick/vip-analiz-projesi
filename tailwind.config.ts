import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vip-gold': '#ffde59',           // ← YENİ RENK
        'vip-gold-light': '#ffe889',     // ← Açık ton
        'vip-gold-dark': '#e6c640',      // ← Koyu ton
        'vip-navy': '#20344c',
        'vip-navy-light': '#2d4a6e',
        'vip-navy-dark': '#162338',
      },
    },
  },
  plugins: [],
}

export default config