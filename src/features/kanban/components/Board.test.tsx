import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CardStatus } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import Board from './Board';

// useRealtimeSync uses socket and API; mock so Board only uses store
vi.mock('@/hooks/useRealtimeSync', () => ({
  useRealtimeSync: () => ({
    addCardOptimistic: (status: CardStatus, card: { title: string; description: string }) => {
      useKanbanStore.getState().addCard(status, card);
      return Promise.resolve();
    },
    updateCardOptimistic: (cardId: string, updates: { title?: string; description?: string; status?: CardStatus }) => {
      useKanbanStore.getState().updateCard(cardId, updates);
      return Promise.resolve();
    },
    deleteCardOptimistic: () => Promise.resolve(),
    moveCardOptimistic: (cardId: string, targetColumnId: CardStatus, newOrder: number) => {
      useKanbanStore.getState().moveCard(cardId, targetColumnId, newOrder);
      return Promise.resolve();
    },
  }),
}));

describe('Board', () => {
  beforeEach(() => {
    useKanbanStore.getState().resetForTesting?.();
  });

  it('renders columns and cards from store', () => {
    render(<Board />);
    expect(screen.getByRole('region', { name: '칸반 보드' })).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('칸반 보드 UI 구현')).toBeInTheDocument();
    expect(screen.getByText('드래그 앤 드롭 연동')).toBeInTheDocument();
  });

  it('reflects store when card is moved to another column', () => {
    render(<Board />);
    expect(screen.getByLabelText(/Todo 컬럼/)).toHaveTextContent('실시간 협업 준비');
    act(() => {
      useKanbanStore.getState().moveCard('3', 'done', 0);
    });
    expect(screen.getByLabelText(/Done 컬럼/)).toHaveTextContent('실시간 협업 준비');
  });

  it('opens add form when "카드 추가" is clicked', async () => {
    render(<Board />);
    const addButton = screen.getByRole('button', { name: /Todo에 카드 추가/ });
    await userEvent.click(addButton);
    expect(screen.getByPlaceholderText('제목')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });
});
