import React, { useEffect } from 'react';
import { useIndustryStore } from '@/lib/industry-store';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { themeSettings = {
    mode: 'light',
    accentColor: '#FF6600',
    glassmorphism: true,
    density: 'comfortable',
    fontScale: 100,
  } } = useIndustryStore();

  useEffect(() => {
    if (!themeSettings) return;
    const root = window.document.documentElement;
    
    // 1. Handle Light/Dark/System Mode
    const applyMode = (mode: 'light' | 'dark' | 'system') => {
      if (!mode) return;
      root.classList.remove('light', 'dark');
      
      if (mode === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(mode);
      }
    };

    applyMode(themeSettings.mode);

    // 2. Handle Accent Color
    // We update the primary CSS variables used by Shadcn/Tailwind
    // Hex to HSL conversion helper
    const hexToHsl = (hex: string) => {
      if (!hex || typeof hex !== 'string') return '24 100% 50%'; // Fallback
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const hsl = hexToHsl(themeSettings.accentColor);
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    root.style.setProperty('--accent', hsl);
    
    // Update sidebar variables as well to match
    root.style.setProperty('--sidebar-primary', hsl);
    root.style.setProperty('--sidebar-accent', hsl);
    root.style.setProperty('--sidebar-ring', hsl);

    // 3. Handle Glassmorphism
    if (themeSettings.glassmorphism) {
      root.classList.add('glass-enabled');
    } else {
      root.classList.remove('glass-enabled');
    }

    // 4. Handle UI Density
    if (themeSettings.density) {
      root.setAttribute('data-density', themeSettings.density);
    }
    
    // 5. Handle Font Scale
    if (themeSettings.fontScale) {
      // Ensure font scale is not too small (min 50%)
      const safeFontScale = Math.max(50, themeSettings.fontScale);
      root.style.fontSize = `${safeFontScale}%`;
    }

  }, [themeSettings]);

  return <>{children}</>;
};
