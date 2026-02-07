import { memo, useMemo, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Card, CardStatus, Column as ColumnType } from '@/types/kanban';
import { COLUMN_IDS, COLUMN_TITLES } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Column from './Column';
import { CardDragOverlay } from './CardDragOverlay';
import { getMoveTarget } from '../utils/moveCard';

const MOBILE_BREAKPOINT = 768;

const BoardRegion = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

const ColumnsRow = styled.div<{ isAccordion: boolean }>`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  ${(p: { isAccordion: boolean }) =>
    p.isAccordion
      ? `
    flex-direction: column;
    overflow: visible;
  `
      : `
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable;
  `}
  @media (min-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 1.5rem;
  }
`;

function createColumns(cards: Card[]): ColumnType[] {
  return COLUMN_IDS.map((id) => ({
    id,
    title: COLUMN_TITLES[id],
    cards: cards
      .filter((c) => c.status === id)
      .sort((a, b) => a.order - b.order),
  }));
}

const pointerSensorOptions = {
  activationConstraint: { distance: 8 },
};

function Board() {
  const cards = useKanbanStore((s) => s.cards);
  const editingCardId = useKanbanStore((s) => s.editingCardId);
  const addingToColumnId = useKanbanStore((s) => s.addingToColumnId);
  const activeDragId = useKanbanStore((s) => s.activeDragId);
  const setEditingCardId = useKanbanStore((s) => s.setEditingCardId);
  const setAddingToColumnId = useKanbanStore((s) => s.setAddingToColumnId);
  const setActiveDragId = useKanbanStore((s) => s.setActiveDragId);
  const getCardById = useKanbanStore((s) => s.getCardById);

  const isAccordionMode = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const [expandedColumnId, setExpandedColumnId] = useState<CardStatus | null>(null);

  const { addCardOptimistic, updateCardOptimistic, moveCardOptimistic } =
    useRealtimeSync();

  const handleToggleColumn = useCallback((columnId: CardStatus) => {
    setExpandedColumnId((prev) => (prev === columnId ? null : columnId));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo<ColumnType[]>(() => createColumns(cards), [cards]);

  const activeCard = useMemo(
    () => (activeDragId ? (getCardById(activeDragId) ?? null) : null),
    [activeDragId, getCardById, cards]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveDragId(String(event.active.id));
    },
    [setActiveDragId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active: activeItem, over } = event;
      setActiveDragId(null);
      if (!over) return;
      const activeIdStr = String(activeItem.id);
      const overIdStr = String(over.id);
      if (activeIdStr === overIdStr) return;
      const target = getMoveTarget(cards, activeIdStr, overIdStr);
      if (target) {
        moveCardOptimistic(
          activeIdStr,
          target.targetColumnId,
          target.newOrder
        ).catch(() => {});
      }
    },
    [cards, setActiveDragId, moveCardOptimistic]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, [setActiveDragId]);

  const handleEditCard = useCallback(
    (card: Card) => {
      setEditingCardId(card.id);
    },
    [setEditingCardId]
  );

  const handleEditSubmit = useCallback(
    (data: { title: string; description: string; status: CardStatus }) => {
      if (!editingCardId) return;
      updateCardOptimistic(editingCardId, {
        title: data.title,
        description: data.description,
        status: data.status,
      }).catch(() => {});
    },
    [editingCardId, updateCardOptimistic]
  );

  const handleAddCard = useCallback(
    (data: { title: string; description: string; status: CardStatus }) => {
      addCardOptimistic(data.status, {
        title: data.title,
        description: data.description,
      }).catch(() => {});
    },
    [addCardOptimistic]
  );

  const handleStartAdd = useCallback(
    (columnId: CardStatus) => {
      setAddingToColumnId(columnId);
    },
    [setAddingToColumnId]
  );

  const handleCancelAdd = useCallback(() => {
    setAddingToColumnId(null);
  }, [setAddingToColumnId]);

  const handleCancelEdit = useCallback(() => {
    setEditingCardId(null);
  }, [setEditingCardId]);

  const handleDebouncedUpdate = useCallback(
    (
      cardId: string,
      data: { title: string; description: string; status: CardStatus }
    ) => {
      updateCardOptimistic(cardId, data).catch(() => {});
    },
    [updateCardOptimistic]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements: {
          onDragStart({ active: a }) {
            return `카드를 드래그 중: ${a.id}`;
          },
          onDragOver({ over }) {
            if (over) return `드롭 대상: ${over.id}`;
            return undefined;
          },
          onDragEnd({ over }) {
            if (over) return `카드를 ${over.id}(으)로 이동했습니다.`;
            return '드래그가 취소되었습니다.';
          },
          onDragCancel() {
            return '드래그가 취소되었습니다.';
          },
        },
      }}
    >
      <BoardRegion role="region" aria-label="칸반 보드">
        <ColumnsRow
          className={isAccordionMode ? undefined : 'board-columns-row'}
          isAccordion={isAccordionMode}
        >
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              isAdding={addingToColumnId === column.id}
              onEditCard={handleEditCard}
              onStartAdd={handleStartAdd}
              onCancelAdd={handleCancelAdd}
              onAddCard={handleAddCard}
              editingCardId={editingCardId}
              onEditSubmit={handleEditSubmit}
              onCancelEdit={handleCancelEdit}
              onDebouncedUpdate={handleDebouncedUpdate}
              isAccordionMode={isAccordionMode}
              isExpanded={expandedColumnId === column.id}
              onToggleColumn={handleToggleColumn}
            />
          ))}
        </ColumnsRow>
      </BoardRegion>

      <DragOverlay dropAnimation={null}>
        {activeCard ? <CardDragOverlay card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(Board);
