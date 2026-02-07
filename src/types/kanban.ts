export type CardStatus = 'todo' | 'in_progress' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  order: number;
  createdAt: string; // ISO 8601
}

export interface Column {
  id: CardStatus;
  title: string;
  cards: Card[];
}

/** Column definition (store entity), not derived view */
export interface ColumnDefinition {
  id: CardStatus;
  title: string;
  boardId: string;
}

export interface Board {
  id: string;
  name: string;
}

export const COLUMN_IDS: CardStatus[] = ['todo', 'in_progress', 'done'];

export const COLUMN_TITLES: Record<CardStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

export type CardCreateInput = Pick<Card, 'title' | 'description'>;
export type CardUpdateInput = Partial<
  Pick<Card, 'title' | 'description' | 'status'>
>;
