import { memo, useMemo } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column as ColumnType } from '@/types/kanban';
import { getDroppableIdForColumn } from '../constants/dnd';
import { CardList } from './CardList';
import CardForm from './CardForm';
import SortableCard from './SortableCard';

interface ColumnProps {
  column: ColumnType;
  isAdding: boolean;
  onEditCard: (card: ColumnType['cards'][number]) => void;
  onStartAdd: (columnId: ColumnType['id']) => void;
  onCancelAdd: () => void;
  onAddCard: (data: {
    title: string;
    description: string;
    status: ColumnType['id'];
  }) => void;
  editingCardId: string | null;
  onEditSubmit: (data: {
    title: string;
    description: string;
    status: ColumnType['id'];
  }) => void;
  onCancelEdit: () => void;
  onDebouncedUpdate?: (
    cardId: string,
    data: { title: string; description: string; status: ColumnType['id'] }
  ) => void;
}

type ColumnSectionProps = StyledThemeProps & { isOver: boolean };

const ColumnSection = styled.section<{ isOver: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 280px;
  max-width: 360px;
  flex-shrink: 0;
  border-radius: ${(p: ColumnSectionProps) => p.theme.radii['2xl']};
  background-color: rgba(241, 245, 249, 0.8);
  padding: 1rem;
  transition: box-shadow 0.2s, outline 0.2s;
  ${(p: ColumnSectionProps) =>
    p.isOver
      ? `
    outline: 2px solid ${p.theme.colors.slate[400]};
    outline-offset: 2px;
  `
      : ''}
`;

const ColumnHeader = styled.h2`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[800]};
`;

const ColumnBadge = styled.span`
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.slate[700]};
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
`;

const AddCardButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.xl};
  border: 2px dashed ${(p: StyledThemeProps) => p.theme.colors.slate[300]};
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
  background: transparent;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
  &:hover {
    border-color: ${(p: StyledThemeProps) => p.theme.colors.slate[400]};
    background-color: rgba(226, 232, 240, 0.5);
    color: ${(p: StyledThemeProps) => p.theme.colors.slate[700]};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(p: StyledThemeProps) => p.theme.colors.slate[400]};
    outline-offset: 2px;
  }
`;

function ColumnInner({
  column,
  isAdding,
  onEditCard,
  onStartAdd,
  onCancelAdd,
  onAddCard,
  editingCardId,
  onEditSubmit,
  onCancelEdit,
  onDebouncedUpdate,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: getDroppableIdForColumn(column.id),
    data: { type: 'column', columnId: column.id },
  });

  const cardIds = useMemo(() => column.cards.map((c) => c.id), [column.cards]);
  const editingCard = useMemo(
    () => column.cards.find((c) => c.id === editingCardId) ?? null,
    [column.cards, editingCardId]
  );

  return (
    <ColumnSection ref={setNodeRef} isOver={isOver} style={{ contain: 'layout' }} aria-label={`${column.title} 컬럼, 카드 ${column.cards.length}개`}>
      <ColumnHeader>
        <ColumnBadge>{column.cards.length}개</ColumnBadge>
        {column.title}
      </ColumnHeader>

      <CardList>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) =>
            card.id === editingCardId && editingCard !== null ? (
              <CardForm
                key={card.id}
                initialValues={editingCard}
                defaultStatus={column.id}
                onSubmit={onEditSubmit}
                onCancel={onCancelEdit}
                onDebouncedUpdate={onDebouncedUpdate}
              />
            ) : (
              <SortableCard key={card.id} card={card} onEdit={onEditCard} />
            )
          )}
        </SortableContext>

        {isAdding ? (
          <CardForm
            defaultStatus={column.id}
            onSubmit={onAddCard}
            onCancel={onCancelAdd}
          />
        ) : (
          <AddCardButton
            type="button"
            onClick={() => onStartAdd(column.id)}
            aria-label={`${column.title}에 카드 추가`}
          >
            <span aria-hidden>+</span>
            카드 추가
          </AddCardButton>
        )}
      </CardList>
    </ColumnSection>
  );
}

export const Column = memo(ColumnInner);
export default Column;
