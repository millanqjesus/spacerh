/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aquí definimos tu color personalizado
        space: {
          orange: '#e78813',
          dark: '#1f2937', // Un gris oscuro para contrastar
          light: '#f3f4f6', // Un gris claro para fondos
        }
      },
      fontFamily: {
        // Usaremos una fuente sans moderna por defecto
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}