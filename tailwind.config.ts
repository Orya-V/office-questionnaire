import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          blue: '#003DA5',
          lightBlue: '#00A3E0',
          orange: '#FFA300',
        }
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
} satisfies Config;
