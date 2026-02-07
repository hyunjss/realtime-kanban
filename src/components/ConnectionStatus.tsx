import styled from '@emotion/styled';
import type { StyledThemeProps } from '@/theme';
import { useSocketStore } from '@/store/socketStore';
import type { ConnectionStatus as SocketStatus } from '@/lib/socket';

const STATUS_LABELS: Record<SocketStatus, string> = {
  idle: '연결 안 함',
  connecting: '연결 중…',
  connected: '연결됨',
  disconnected: '연결 끊김',
};

function getDotColor(status: SocketStatus): string {
  if (status === 'connected') return '#10b981';
  if (status === 'connecting') return '#f59e0b';
  if (status === 'disconnected') return '#ef4444';
  return '#cbd5e1';
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

interface DotProps {
  color: string;
  pulse?: boolean;
}
const Dot = styled.span<DotProps>`
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: ${(p: DotProps) => p.color};
  ${(p: DotProps) => p.pulse && 'animation: pulse 1.5s ease-in-out infinite;'}
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StatusText = styled.span`
  color: ${(p: StyledThemeProps) => p.theme.colors.slate[600]};
`;

const ErrorText = styled.span`
  color: ${(p: StyledThemeProps) => p.theme.colors.red[600]};
`;

export function ConnectionStatus() {
  const status = useSocketStore((s) => s.status);
  const error = useSocketStore((s) => s.error);
  const dotColor = getDotColor(status);
  const pulse = status === 'connecting';

  return (
    <Wrapper>
      <Dot color={dotColor} pulse={pulse} aria-hidden />
      <StatusText>{STATUS_LABELS[status]}</StatusText>
      {error ? (
        <ErrorText title={error}>({error})</ErrorText>
      ) : null}
    </Wrapper>
  );
}
