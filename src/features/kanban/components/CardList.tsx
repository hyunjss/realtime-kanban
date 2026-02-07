import type { ReactNode } from 'react';
import styled from '@emotion/styled';

interface ListProps {
  height?: number;
}

interface CardListProps {
  children: ReactNode;
  height?: number;
}

const List = styled.div<ListProps>`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  gap: 0.75rem;
  overflow-y: auto;
  ${(p: ListProps) => p.height !== undefined && `height: ${p.height}px;`}
`;

function CardListInner({ children, height }: CardListProps) {
  return (
    <List
      height={height}
      style={{ contain: 'layout style' }}
    >
      {children}
    </List>
  );
}

export const CardList = CardListInner;
