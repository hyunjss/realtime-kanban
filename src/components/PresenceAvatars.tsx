import { useState } from 'react';
import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useSocketStore } from '@/store/socketStore';

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: default;
`;

const Label = styled.span`
  font-size: 0.75rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
`;

const Avatars = styled.div`
  display: flex;
  margin-left: -0.5rem;
`;

const Avatar = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.sm};
`;

const Popover = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 10rem;
  padding: 0.5rem 0;
  background: ${(p: StyledThemeProps) => p.theme.colors.white};
  border: 1px solid ${(p: StyledThemeProps) => p.theme.colors.slate[200]};
  border-radius: ${(p: StyledThemeProps) => p.theme.radii.lg};
  box-shadow: ${(p: StyledThemeProps) => p.theme.shadows.md};
  z-index: 50;
  transition: opacity 0.15s, visibility 0.15s;
  opacity: ${(p: StyledThemeProps & { visible: boolean }) => (p.visible ? 1 : 0)};
  visibility: ${(p: StyledThemeProps & { visible: boolean }) => (p.visible ? 'visible' : 'hidden')};
  pointer-events: ${(p: StyledThemeProps & { visible: boolean }) => (p.visible ? 'auto' : 'none')};
`;

const PopoverTitle = styled.div`
  padding: 0.25rem 0.75rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[500]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8125rem;
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[800]};
`;

const UserDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
`;

function displayName(
  userId: string,
  currentUserId: string | null,
  myNickname: string
): string {
  if (userId !== currentUserId) return userId;
  return myNickname || '나';
}

export function PresenceAvatars() {
  const [hovered, setHovered] = useState(false);
  const presence = useSocketStore((s) => s.presence);
  const currentUserId = useSocketStore((s) => s.mySocketId);
  const myNickname = useSocketStore((s) => s.myNickname);

  if (presence.length === 0) return null;

  return (
    <Container
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Label>접속 중:</Label>
      <Avatars>
        {presence.map((user) => {
          const name = displayName(user.userId, currentUserId, myNickname);
          return (
            <Avatar
              key={user.userId}
              style={{ backgroundColor: user.color }}
              title={name}
            >
              {name.slice(0, 1)}
            </Avatar>
          );
        })}
      </Avatars>
      <Popover
        visible={hovered}
        role="tooltip"
        aria-label="접속 중인 사용자 목록"
      >
        <PopoverTitle>접속 중 ({presence.length}명)</PopoverTitle>
        {presence.map((user) => (
          <UserItem key={user.userId}>
            <UserDot style={{ backgroundColor: user.color }} />
            <span>{displayName(user.userId, currentUserId, myNickname)}</span>
          </UserItem>
        ))}
      </Popover>
    </Container>
  );
}
