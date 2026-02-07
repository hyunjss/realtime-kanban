import { memo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import type { StyledThemeProps } from '@/theme';
import type { Card as CardType } from '@/types/kanban';

interface CardDragOverlayProps {
  card: CardType;
}

const OverlayCard = styled(motion.div)`
  cursor: grabbing;
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.xl};
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.white};
  padding: 1rem;
  box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.xl};
  outline: 2px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
`;

const OverlayTitle = styled.h3`
  font-weight: 500;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[900]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OverlayDescription = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OverlayDate = styled.p`
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[400]};
`;

function CardDragOverlayInner({ card }: CardDragOverlayProps) {
  return (
    <OverlayCard
      style={{ contain: 'layout' }}
      initial={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      animate={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
    >
      <OverlayTitle>{card.title}</OverlayTitle>
      {card.description ? (
        <OverlayDescription>{card.description}</OverlayDescription>
      ) : null}
      <OverlayDate aria-hidden>
        {new Date(card.createdAt).toLocaleDateString('ko-KR')}
      </OverlayDate>
    </OverlayCard>
  );
}

export const CardDragOverlay = memo(CardDragOverlayInner);
