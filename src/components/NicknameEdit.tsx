import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useSocketStore } from '@/store/socketStore';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const Display = styled.button`
  padding: 0.25rem 0.5rem;
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  border: 1px solid transparent;
  background: transparent;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[700]};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: ${(p: StyledThemeProps) => p.theme.colors.slate[100]};
    border-color: ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  }
`;

const Input = styled.input`
  width: 8rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[300]};
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[800]};
  outline: none;
  &:focus {
    border-color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
    box-shadow: 0 0 0 2px ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  }
`;

export function NicknameEdit() {
  const myNickname = useSocketStore((s) => s.myNickname);
  const setMyNickname = useSocketStore((s) => s.setMyNickname);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(myNickname);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(myNickname);
      inputRef.current?.focus();
    }
  }, [editing, myNickname]);

  const save = () => {
    setMyNickname(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      setValue(myNickname);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <Wrapper>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          placeholder="닉네임"
          maxLength={20}
          aria-label="닉네임 입력"
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Display
        type="button"
        onClick={() => setEditing(true)}
        aria-label="닉네임 수정"
      >
        {myNickname || '닉네임 설정'}
      </Display>
    </Wrapper>
  );
}
