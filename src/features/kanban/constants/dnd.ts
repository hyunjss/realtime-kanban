export const COLUMN_DROPPABLE_PREFIX = 'column-';

export function getColumnIdFromDroppable(id: string): string | null {
  if (id.startsWith(COLUMN_DROPPABLE_PREFIX)) {
    return id.slice(COLUMN_DROPPABLE_PREFIX.length);
  }
  return null;
}

export function getDroppableIdForColumn(columnId: string): string {
  return `${COLUMN_DROPPABLE_PREFIX}${columnId}`;
}
