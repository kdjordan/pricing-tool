/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
				sizeSm: 'clamp(0.8rem, 0.17vi + 0.76rem, 0.89rem)',
				sizeBase: 'clamp(1rem, 0.34vi + 0.91rem, 1.19rem)',
				sizeLg: 'clamp(1.25rem, 0.61vi + 1.1rem, 1.58rem)',
				sizeXl: 'clamp(1.56rem, 1vi + 1.31rem, 2.11rem)',
				size2xl: 'clamp(1.95rem, 1.56vi + 1.56rem, 2.81rem)',
				size3xl: 'clamp(2.44rem, 2.38vi + 1.85rem, 3.75rem)',
				size4xl: 'clamp(3.05rem, 3.54vi + 2.17rem, 5rem)',
				size5xl: 'clamp(3.81rem, 5.18vi + 2.52rem, 6.66rem)',
				size6xl: 'clamp(4.77rem, 7.48vi + 2.9rem, 8.88rem)',
			},
      colors: {
        primary: '#2ecc71',       // Deep Green
        secondary: '#e67e22',     // Sand Beige
        accent: '#34495e',        // Dark Slate
        text: '#2c3e50',          // Charcoal Gray
        background: '#ecf0f1',    // Soft Sky
      },
      fontFamily: {
        primary: ['Raleway', 'sans-serif'],
        secondary: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

