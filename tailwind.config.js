/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Usando variables CSS para permitir cambios dinámicos de tema
        background: 'var(--color-background)',
        'card-bg': 'var(--color-card-bg)',
        'card-bg-light': 'var(--color-card-bg-light)',
        'dark-navy': 'var(--color-dark-navy)',
        'navy-blue': 'var(--color-navy-blue)',

        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        accent: 'var(--color-accent)',

        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',

        border: 'var(--color-border)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
        'lg': '0.5rem',
      },
      boxShadow: {
        'gold': '0 10px 30px rgba(255, 215, 0, 0.3)',
        'gold-intense': '0 15px 40px rgba(255, 215, 0, 0.5)',
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
