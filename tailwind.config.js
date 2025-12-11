/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    yellow: '#FFD23F', // Vibrant Friendly Yellow
                    dark: '#1F2937',   // Soft Charcoal
                    blob: '#FFEECC',   // Pastel Yellow Accent
                    gray: '#F3F4F6',   // Light Gray Background
                },
                background: '#0f172a', // Keep existing for dark mode compatibility if needed, or override
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
