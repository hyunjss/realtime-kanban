import { useRef, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

/**
 * 디바운스된 콜백. 타이핑 중 카드 필드 변경 시 매 키 입력마다 API를 호출하지 않고
 * 입력이 멈춘 뒤 한 번만 호출하도록 해 네트워크·서버 부하를 줄임.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 다양한 인자 개수/타입의 콜백 지원
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  type P = Parameters<T>;
  const callbackRef = useRef(callback);
  const debouncedRef = useRef(
    debounce((...args: P) => {
      callbackRef.current(...args);
    }, delayMs)
  );

  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    debouncedRef.current(...args);
  }, []);
}
