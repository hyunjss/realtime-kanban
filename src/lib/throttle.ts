/**
 * Throttle: 일정 간격으로만 실행. 연속 이벤트에서 호출 빈도 제한.
 * Socket emit 등 실시간 이벤트 과다 전송 방지로 네트워크·서버 부하 감소.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 인자 타입 보존
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let last = 0;
  let scheduled: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = intervalMs - (now - last);
    if (remaining <= 0) {
      if (scheduled) {
        clearTimeout(scheduled);
        scheduled = null;
      }
      last = now;
      fn(...args);
    } else if (!scheduled) {
      scheduled = setTimeout(() => {
        scheduled = null;
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}
