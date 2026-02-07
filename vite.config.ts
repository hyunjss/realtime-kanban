import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 번들 분석: npm run build:analyze 후 dist/stats.html 확인. Tree shaking·청크 크기 점검용
    process.env.ANALYZE === 'true'
      ? visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true })
      : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // DnD·애니메이션은 보드와 함께 lazy 로드되도록 유지. 추가 청크 분리 시 여기 지정
          'vendor-react': ['react', 'react-dom'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
