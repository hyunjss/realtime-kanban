import type { ReactNode } from 'react';
import styled from '@emotion/styled';

interface ListProps {
  height?: number;
}

interface CardListProps {
  children: ReactNode;
  height?: number;
  id?: string;
  'aria-labelledby'?: string;
}

const List = styled.div<ListProps>`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  gap: 1rem;
  overflow-y: auto;
  @media (min-width: 768px) {
    gap: 0.75rem;
  }
  ${(p: ListProps) => p.height !== undefined && `height: ${p.height}px;`}
`;

function CardListInner({ children, height, id, 'aria-labelledby': ariaLabelledby }: CardListProps) {
  return (
    <List
      height={height}
      id={id}
      aria-labelledby={ariaLabelledby}
      style={{ contain: 'layout style' }}
    >
      {children}
    </List>
  );
}

export const CardList = CardListInner;
