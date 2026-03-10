/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          primary:  '#4B69FF',
          gradient: '#2D3F99',
          light:    '#809CFF',
          lighter:  '#ECF1FF',
          soft:     '#CAD6FF',
        },
        navy: {
          DEFAULT: '#10162F',
          dark:    '#0A1B40',
        },
        success: {
          DEFAULT: '#07C904',
          bg:      '#D8FFD8',
        },
        danger: {
          DEFAULT: '#C60828',
          bg:      'rgba(198,8,40,0.08)',
        },
        warning: {
          DEFAULT: '#FFB624',
          light:   '#FFDF73',
          bg:      'rgba(255,182,36,0.12)',
        },
        surface: '#F1F4FF',
        card:    '#F5F7FF',
      },
      boxShadow: {
        card:  '0 2px 12px rgba(75,105,255,0.08)',
        hover: '0 8px 30px rgba(75,105,255,0.14)',
        btn:   '0 8px 20px rgba(75,105,255,0.35)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'     },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease both',
      },
      width: {
        sidebar: '260px',
        rail:    '64px',
      },
    },
  },
  plugins: [],
}
