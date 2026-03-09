/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                apple: {
                    bg: '#F5F5F7',
                    card: '#FFFFFF',
                    text: '#1D1D1F',
                    blue: '#007AFF', // Vibrant Apple Blue
                    grey: '#1D1D1F',
                    softBlue: '#E5F1FF',
                    darkBg: '#000000',
                    darkCard: '#1C1C1E',
                    darkCardHover: '#2C2C2E',
                    darkText: '#F5F5F7',
                    darkGrey: '#F5F5F7',
                    darkBorder: '#38383A',
                    secondaryLight: '#4B5563', // Improved Light Mode secondary contrast
                    secondaryDark: '#A1A1AA',  // Improved Dark Mode secondary contrast
                }
            },
            borderRadius: {
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'apple': '0 4px 24px rgba(0, 0, 0, 0.04)',
                'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
                'apple-dark': '0 4px 24px rgba(0, 0, 0, 0.3)',
            }
        },
    },
    plugins: [],
}
