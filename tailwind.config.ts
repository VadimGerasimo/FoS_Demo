import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        'pwc-orange': '#eb8c00',
        'pwc-orange-dark': '#dc6900',
        // Sidebar
        'sidebar-bg': 'rgb(50,51,54)',
        'sidebar-hover': 'rgba(255,255,255,0.08)',
        'sidebar-active': 'rgba(235,140,0,0.15)',
        // Page
        'page-bg': '#f5f5f5',
        'card-bg': '#ffffff',
        // Zone colours
        'zone-red': '#dc2626',
        'zone-red-bg': '#fef2f2',
        'zone-amber': '#eb8c00',
        'zone-amber-bg': '#fffbeb',
        'zone-green': '#059669',
        'zone-green-bg': '#ecfdf5',
        // Text
        'text-primary': '#333333',
        'text-secondary': '#6d6e71',
        'text-muted': '#939598',
        // Borders
        'border-default': '#e7e7e8',
        'border-strong': '#dadadc',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
