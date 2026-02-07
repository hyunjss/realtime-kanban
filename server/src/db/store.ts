import type { Board, Card, ColumnDefinition } from './types.js';
import { COLUMN_IDS, COLUMN_TITLES } from './types.js';

const DEFAULT_BOARD_ID = 'default';

const initialBoards: Board[] = [
  { id: DEFAULT_BOARD_ID, name: 'Realtime Kanban' },
];

const initialColumns: ColumnDefinition[] = COLUMN_IDS.map((id) => ({
  id,
  title: COLUMN_TITLES[id],
  boardId: DEFAULT_BOARD_ID,
}));

const initialCards: Card[] = [
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

/** In-memory store. Replace with DB client later. */
class KanbanStore {
  boards: Board[] = [...initialBoards];

  columns: ColumnDefinition[] = [...initialColumns];

  cards: Card[] = initialCards.map((c) => ({ ...c }));

  getBoardById(id: string): Board | undefined {
    return this.boards.find((b) => b.id === id);
  }

  getCardsByBoardId(boardId: string): Card[] {
    return this.cards
      .filter((c) => {
        const col = this.columns.find((col) => col.id === c.status);
        return col?.boardId === boardId;
      })
      .sort((a, b) => a.order - b.order);
  }

  getCardById(id: string): Card | undefined {
    return this.cards.find((c) => c.id === id);
  }

  createCard(
    input: { title: string; description: string; status: Card['status'] }
  ): Card {
    const inColumn = this.cards.filter((c) => c.status === input.status);
    const newCard: Card = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status,
      order: inColumn.length,
      createdAt: new Date().toISOString(),
    };
    this.cards.push(newCard);
    return newCard;
  }

  updateCard(id: string, updates: Partial<Card>): Card | undefined {
    const card = this.cards.find((c) => c.id === id);
    if (!card) return undefined;
    Object.assign(card, updates);
    return card;
  }

  deleteCard(id: string): boolean {
    const idx = this.cards.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.cards.splice(idx, 1);
    return true;
  }

  moveCard(
    cardId: string,
    targetColumnId: Card['status'],
    newOrder: number
  ): Card | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return undefined;
    const prevStatus = card.status;
    card.status = targetColumnId;
    card.order = newOrder;
    this.rebalanceOrder(prevStatus);
    this.rebalanceOrder(targetColumnId);
    return card;
  }

  private rebalanceOrder(columnId: Card['status']): void {
    const inColumn = this.cards
      .filter((c) => c.status === columnId)
      .sort((a, b) => a.order - b.order);
    inColumn.forEach((c, i) => {
      c.order = i;
    });
  }
}

export const store = new KanbanStore();
