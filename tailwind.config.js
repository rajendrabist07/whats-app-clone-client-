// tailwind.config.js
export default {
    darkMode: 'class', // Toggle by adding 'dark' class to <html>
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // WhatsApp-inspired color palette
                primary: {
                    DEFAULT: '#25D366',
                    dark: '#128C7E',
                    light: '#DCF8C6',
                },
                chat: {
                    bg: '#ECE5DD',
                    'bg-dark': '#0D1418',
                    sent: '#DCF8C6',
                    'sent-dark': '#005C4B',
                    received: '#FFFFFF',
                    'received-dark': '#202C33',
                },
            },
        },
    },
};