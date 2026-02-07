import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useSocketStore } from '@/store/socketStore';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

export function PresenceAvatars() {
  const presence = useSocketStore((s) => s.presence);
  const currentUserId = useSocketStore((s) => s.mySocketId);

  if (presence.length === 0) return null;

  return (
    <Wrapper>
      <Label>접속 중:</Label>
      <Avatars>
        {presence.map((user) => (
          <Avatar
            key={user.userId}
            style={{ backgroundColor: user.color }}
            title={user.userId === currentUserId ? '나' : user.userId}
          >
            {user.userId === currentUserId ? '나' : user.userId.slice(0, 1)}
          </Avatar>
        ))}
      </Avatars>
    </Wrapper>
  );
}
