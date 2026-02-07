import type { Card, CardStatus } from '@/types/kanban';
import { COLUMN_IDS } from '@/types/kanban';
import { getColumnIdFromDroppable } from '../constants/dnd';

export interface MoveTarget {
  targetColumnId: CardStatus;
  newOrder: number;
}

/** Returns target column and index for a DnD drop (for use with store.moveCard). */
export function getMoveTarget(
  cards: Card[],
  activeId: string,
  overId: string
): MoveTarget | null {
  const activeCard = cards.find((c) => c.id === activeId);
  if (!activeCard) return null;

  const columnStatus = getColumnIdFromDroppable(overId);
  let targetStatus: CardStatus;
  let insertIndex: number;

  if (
    columnStatus !== null &&
    COLUMN_IDS.includes(columnStatus as CardStatus)
  ) {
    targetStatus = columnStatus as CardStatus;
    const targetColumnCards = cards.filter((c) => c.status === targetStatus);
    insertIndex = targetColumnCards.length;
  } else {
    const overCard = cards.find((c) => c.id === overId);
    if (!overCard) return null;
    targetStatus = overCard.status;
    const targetColumnCards = cards
      .filter((c) => c.status === targetStatus)
      .sort((a, b) => a.order - b.order);
    const overIndex = targetColumnCards.findIndex((c) => c.id === overId);
    insertIndex = overIndex >= 0 ? overIndex : targetColumnCards.length;
  }

  return { targetColumnId: targetStatus, newOrder: insertIndex };
}
