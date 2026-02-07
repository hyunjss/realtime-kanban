import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { AppErrorBoundary } from '@/AppErrorBoundary';
import { GlobalStyles } from '@/GlobalStyles';
import { theme } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif;">#root 요소를 찾을 수 없습니다. index.html을 확인하세요.</p>';
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
