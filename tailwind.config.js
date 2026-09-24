/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9', // Sky blue-ish
                    600: '#0284c7',
                    700: '#0369a1',
                    900: '#0c4a6e',
                },
                // Rediseño "Taller claro" (mismos valores que src/styles/taller.css)
                paper: { DEFAULT: '#f3f2ee', 2: '#eceae3' },
                ink: { DEFAULT: '#0f1a2e', 2: '#51607a' },
                rule: '#c9c6bb',
                signal: '#e8471c',
                ok: '#1f8a4c',
                dark: {
                    bg: '#0f172a', // Slate 900
                    card: '#1e293b', // Slate 800
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                brand: ['Archivo', 'Inter', 'Arial Black', 'sans-serif'],
                body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
