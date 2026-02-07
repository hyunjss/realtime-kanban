import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import type { Card } from '@/types/kanban';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const DEBOUNCE_MS = 500;

interface CardFormProps {
  initialValues?: Partial<Card> | null;
  defaultStatus?: Card['status'];
  onSubmit: (data: {
    title: string;
    description: string;
    status: Card['status'];
  }) => void;
  onCancel: () => void;
  onDebouncedUpdate?: (
    cardId: string,
    data: { title: string; description: string; status: Card['status'] }
  ) => void;
}

const Form = styled.form`
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.xl};
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.white};
  padding: 1rem;
  box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.md};
`;

const Fieldset = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  display: block;
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const inputBase = (p: { theme: import('@/theme').Theme }) => `
  width: 100%;
  border-radius: ${p.theme.radii.lg};
  border: 1px solid ${p.theme.colors.slate[300]};
  padding: 0.5rem 0.75rem;
  color: ${p.theme.colors.slate[900]};
  &:focus {
    outline: none;
    border-color: ${p.theme.colors.slate[500]};
    box-shadow: 0 0 0 1px ${p.theme.colors.slate[500]};
  }
  &::placeholder {
    color: ${p.theme.colors.slate[400]};
  }
`;

const Input = styled.input`
  ${(p: StyledThemeProps) => inputBase(p)}
`;

const Textarea = styled.textarea`
  ${(p: StyledThemeProps) => inputBase(p)}
  resize: none;
`;

const Select = styled.select`
  ${(p: StyledThemeProps) => inputBase(p)}
  background-color: ${(p: StyledThemeProps) => p.theme.colors.white};
`;

const ButtonRow = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const SubmitBtn = styled.button`
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.slate[800]};
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${(p: StyledThemeProps) => p.theme.colors.slate[700]};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
    outline-offset: 2px;
  }
`;

const CancelBtn = styled.button`
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[300]};
  background-color: ${(p: StyledThemeProps) => p.theme.colors.white};
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[700]};
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  &:hover {
    background-color: ${(p: StyledThemeProps) => p.theme.colors.slate[50]};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
    outline-offset: 2px;
  }
`;

function CardForm({
  initialValues = null,
  defaultStatus = 'todo',
  onSubmit,
  onCancel,
  onDebouncedUpdate,
}: CardFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [status, setStatus] = useState<Card['status']>(
    initialValues?.status ?? defaultStatus ?? 'todo'
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const isFirstMountRef = useRef(true);

  const isEdit = Boolean(initialValues?.id);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title ?? '');
      setDescription(initialValues.description ?? '');
      setStatus(initialValues.status ?? defaultStatus ?? 'todo');
      isFirstMountRef.current = true;
    }
  }, [initialValues, defaultStatus]);

  const debouncedUpdate = useDebouncedCallback(
    (
      cardId: string,
      data: { title: string; description: string; status: Card['status'] }
    ) => {
      onDebouncedUpdate?.(cardId, data);
    },
    DEBOUNCE_MS
  );

  useEffect(() => {
    if (!isEdit || !initialValues?.id || !onDebouncedUpdate) return;
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    debouncedUpdate(initialValues.id, { title, description, status });
  }, [
    title,
    description,
    status,
    isEdit,
    initialValues?.id,
    onDebouncedUpdate,
    debouncedUpdate,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      titleRef.current?.focus();
      return;
    }
    onSubmit({ title: trimmedTitle, description: description.trim(), status });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <Form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      aria-label={isEdit ? '카드 수정' : '새 카드 추가'}
    >
      <Fieldset>
        <Label htmlFor="card-form-title">
          <SrOnly>제목</SrOnly>
          <Input
            id="card-form-title"
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="제목"
            aria-required
            autoComplete="off"
          />
        </Label>
        <Label htmlFor="card-form-description">
          <SrOnly>설명 (선택)</SrOnly>
          <Textarea
            id="card-form-description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            rows={3}
          />
        </Label>
        <Label htmlFor="card-form-status">
          <SrOnly>상태</SrOnly>
          <Select
            id="card-form-status"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as Card['status'])}
            aria-label="상태 선택"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </Select>
        </Label>
      </Fieldset>
      <ButtonRow>
        <SubmitBtn type="submit">{isEdit ? '저장' : '추가'}</SubmitBtn>
        <CancelBtn type="button" onClick={onCancel}>
          취소
        </CancelBtn>
      </ButtonRow>
    </Form>
  );
}

export default CardForm;
