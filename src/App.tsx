import { lazy, Suspense } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { NicknameEdit } from '@/components/NicknameEdit';
import { PresenceAvatars } from '@/components/PresenceAvatars';

const Board = lazy(() =>
  import('@/features/kanban').then((m) => ({ default: m.Board }))
);

const PageLayout = styled.div`
  min-height: 100vh;
  min-height: calc(100vh - env(safe-area-inset-bottom));
  background-color: ${(p: StyledThemeProps) => p.theme.colors.slate[50]};
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 1rem;
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
  }
  @media (min-width: 1024px) {
    padding: 1rem 2rem;
  }
`;

const HeaderInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  @media (min-width: 640px) {
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[900]};
  flex-shrink: 0;
  @media (min-width: 640px) {
    font-size: 1.5rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  @media (min-width: 640px) {
    gap: 1rem;
  }
`;

const Main = styled.main`
  padding: 1rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const Fallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
`;

function App() {
  return (
    <PageLayout>
      <Header>
        <HeaderInner>
          <Title>Realtime Kanban</Title>
          <HeaderActions>
            <NicknameEdit />
            <ConnectionStatus />
            <PresenceAvatars />
          </HeaderActions>
        </HeaderInner>
      </Header>
      <Main>
        <Suspense
          fallback={
            <Fallback aria-busy>보드 불러오는 중…</Fallback>
          }
        >
          <Board />
        </Suspense>
      </Main>
    </PageLayout>
  );
}

export default App;
