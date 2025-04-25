/** @type {import('tailwindcss').Config} */
import fluid, { extract, screens, fontSize } from 'fluid-tailwind'

module.exports = {
    darkMode: ['class'],
    content: {
    files:[
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ], 
    extract
  },
  theme: {
  	extend: {
  		fontFamily: {
  			cormorant: [
  				'var(--font-cormorant-garamond)'
  			],
  			dancing: [
  				'var(--font-dancing-script)'
  			],
  			sans: [
  				'var(--font-cormorant-garamond)'
  			],
  			mono: [
  				'var(--font-dancing-script)'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			'brand-blue': '#4876ff',
  			'brand-lime': '#d9f154',
  			'brand-navy': '#2e3192',
  			'brand-orange': '#ff7347',
  			'brand-pink': '#f7d0e9',
  			'brand-purple': '#692e54',
  			'brand-gray': '#fffdf9',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			squiggle: {
  				'0%': {
  					filter: 'url("#squiggle-0")'
  				},
  				'25%': {
  					filter: 'url("#squiggle-1")'
  				},
  				'50%': {
  					filter: 'url("#squiggle-2")'
  				},
  				'75%': {
  					filter: 'url("#squiggle-3")'
  				},
  				'100%': {
  					filter: 'url("#squiggle-4")'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			squiggle: 'squiggle .5s infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    fluid,
      require("tailwindcss-animate")
],
}