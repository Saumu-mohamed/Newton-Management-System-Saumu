/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))',
        info: 'hsl(var(--info))',
        'info-foreground': 'hsl(var(--info-foreground))',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        'slideLeft': {
          'from': { opacity: '0', transform: 'translateX(8px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slideRight': {
          'from': { opacity: '0', transform: 'translateX(-8px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slideUp': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideDown': {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    animate,
    // Custom utility plugin to add design system utilities
    function ({ addUtilities, theme, e }) {
      const utilities = {
        // Container & Layout
        '.container-page': {
          '@apply': 'mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8',
        },
        '.container-section': {
          '@apply': 'mx-auto max-w-6xl px-3 sm:px-4 md:px-6',
        },
        '.content-wrapper': {
          '@apply': 'space-y-6 md:space-y-8',
        },

        // Grid Layouts
        '.grid-cards': {
          '@apply': 'grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        },
        '.grid-cards-lg': {
          '@apply': 'grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3',
        },
        '.grid-cards-dashboard': {
          '@apply': 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
        },

        // Flex Utilities
        '.flex-between': { '@apply': 'flex items-center justify-between' },
        '.flex-center': { '@apply': 'flex items-center justify-center' },
        '.flex-start': { '@apply': 'flex items-center justify-start' },
        '.flex-col-center': { '@apply': 'flex flex-col items-center justify-center' },
        '.flex-responsive': { '@apply': 'flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-5' },
        '.flex-responsive-wrap': { '@apply': 'flex flex-wrap gap-2 sm:gap-3' },

        // Typography
        '.h1-display': { '@apply': 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight' },
        '.h1-page': { '@apply': 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight' },
        '.h2-section': { '@apply': 'text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight' },
        '.h3-subsection': { '@apply': 'text-lg sm:text-xl font-semibold tracking-tight' },
        '.body-lg': { '@apply': 'text-base leading-relaxed' },
        '.body-md': { '@apply': 'text-sm leading-relaxed' },
        '.body-sm': { '@apply': 'text-xs sm:text-sm leading-relaxed' },
        '.label-lg': { '@apply': 'text-sm font-medium leading-tight' },
        '.label-md': { '@apply': 'text-xs font-medium leading-tight' },
        '.label-sm': { '@apply': 'text-xs font-semibold uppercase tracking-widest' },

        // Cards
        '.card-elevated': { '@apply': 'bg-card border border-border/50 rounded-lg shadow-sm' },
        '.card-interactive': {
          '@apply': 'bg-card border border-border/50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer',
        },
        '.card-outline': { '@apply': 'border border-border rounded-lg' },
        '.card-subtle': { '@apply': 'bg-secondary/30 border border-border/30 rounded-lg' },
        '.card-glass': { '@apply': 'bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg' },

        // Forms
        '.form-group': { '@apply': 'flex flex-col gap-2' },
        '.form-grid': { '@apply': 'grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' },
        '.input-base': {
          '@apply': 'w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors',
        },
        '.input-focus': {
          '@apply': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        },
        '.input-lg': { '@apply': 'px-4 py-3 text-base' },
        '.input-sm': { '@apply': 'px-2.5 py-1.5 text-sm' },
        '.input-error': { '@apply': 'border-destructive focus-visible:ring-destructive' },

        // Badges
        '.badge-base': { '@apply': 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium' },
        '.badge-primary': { '@apply': 'bg-primary/10 text-primary' },
        '.badge-success': { '@apply': 'bg-success/10 text-success' },
        '.badge-warning': { '@apply': 'bg-warning/10 text-warning' },
        '.badge-destructive': { '@apply': 'bg-destructive/10 text-destructive' },
        '.badge-info': { '@apply': 'bg-info/10 text-info' },

        // Tables
        '.table-wrapper': { '@apply': 'w-full overflow-x-auto' },
        '.table-responsive': { '@apply': 'w-full border-collapse text-sm' },
        '.table-header': { '@apply': 'bg-muted/50 border-b border-border' },
        '.table-row': { '@apply': 'border-b border-border hover:bg-muted/40 transition-colors' },
        '.table-cell': { '@apply': 'px-3 py-3 sm:px-4 text-left align-middle' },
        '.table-cell-sm': { '@apply': 'px-2 py-2 sm:px-3' },

        // Sections
        '.section-header': { '@apply': 'flex items-center justify-between gap-4 pb-4 border-b border-border mb-6' },
        '.section-title': { '@apply': 'h3-subsection' },
        '.divider': { '@apply': 'my-4 sm:my-6 border-t border-border' },
        '.divider-vertical': { '@apply': 'mx-2 sm:mx-4 h-6 border-l border-border' },

        // Focus & States
        '.focus-ring': {
          '@apply': 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg',
        },
        '.focus-ring-sm': { '@apply': 'focus:outline-none focus:ring-1 focus:ring-primary' },
        '.disabled-state': { '@apply': 'opacity-50 cursor-not-allowed' },
        '.loading-state': { '@apply': 'animate-pulse' },

        // Responsive Visibility
        '.show-mobile': { '@apply': 'sm:hidden' },
        '.hide-mobile': { '@apply': 'hidden sm:block' },
        '.show-tablet': { '@apply': 'hidden md:block' },
        '.hide-tablet': { '@apply': 'md:hidden' },
        '.show-desktop': { '@apply': 'hidden lg:block' },
        '.hide-desktop': { '@apply': 'lg:hidden' },

        // Shadows
        '.shadow-xs': { '@apply': 'shadow-sm' },
        '.shadow-base': { '@apply': 'shadow' },
        '.shadow-md': { '@apply': 'shadow-md' },
        '.shadow-lg': { '@apply': 'shadow-lg' },
        '.shadow-blur': { '@apply': 'shadow-2xl shadow-primary/10' },

        // Text Utilities
        '.text-muted': { '@apply': 'text-muted-foreground' },
        '.text-subtle': { '@apply': 'text-muted-foreground/70' },
        '.text-truncate': { '@apply': 'truncate' },
        '.text-line-clamp-2': {
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        },
        '.text-line-clamp-3': {
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        },

        // Stacks
        '.stack-vertical': { '@apply': 'flex flex-col gap-3' },
        '.stack-vertical-lg': { '@apply': 'flex flex-col gap-4 sm:gap-5 md:gap-6' },
        '.stack-horizontal': { '@apply': 'flex flex-row gap-2 sm:gap-3' },
        '.stack-horizontal-lg': { '@apply': 'flex flex-row gap-3 sm:gap-4 md:gap-5' },

        // Data States
        '.empty-state': { '@apply': 'flex flex-col items-center justify-center py-12 sm:py-16 md:py-20' },
        '.empty-state-icon': { '@apply': 'h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4' },
        '.error-state': { '@apply': 'p-4 sm:p-5 rounded-lg border border-destructive/30 bg-destructive/5' },
        '.success-state': { '@apply': 'p-4 sm:p-5 rounded-lg border border-success/30 bg-success/5' },
        '.warning-state': { '@apply': 'p-4 sm:p-5 rounded-lg border border-warning/30 bg-warning/5' },
      };

      addUtilities(utilities);
    },
  ],
};
