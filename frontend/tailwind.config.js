/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050811',
          surface: '#0a0f1d',
          card: '#0f172a',
          cardHover: '#162035',
          border: '#1e293b',
          borderLight: '#334155',
          cyan: '#00e5ff',
          violet: '#8b5cf6',
          amber: '#fbbf24',
          crimson: '#ef4444',
          emerald: '#10b981',
          muted: '#94a3b8',
          subtle: '#64748b',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'JetBrains Mono', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.25)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-crimson': '0 0 20px rgba(239, 68, 68, 0.25)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 6s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
