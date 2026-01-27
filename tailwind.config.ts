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
        // Neutral-first palette inspired by X: dark surfaces and subtle contrast
        base: '#0A0A0A',
        surface: '#16181C',
        surfaceHover: '#1C1F23',
        border: '#2F3336',
        textPrimary: '#E7E9EA',
        textSecondary: '#71767B',
        textDisabled: '#3E4144',
        action: '#E7E9EA',
        actionHover: '#FFFFFF',
        // Keep legacy "brand" token names mapped to the neutral palette for backwards compatibility
        brand: {
          50: '#F5F6F7',
          100: '#ECEEEF',
          200: '#E7E9EA',
          300: '#C7CCD1',
          400: '#A9B0B6',
          500: '#8C949C',
          600: '#E7E9EA',
          700: '#FFFFFF',
          800: '#FFFFFF',
          900: '#FFFFFF'
        }
      }
    }
  },
  plugins: []
};

export default config;
