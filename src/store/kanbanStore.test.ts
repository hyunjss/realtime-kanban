import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore } from './kanbanStore';

describe('kanbanStore', () => {
  beforeEach(() => {
    useKanbanStore.getState().resetForTesting?.();
  });

  describe('addCard', () => {
    it('adds a card to the given column with generated id when tempId is omitted', () => {
      const { addCard, getColumns } = useKanbanStore.getState();
      addCard('todo', { title: 'New task', description: 'Desc' });
      const columns = getColumns();
      const todoCards = columns.find((c) => c.id === 'todo')?.cards ?? [];
      expect(todoCards).toHaveLength(4); // 3 initial + 1
      const added = todoCards[todoCards.length - 1];
      expect(added).toBeDefined();
      expect(added!.title).toBe('New task');
      expect(added!.description).toBe('Desc');
      expect(added!.status).toBe('todo');
      expect(added!.id).toBeDefined();
      expect(added!.createdAt).toBeDefined();
    });

    it('uses tempId when provided (optimistic create)', () => {
      const { addCard, getCardById } = useKanbanStore.getState();
      addCard('in_progress', { title: 'Temp', description: '' }, 'temp-1');
      const card = getCardById('temp-1');
      expect(card).toBeDefined();
      expect(card?.title).toBe('Temp');
      expect(card?.status).toBe('in_progress');
    });

    it('clears addingToColumnId after add', () => {
      const { addCard, setAddingToColumnId } = useKanbanStore.getState();
      setAddingToColumnId('todo');
      expect(useKanbanStore.getState().addingToColumnId).toBe('todo');
      addCard('todo', { title: 'X', description: '' });
      expect(useKanbanStore.getState().addingToColumnId).toBeNull();
    });
  });

  describe('updateCard', () => {
    it('updates title and description', () => {
      const { updateCard, getCardById } = useKanbanStore.getState();
      updateCard('1', { title: 'Updated', description: 'New desc' });
      const card = getCardById('1');
      expect(card?.title).toBe('Updated');
      expect(card?.description).toBe('New desc');
    });

    it('updates status and reorders within column', () => {
      const { updateCard, getColumns } = useKanbanStore.getState();
      updateCard('1', { status: 'in_progress' });
      const columns = getColumns();
      const inProgress = columns.find((c) => c.id === 'in_progress')?.cards ?? [];
      const moved = inProgress.find((c) => c.id === '1');
      expect(moved).toBeDefined();
      expect(inProgress).toHaveLength(3);
    });

    it('clears editingCardId after update', () => {
      const { updateCard, setEditingCardId } = useKanbanStore.getState();
      setEditingCardId('1');
      updateCard('1', { title: 'Same' });
      expect(useKanbanStore.getState().editingCardId).toBeNull();
    });

    it('no-ops when card id does not exist', () => {
      const { updateCard, getCardById } = useKanbanStore.getState();
      updateCard('nonexistent', { title: 'X' });
      expect(getCardById('nonexistent')).toBeUndefined();
    });
  });

  describe('deleteCard', () => {
    it('removes card and rebalances order in column', () => {
      const { deleteCard, getCardById, getColumns } = useKanbanStore.getState();
      deleteCard('1');
      expect(getCardById('1')).toBeUndefined();
      const columns = getColumns();
      const done = columns.find((c) => c.id === 'done')?.cards ?? [];
      expect(done.every((c, i) => c.order === i)).toBe(true);
    });
  });

  describe('moveCard', () => {
    it('moves card to target column and rebalances both columns', () => {
      const { moveCard, getColumns } = useKanbanStore.getState();
      moveCard('3', 'done', 0);
      const columns = getColumns();
      const done = columns.find((c) => c.id === 'done')?.cards ?? [];
      const moved = done.find((c) => c.id === '3');
      expect(moved).toBeDefined();
      expect(done.map((c) => c.order)).toEqual([0, 1]);
    });
  });

  describe('applyCardFromServer / removeCardFromServer', () => {
    it('applyCardFromServer updates existing card', () => {
      const { applyCardFromServer, getCardById } = useKanbanStore.getState();
      applyCardFromServer({
        id: '1',
        title: 'Server title',
        description: 'Server desc',
        status: 'todo',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      const card = getCardById('1');
      expect(card?.title).toBe('Server title');
    });

    it('applyCardFromServer inserts new card when id not found', () => {
      const { applyCardFromServer, getCardById } = useKanbanStore.getState();
      applyCardFromServer({
        id: 'new-from-server',
        title: 'New',
        description: '',
        status: 'todo',
        order: 99,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(getCardById('new-from-server')).toBeDefined();
    });

    it('removeCardFromServer removes card', () => {
      const { removeCardFromServer, getCardById } = useKanbanStore.getState();
      removeCardFromServer('1');
      expect(getCardById('1')).toBeUndefined();
    });
  });

  describe('replaceCard', () => {
    it('replaces temp card with server card after API create', () => {
      const { addCard, replaceCard, getCardById } = useKanbanStore.getState();
      addCard('todo', { title: 'Temp', description: '' }, 'temp-1');
      replaceCard('temp-1', {
        id: 'server-id',
        title: 'Temp',
        description: '',
        status: 'todo',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(getCardById('temp-1')).toBeUndefined();
      expect(getCardById('server-id')).toBeDefined();
    });
  });

  describe('getColumns', () => {
    it('returns columns with cards sorted by order', () => {
      const { getColumns } = useKanbanStore.getState();
      const columns = getColumns();
      expect(columns).toHaveLength(3);
      for (const col of columns) {
        for (let i = 0; i < col.cards.length; i++) {
          expect(col.cards[i]?.order).toBe(i);
        }
      }
    });
  });
});
