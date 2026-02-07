/**
 * Debounce: 연속 호출 시 마지막 호출만 delay 후 실행.
 * 타이핑/리사이즈 등 빈번한 이벤트에서 API/상태 업데이트 횟수를 줄여 네트워크·렌더 비용 절감.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 인자 타입 보존
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delayMs);
  };
}
