/**
 * @emotion/react 모듈 선언 (패키지 타입 미제공 시 사용)
 * Theme 인터페이스는 emotion.d.ts에서 확장됨.
 */
declare module '@emotion/react' {
  export const ThemeProvider: import('react').FC<{
    theme: import('@/theme').Theme;
    children: import('react').ReactNode;
  }>;
  export const Global: import('react').FC<{ styles: unknown }>;
  export function css(
    template: TemplateStringsArray,
    ...args: (string | number)[]
  ): string;
}
