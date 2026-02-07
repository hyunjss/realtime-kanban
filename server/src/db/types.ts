export type CardStatus = 'todo' | 'in_progress' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  order: number;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
}

export interface ColumnDefinition {
  id: CardStatus;
  title: string;
  boardId: string;
}

export type CardCreateInput = Pick<Card, 'title' | 'description'> & {
  status: CardStatus;
};

export type CardUpdateInput = Partial<
  Pick<Card, 'title' | 'description' | 'status' | 'order'>
>;

export interface CardMovedPayload {
  cardId: string;
  targetColumnId: CardStatus;
  newOrder: number;
}

export const COLUMN_IDS: CardStatus[] = ['todo', 'in_progress', 'done'];

export const COLUMN_TITLES: Record<CardStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};
