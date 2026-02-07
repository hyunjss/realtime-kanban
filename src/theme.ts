/**
 * 디자인 토큰. Tailwind slate 팔레트 기준으로 동일한 톤 유지.
 */
export const theme = {
  colors: {
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    emerald: { 500: '#10b981' },
    amber: { 500: '#f59e0b' },
    red: { 500: '#ef4444', 600: '#dc2626' },
    white: '#ffffff',
  },
  radii: {
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
} as const;

export type Theme = typeof theme;

/** Emotion styled 컴포넌트에서 theme 사용 시 props 타입 */
export type StyledThemeProps = { theme: Theme };
