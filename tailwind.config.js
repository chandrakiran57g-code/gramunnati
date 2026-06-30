/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  /* Laravel: scan resources/js — do NOT copy React SPA paths (./src/**) */
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: 'hsl(var(--success))',
        cream: {
          50: 'hsl(var(--cream-50))',
          100: 'hsl(var(--cream-100))',
          200: 'hsl(var(--cream-200))',
          300: 'hsl(var(--cream-300))',
          400: 'hsl(var(--cream-400))',
        },
        brown: {
          900: 'hsl(var(--brown-900))',
          800: 'hsl(var(--brown-800))',
          600: 'hsl(var(--brown-600))',
          500: 'hsl(var(--brown-500))',
          400: 'hsl(var(--brown-400))',
          300: 'hsl(var(--brown-300))',
          200: 'hsl(var(--brown-200))',
        },
        service: {
          village: { DEFAULT: 'hsl(var(--service-village))', tint: 'hsl(var(--service-village-tint))' },
          school: { DEFAULT: 'hsl(var(--service-school))', tint: 'hsl(var(--service-school-tint))' },
          tree: { DEFAULT: 'hsl(var(--service-tree))', tint: 'hsl(var(--service-tree-tint))' },
          water: { DEFAULT: 'hsl(var(--service-water))', tint: 'hsl(var(--service-water-tint))' },
          agriculture: { DEFAULT: 'hsl(var(--service-agriculture))', tint: 'hsl(var(--service-agriculture-tint))' },
          women: { DEFAULT: 'hsl(var(--service-women))', tint: 'hsl(var(--service-women-tint))' },
          skill: { DEFAULT: 'hsl(var(--service-skill))', tint: 'hsl(var(--service-skill-tint))' },
          healthcare: { DEFAULT: 'hsl(var(--service-healthcare))', tint: 'hsl(var(--service-healthcare-tint))' },
        },
        /* Legacy aliases — map to platform / service tokens */
        village: 'hsl(var(--service-village))',
        'village-light': '#40916C',
        school: 'hsl(var(--service-school))',
        'school-light': '#3B82F6',
        donation: '#5C4033',
        'donation-light': '#3D2914',
        volunteer: 'hsl(var(--service-tree))',
        projects: 'hsl(var(--service-skill))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)']
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'count-up': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-up': { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(30px)' }, to: { opacity: '1', transform: 'translateX(0)' } }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'count-up': 'count-up 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
