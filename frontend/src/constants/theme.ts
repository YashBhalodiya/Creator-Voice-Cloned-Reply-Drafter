/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    background: '#F8FAFC', // Slate 50
    backgroundElement: '#E2E8F0', // Slate 200
    backgroundSelected: '#CBD5E1', // Slate 300
    textSecondary: '#64748B', // Slate 500
    violet: '#7C3AED', // Violet 600
    emerald: '#059669', // Emerald 600
    error: '#DC2626', // Red 600
    border: '#E2E8F0', // Slate 200
    card: 'rgba(255, 255, 255, 0.9)',
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    background: '#0B0F19', // Dark Slate Black
    backgroundElement: '#1E293B', // Slate 800
    backgroundSelected: '#334155', // Slate 700
    textSecondary: '#94A3B8', // Slate 400
    violet: '#8B5CF6', // Violet 500 (AI Accent)
    emerald: '#10B981', // Emerald 500 (Success Accent)
    error: '#EF4444', // Red 500
    border: '#1E293B', // Slate 800
    card: 'rgba(22, 30, 49, 0.7)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
