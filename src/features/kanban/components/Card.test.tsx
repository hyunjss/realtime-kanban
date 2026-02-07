import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';
import type { Card as CardType } from '@/types/kanban';

const card: CardType = {
  id: '1',
  title: 'Test card',
  description: 'Test description',
  status: 'todo',
  order: 0,
  createdAt: '2025-02-01T10:00:00.000Z',
};

describe('Card', () => {
  it('renders title, description and formatted date', () => {
    const onEdit = vi.fn();
    render(<Card card={card} onEdit={onEdit} />);
    expect(screen.getByText('Test card')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText(/2025\. 2\. 1\./)).toBeInTheDocument();
  });

  it('calls onEdit when clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Card card={card} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: /카드: Test card/ }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(card);
  });

  it('calls onEdit on Enter key', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Card card={card} onEdit={onEdit} />);
    const button = screen.getByRole('button', { name: /카드: Test card/ });
    button.focus();
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledWith(card);
  });

  it('calls onEdit on Space key', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Card card={card} onEdit={onEdit} />);
    const button = screen.getByRole('button', { name: /카드: Test card/ });
    button.focus();
    await user.keyboard(' ');
    expect(onEdit).toHaveBeenCalledWith(card);
  });

  it('renders without description when empty', () => {
    const cardNoDesc = { ...card, description: '' };
    render(<Card card={cardNoDesc} onEdit={vi.fn()} />);
    expect(screen.getByLabelText(/설명 없음/)).toBeInTheDocument();
  });
});
