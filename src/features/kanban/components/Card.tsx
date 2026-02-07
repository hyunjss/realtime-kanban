import { memo, useCallback } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import type { Card as CardType } from '@/types/kanban';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
}

const CardButton = styled.button`
  width: 100%;
  padding: 1rem;
  text-align: left;
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.xl};
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.white};
  box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.sm};
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.md};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(p: StyledThemeProps) => p.theme.colors.slate[400]};
    outline-offset: 2px;
  }
`;

const CardTitle = styled.h3`
  font-weight: 500;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[900]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDescription = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDate = styled.p`
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[400]};
`;

function Card({ card, onEdit }: CardProps) {
  const handleClick = useCallback(() => {
    onEdit(card);
  }, [card, onEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEdit(card);
      }
    },
    [card, onEdit]
  );

  return (
    <CardButton
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ contain: 'layout' }}
      aria-label={`카드: ${card.title}. ${card.description || '설명 없음'}`}
    >
      <CardTitle>{card.title}</CardTitle>
      {card.description ? (
        <CardDescription>{card.description}</CardDescription>
      ) : null}
      <CardDate aria-hidden>
        {new Date(card.createdAt).toLocaleDateString('ko-KR')}
      </CardDate>
    </CardButton>
  );
}

export default memo(Card);
