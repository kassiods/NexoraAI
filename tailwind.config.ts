import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f1ff',
          100: '#e4ddff',
          200: '#c7b8ff',
          300: '#a48aff',
          400: '#8b5cf6',
          500: '#7a3eea',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0f78'
        }
      }
    }
  },
  plugins: []
};

export default config;
