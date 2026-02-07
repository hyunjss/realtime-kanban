import type { Card, CardStatus } from '@/types/kanban';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getBoard(id: string) {
    return request<{ board: { id: string; name: string }; cards: Card[] }>(
      `/api/boards/${id}`
    );
  },

  createCard(body: {
    title: string;
    description: string;
    status?: CardStatus;
  }) {
    return request<Card>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateCard(
    id: string,
    body: Partial<Pick<Card, 'title' | 'description' | 'status' | 'order'>>
  ) {
    return request<Card>(`/api/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  deleteCard(id: string) {
    return request<void>(`/api/cards/${id}`, { method: 'DELETE' });
  },
};
