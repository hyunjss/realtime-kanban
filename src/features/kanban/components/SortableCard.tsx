import { memo } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Card as CardType } from '@/types/kanban';
import Card from './Card';

interface SortableCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
}

interface SortableWrapperProps extends StyledThemeProps {
  isDragging: boolean;
}
const SortableWrapper = styled(motion.div)<{ isDragging: boolean }>`
  opacity: ${(p: SortableWrapperProps) => (p.isDragging ? 0.4 : 1)};
`;

function SortableCard({ card, onEdit }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    contain: 'layout' as const,
  };

  return (
    <SortableWrapper
      ref={setNodeRef}
      style={style}
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <Card card={card} onEdit={onEdit} />
    </SortableWrapper>
  );
}

export default memo(SortableCard);
