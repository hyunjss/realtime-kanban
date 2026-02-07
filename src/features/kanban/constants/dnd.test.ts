import { describe, it, expect } from 'vitest';
import {
  COLUMN_DROPPABLE_PREFIX,
  getColumnIdFromDroppable,
  getDroppableIdForColumn,
} from './dnd';

describe('dnd constants', () => {
  it('getColumnIdFromDroppable returns column id when id has prefix', () => {
    expect(getColumnIdFromDroppable('column-todo')).toBe('todo');
    expect(getColumnIdFromDroppable('column-done')).toBe('done');
  });

  it('getColumnIdFromDroppable returns null when id does not have prefix', () => {
    expect(getColumnIdFromDroppable('card-1')).toBeNull();
    expect(getColumnIdFromDroppable('')).toBeNull();
  });

  it('getDroppableIdForColumn returns prefixed id', () => {
    expect(getDroppableIdForColumn('todo')).toBe('column-todo');
  });

  it('COLUMN_DROPPABLE_PREFIX is consistent', () => {
    expect(getDroppableIdForColumn('in_progress')).toBe(
      `${COLUMN_DROPPABLE_PREFIX}in_progress`
    );
    expect(getColumnIdFromDroppable(getDroppableIdForColumn('done'))).toBe('done');
  });
});
