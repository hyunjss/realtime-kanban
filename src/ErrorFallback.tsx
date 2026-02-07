import type { ReactNode } from 'react';

interface Props {
  error: Error;
  reset?: () => void;
}

export function ErrorFallback({ error, reset }: Props): ReactNode {
  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '600px',
        margin: '2rem auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
      }}
    >
      <h2 style={{ color: '#b91c1c', marginTop: 0 }}>오류가 발생했습니다</h2>
      <pre
        style={{
          overflow: 'auto',
          padding: '1rem',
          background: '#fff',
          borderRadius: '4px',
          fontSize: '0.875rem',
        }}
      >
        {error.message}
      </pre>
      {reset ? (
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
