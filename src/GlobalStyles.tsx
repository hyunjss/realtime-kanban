import { Global, css } from '@emotion/react';

/**
 * 앱 전역 스타일. 모바일: safe-area, 터치 스크롤, 가로 overflow 방지.
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
        html {
          overflow-x: hidden;
        }
        body {
          margin: 0;
          font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol';
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          /* 노치/홈 바 대응 */
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        /* 모바일 가로 스크롤 영역: 부드러운 터치 스크롤 */
        .board-columns-row {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
      `}
    />
  );
}
