import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardForm from './CardForm';

describe('CardForm', () => {
  it('renders create form with placeholder and default status', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<CardForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByPlaceholderText('제목')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '상태 선택' })).toHaveValue('todo');
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('validates required title and does not submit when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CardForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '추가' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with trimmed title and description', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CardForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('제목'), '  New task  ');
    await user.type(screen.getByPlaceholderText('설명 (선택)'), '  Desc  ');
    await user.selectOptions(screen.getByLabelText('상태 선택'), 'in_progress');
    await user.click(screen.getByRole('button', { name: '추가' }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New task',
      description: 'Desc',
      status: 'in_progress',
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CardForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CardForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders edit form when initialValues provided', () => {
    const onSubmit = vi.fn();
    render(
      <CardForm
        initialValues={{
          id: '1',
          title: 'Edit me',
          description: 'Desc',
          status: 'done',
          order: 0,
          createdAt: '',
        }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Edit me')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '상태 선택' })).toHaveValue('done');
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('calls onDebouncedUpdate when values change in edit mode', () => {
    vi.useFakeTimers();
    const onDebouncedUpdate = vi.fn();
    render(
      <CardForm
        initialValues={{
          id: '1',
          title: 'Original',
          description: '',
          status: 'todo',
          order: 0,
          createdAt: '',
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        onDebouncedUpdate={onDebouncedUpdate}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('제목'), { target: { value: 'Updated' } });
    expect(onDebouncedUpdate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(onDebouncedUpdate).toHaveBeenCalledWith('1', {
      title: 'Updated',
      description: '',
      status: 'todo',
    });
    vi.useRealTimers();
  });
});
