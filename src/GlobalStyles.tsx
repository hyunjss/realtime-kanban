import { Global, css } from '@emotion/react';

/**
 * 앱 전역 스타일. Tailwind base 대체 (박스 사이징, 기본 리셋).
 */
export function GlobalStyles() {
  return (
    <Global
      styles={css`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol';
          -webkit-font-smoothing: antialiased;
        }
      `}
    />
  );
}
