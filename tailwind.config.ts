import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
                deepSkyBlue: {
                    DEFAULT: '#00BFFF',
                    light: '#33CCFF',
                    dark: '#0099CC',
                    soft: '#00BFFF15',
                },
                soretiNavy: '#050810',
  				border: "hsl(var(--border))",
  				input: "hsl(var(--input))",
  				ring: "hsl(var(--ring))",
  				background: "hsl(var(--background))",
  				foreground: "hsl(var(--foreground))",
  				primary: {
  					DEFAULT: "hsl(var(--primary))",
  					foreground: "hsl(var(--primary-foreground))"
  				},
  				secondary: {
  					DEFAULT: "hsl(var(--secondary))",
  					foreground: "hsl(var(--secondary-foreground))"
  				},
  				destructive: {
  					DEFAULT: "hsl(var(--destructive))",
  					foreground: "hsl(var(--destructive-foreground))"
  				},
  				muted: {
  					DEFAULT: "hsl(var(--muted))",
  					foreground: "hsl(var(--muted-foreground))"
  				},
  				accent: {
  					DEFAULT: "hsl(var(--accent))",
  					foreground: "hsl(var(--accent-foreground))"
  				},
  				popover: {
  					DEFAULT: "hsl(var(--popover))",
  					foreground: "hsl(var(--popover-foreground))"
  				},
  				card: {
  					DEFAULT: "hsl(var(--card))",
  					foreground: "hsl(var(--card-foreground))"
  				},
  				sidebar: {
  					DEFAULT: "hsl(var(--sidebar))",
  					foreground: "hsl(var(--sidebar-foreground))",
  					primary: "hsl(var(--sidebar-primary))",
  					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
  					accent: "hsl(var(--sidebar-accent))",
  					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
  					border: "hsl(var(--sidebar-border))",
  					ring: "hsl(var(--sidebar-ring))"
  				}
  			},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  			keyframes: {
  				"accordion-down": {
  					from: {
  						height: "0"
  					},
  					to: {
  						height: "var(--radix-accordion-content-height)"
  					}
  				},
  				"accordion-up": {
  					from: {
  						height: "var(--radix-accordion-content-height)"
  					},
  					to: {
  						height: "0"
  					}
  				},
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" }
                },
                "glow": {
                    "0%, 100%": { opacity: "0.5", filter: "blur(20px)" },
                    "50%": { opacity: "0.8", filter: "blur(40px)" }
                }
  			},
  			animation: {
  				"accordion-down": "accordion-down 0.2s ease-out",
  				"accordion-up": "accordion-up 0.2s ease-out",
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 4s ease-in-out infinite"
  			}
  		}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
