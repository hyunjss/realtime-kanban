import { describe, it, expect } from 'vitest';
import { getMoveTarget } from './moveCard';
import type { Card } from '@/types/kanban';

const cards: Card[] = [
  { id: '1', title: 'A', description: '', status: 'todo', order: 0, createdAt: '' },
  { id: '2', title: 'B', description: '', status: 'todo', order: 1, createdAt: '' },
  { id: '3', title: 'C', description: '', status: 'in_progress', order: 0, createdAt: '' },
  { id: '4', title: 'D', description: '', status: 'done', order: 0, createdAt: '' },
];

describe('getMoveTarget', () => {
  it('returns target column and append index when over column droppable', () => {
    const result = getMoveTarget(cards, '1', 'column-done');
    expect(result).toEqual({ targetColumnId: 'done', newOrder: 1 });
  });

  it('returns target column and insert index when over another card', () => {
    const result = getMoveTarget(cards, '3', '2');
    expect(result).toEqual({ targetColumnId: 'todo', newOrder: 1 });
  });

  it('returns null when activeId is not in cards', () => {
    const result = getMoveTarget(cards, 'nonexistent', 'column-todo');
    expect(result).toBeNull();
  });

  it('returns null when over another card that is not in cards', () => {
    const result = getMoveTarget(cards, '1', 'ghost-id');
    expect(result).toBeNull();
  });

  it('handles drop on same column (reorder)', () => {
    const result = getMoveTarget(cards, '1', '2');
    expect(result).toEqual({ targetColumnId: 'todo', newOrder: 1 });
  });
});
