import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space (backgrounds)
        space: {
          950: '#030014',
          900: '#0a0520',
          800: '#110a2e',
          700: '#1a1040',
        },
        // Cosmic Purple (primary)
        cosmic: {
          500: '#7c3aed',
          400: '#8b5cf6',
          300: '#a78bfa',
          200: '#c4b5fd',
        },
        // Nebula (accent)
        nebula: {
          500: '#a855f7',
          400: '#c084fc',
          300: '#d8b4fe',
        },
        // Stardust (text)
        stardust: {
          100: '#f5f3ff',
          200: '#ede9fe',
          300: '#ddd6fe',
          400: '#a1a1aa',
        },
      },
      backgroundImage: {
        // Mesh gradients predefinidos
        'mesh-cosmic': `
          radial-gradient(at 40% 20%, rgba(124, 58, 237, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(192, 132, 252, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(167, 139, 250, 0.2) 0px, transparent 50%)
        `,
        'mesh-aurora': `
          radial-gradient(ellipse at top, rgba(124, 58, 237, 0.3) 0%, transparent 50%),
          radial-gradient(at 0% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
          radial-gradient(at 100% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
        `,
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
