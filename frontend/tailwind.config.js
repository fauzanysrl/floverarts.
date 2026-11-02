/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'Poppins', 'sans-serif'],
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        data: ['var(--font-roboto)', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-heading)', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B122D',
          hover: '#4D183B',
          active: '#2B0C20',
          50: '#FAF6F8',
          100: '#F5ECF1',
        },
        bgPage: '#FFFFFF',
        surface: '#FAF7F8',
        bgSecondary: '#FAF7F8',
        cardWhite: '#FFFFFF',
        primaryText: '#241B22',
        secondaryText: '#756A73',
        borderNeutral: '#E8E0E5',
        softLavender: '#EDE3F2',
        accentLavender: '#D9B7CC',
        semantic: {
          error: '#d93848',
          errorBg: '#fdf2f3',
          success: '#1f8a53',
          successBg: '#edf8f2',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        0: '0px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(36, 27, 34, 0.04)',
        sm: '0 2px 6px rgba(36, 27, 34, 0.05)',
        md: '0 4px 16px -2px rgba(59, 18, 45, 0.06)',
        card: '0 8px 24px -4px rgba(59, 18, 45, 0.07)',
        button: '0 4px 14px -2px rgba(59, 18, 45, 0.22)',
      },
      maxWidth: {
        container: '1240px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
        reveal: '600ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      scale: {
        97: '0.97',
        98: '0.98',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        cartBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 250ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 250ms ease-out both',
        'scale-up': 'scaleUp 250ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'cart-bounce': 'cartBounce 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};
