/* eslint-disable no-param-reassign -- Immer draft mutations are intentional */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Board,
  Card,
  CardCreateInput,
  CardStatus,
  CardUpdateInput,
  Column,
  ColumnDefinition,
} from '@/types/kanban';
import { COLUMN_IDS, COLUMN_TITLES } from '@/types/kanban';

const DEFAULT_BOARD_ID = 'default';
const INITIAL_BOARDS: Board[] = [
  { id: DEFAULT_BOARD_ID, name: 'Realtime Kanban' },
];

const INITIAL_COLUMNS: ColumnDefinition[] = COLUMN_IDS.map((id) => ({
  id,
  title: COLUMN_TITLES[id],
  boardId: DEFAULT_BOARD_ID,
}));

const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    title: '칸반 보드 UI 구현',
    description: 'Board, Column, Card, CardForm 컴포넌트 구성',
    status: 'done',
    order: 0,
    createdAt: '2025-02-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: '드래그 앤 드롭 연동',
    description: '@dnd-kit으로 카드 이동 처리',
    status: 'in_progress',
    order: 1,
    createdAt: '2025-02-02T11:00:00.000Z',
  },
  {
    id: '3',
    title: '실시간 협업 준비',
    description: 'WebSocket 또는 SSE 연동 설계',
    status: 'todo',
    order: 0,
    createdAt: '2025-02-03T09:00:00.000Z',
  },
  {
    id: '4',
    title: '접근성 검토',
    description: 'ARIA 레이블 및 키보드 네비게이션 점검',
    status: 'todo',
    order: 1,
    createdAt: '2025-02-04T14:00:00.000Z',
  },
  {
    id: '5',
    title: '반응형 레이아웃 테스트',
    description: '모바일/태블릿/데스크톱 브레이크포인트 확인',
    status: 'in_progress',
    order: 0,
    createdAt: '2025-02-05T08:00:00.000Z',
  },
  {
    id: '6',
    title: '상태관리 마이그레이션',
    description: 'Zustand + TanStack Query 도입',
    status: 'todo',
    order: 2,
    createdAt: '2025-02-06T16:00:00.000Z',
  },
];

export interface KanbanState {
  boards: Board[];
  columns: ColumnDefinition[];
  cards: Card[];
  /** UI only, not persisted */
  editingCardId: string | null;
  addingToColumnId: CardStatus | null;
  activeDragId: string | null;
}

export interface KanbanActions {
  addCard: (
    columnId: CardStatus,
    card: CardCreateInput,
    tempId?: string
  ) => void;
  updateCard: (cardId: string, updates: CardUpdateInput) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (
    cardId: string,
    targetColumnId: CardStatus,
    newOrder: number
  ) => void;
  reorderCard: (cardId: string, newOrder: number) => void;
  /** Apply card from server (create or update from realtime event) */
  applyCardFromServer: (card: Card) => void;
  /** Remove card (from server realtime event) */
  removeCardFromServer: (cardId: string) => void;
  /** Replace temp card with server card after API create (optimistic rollback uses removeCardFromServer) */
  replaceCard: (tempId: string, serverCard: Card) => void;
  setEditingCardId: (id: string | null) => void;
  setAddingToColumnId: (id: CardStatus | null) => void;
  setActiveDragId: (id: string | null) => void;
  getColumns: () => Column[];
  getCardById: (id: string) => Card | undefined;
  /** Test only: reset state to initial (bypasses persist). */
  resetForTesting?: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

function rebalanceOrder(cards: Card[], columnId: CardStatus): void {
  const inColumn = cards.filter((c: Card) => c.status === columnId);
  inColumn.sort((a: Card, b: Card) => a.order - b.order);
  inColumn.forEach((c: Card, i: number) => {
    c.order = i;
  });
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    immer((set, get) => ({
      boards: INITIAL_BOARDS,
      columns: INITIAL_COLUMNS,
      cards: INITIAL_CARDS,
      editingCardId: null,
      addingToColumnId: null,
      activeDragId: null,

      addCard(columnId, card, tempId) {
        set((state) => {
          const inColumn = state.cards.filter(
            (c: Card) => c.status === columnId
          );
          const newOrder = inColumn.length;
          const newCard: Card = {
            id: tempId ?? crypto.randomUUID(),
            title: card.title,
            description: card.description,
            status: columnId,
            order: newOrder,
            createdAt: new Date().toISOString(),
          };
          state.cards.push(newCard);
          state.addingToColumnId = null;
        });
      },

      updateCard(cardId, updates) {
        set((state) => {
          const card = state.cards.find((c: Card) => c.id === cardId);
          if (!card) return;
          if (updates.title !== undefined) card.title = updates.title;
          if (updates.description !== undefined)
            card.description = updates.description;
          if (updates.status !== undefined) {
            const prevStatus = card.status;
            card.status = updates.status;
            if (prevStatus !== updates.status) {
              const inTarget = state.cards.filter(
                (c: Card) => c.status === updates.status
              );
              card.order = inTarget.length;
              rebalanceOrder(state.cards, prevStatus);
            }
          }
          state.editingCardId = null;
        });
      },

      deleteCard(cardId) {
        set((state) => {
          const card = state.cards.find((c: Card) => c.id === cardId);
          if (!card) return;
          const idx = state.cards.findIndex((c: Card) => c.id === cardId);
          if (idx !== -1) state.cards.splice(idx, 1);
          rebalanceOrder(state.cards, card.status);
        });
      },

      moveCard(cardId, targetColumnId, newOrder) {
        set((state) => {
          const card = state.cards.find((c: Card) => c.id === cardId);
          if (!card) return;
          const sourceStatus = card.status;
          card.status = targetColumnId;
          card.order = newOrder;
          rebalanceOrder(state.cards, sourceStatus);
          rebalanceOrder(state.cards, targetColumnId);
        });
      },

      reorderCard(cardId, newOrder) {
        set((state) => {
          const card = state.cards.find((c: Card) => c.id === cardId);
          if (!card) return;
          card.order = newOrder;
          rebalanceOrder(state.cards, card.status);
        });
      },

      applyCardFromServer(card) {
        set((state) => {
          const idx = state.cards.findIndex((c: Card) => c.id === card.id);
          if (idx >= 0) {
            state.cards[idx] = { ...card };
          } else {
            state.cards.push({ ...card });
          }
          rebalanceOrder(state.cards, card.status);
        });
      },

      removeCardFromServer(cardId) {
        set((state) => {
          const idx = state.cards.findIndex((c: Card) => c.id === cardId);
          if (idx === -1) return;
          const card = state.cards[idx];
          if (!card) return;
          state.cards.splice(idx, 1);
          rebalanceOrder(state.cards, card.status);
        });
      },

      replaceCard(tempId, serverCard) {
        set((state) => {
          const idx = state.cards.findIndex((c: Card) => c.id === tempId);
          if (idx === -1) return;
          state.cards.splice(idx, 1, { ...serverCard });
          rebalanceOrder(state.cards, serverCard.status);
        });
      },

      setEditingCardId(id) {
        set((state) => {
          state.editingCardId = id;
        });
      },

      setAddingToColumnId(id) {
        set((state) => {
          state.addingToColumnId = id;
        });
      },

      setActiveDragId(id) {
        set((state) => {
          state.activeDragId = id;
        });
      },

      getColumns() {
        const { cards } = get();
        return COLUMN_IDS.map((id) => ({
          id,
          title: COLUMN_TITLES[id],
          cards: cards
            .filter((c) => c.status === id)
            .sort((a, b) => a.order - b.order),
        }));
      },

      getCardById(id) {
        return get().cards.find((c: Card) => c.id === id);
      },

      resetForTesting() {
        set((state) => {
          state.boards = [...INITIAL_BOARDS];
          state.columns = [...INITIAL_COLUMNS];
          state.cards = INITIAL_CARDS.map((c) => ({ ...c }));
          state.editingCardId = null;
          state.addingToColumnId = null;
          state.activeDragId = null;
        });
      },
    })),
    {
      name: 'kanban-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        boards: state.boards,
        columns: state.columns,
        cards: state.cards,
      }),
    }
  )
);
