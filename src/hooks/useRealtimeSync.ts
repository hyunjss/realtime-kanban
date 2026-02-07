import { useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { throttle } from '@/lib/throttle';
import { useKanbanStore } from '@/store/kanbanStore';
import { socketStore } from '@/store/socketStore';
import { api } from '@/api/client';
import type { Card, CardStatus } from '@/types/kanban';

const DEFAULT_BOARD_ID = 'default';

/** Socket emit 간격 제한(ms). 연속 이벤트 시 네트워크·서버 부하 감소 */
const SOCKET_EMIT_THROTTLE_MS = 150;

export function useRealtimeSync(boardId: string = DEFAULT_BOARD_ID) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const isOwnActionRef = useRef<Set<string>>(new Set());
  const throttledEmitRef = useRef<
    ((event: string, ...args: unknown[]) => void) | null
  >(null);

  const addCard = useKanbanStore((s) => s.addCard);
  const updateCard = useKanbanStore((s) => s.updateCard);
  const deleteCard = useKanbanStore((s) => s.deleteCard);
  const moveCard = useKanbanStore((s) => s.moveCard);
  const applyCardFromServer = useKanbanStore((s) => s.applyCardFromServer);
  const removeCardFromServer = useKanbanStore((s) => s.removeCardFromServer);
  const replaceCard = useKanbanStore((s) => s.replaceCard);
  const setEditingCardId = useKanbanStore((s) => s.setEditingCardId);
  const getCardById = useKanbanStore((s) => s.getCardById);

  useEffect(() => {
    const socket = getSocket(boardId);
    socketRef.current = socket;
    throttledEmitRef.current = throttle((event: string, ...args: unknown[]) => {
      socketRef.current?.emit(event, ...args);
    }, SOCKET_EMIT_THROTTLE_MS);

    socket.on(SOCKET_EVENTS.USER_JOINED, (payload: { userId: string }) => {
      socketStore.getState().addPresence(payload.userId);
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, (payload: { userId: string }) => {
      socketStore.getState().removePresence(payload.userId);
    });

    socket.on(SOCKET_EVENTS.CARD_CREATED, (card: Card) => {
      applyCardFromServer(card);
    });

    socket.on(SOCKET_EVENTS.CARD_UPDATED, (card: Card) => {
      const editingId = useKanbanStore.getState().editingCardId;
      applyCardFromServer(card);
      if (editingId === card.id) {
        setEditingCardId(null);
      }
    });

    socket.on(SOCKET_EVENTS.CARD_DELETED, (payload: { cardId: string }) => {
      removeCardFromServer(payload.cardId);
      if (useKanbanStore.getState().editingCardId === payload.cardId) {
        setEditingCardId(null);
      }
    });

    socket.on(
      SOCKET_EVENTS.CARD_MOVED,
      (payload: {
        cardId: string;
        targetColumnId: CardStatus;
        newOrder: number;
      }) => {
        if (isOwnActionRef.current.has(`move:${payload.cardId}`)) {
          isOwnActionRef.current.delete(`move:${payload.cardId}`);
          return;
        }
        moveCard(payload.cardId, payload.targetColumnId, payload.newOrder);
      }
    );

    return () => {
      socket.removeAllListeners();
      socketRef.current = null;
      disconnectSocket();
      socketStore.getState().clearPresence();
    };
  }, [
    boardId,
    applyCardFromServer,
    removeCardFromServer,
    moveCard,
    setEditingCardId,
  ]);

  const addCardOptimistic = useCallback(
    async (
      columnId: CardStatus,
      input: { title: string; description: string }
    ) => {
      const tempId = crypto.randomUUID();
      addCard(columnId, input, tempId);
      try {
        const serverCard = await api.createCard({
          title: input.title,
          description: input.description,
          status: columnId,
        });
        replaceCard(tempId, serverCard);
        throttledEmitRef.current?.(SOCKET_EVENTS.CARD_CREATED, serverCard);
      } catch {
        removeCardFromServer(tempId);
        throw new Error('Failed to create card');
      }
    },
    [addCard, replaceCard, removeCardFromServer]
  );

  const updateCardOptimistic = useCallback(
    async (
      cardId: string,
      updates: { title?: string; description?: string; status?: CardStatus }
    ) => {
      const prev = getCardById(cardId);
      if (!prev) return;
      updateCard(cardId, updates);
      try {
        const updated = await api.updateCard(cardId, updates);
        throttledEmitRef.current?.(SOCKET_EVENTS.CARD_UPDATED, updated);
      } catch {
        updateCard(cardId, {
          title: prev.title,
          description: prev.description,
          status: prev.status,
        });
        throw new Error('Failed to update card');
      }
    },
    [updateCard, getCardById]
  );

  const deleteCardOptimistic = useCallback(
    async (cardId: string) => {
      const prev = getCardById(cardId);
      if (!prev) return;
      deleteCard(cardId);
      try {
        await api.deleteCard(cardId);
        throttledEmitRef.current?.(SOCKET_EVENTS.CARD_DELETED, { cardId });
      } catch {
        applyCardFromServer(prev);
        throw new Error('Failed to delete card');
      }
    },
    [deleteCard, getCardById, applyCardFromServer]
  );

  const moveCardOptimistic = useCallback(
    async (cardId: string, targetColumnId: CardStatus, newOrder: number) => {
      const prev = getCardById(cardId);
      if (!prev) return;
      const prevStatus = prev.status;
      const prevOrder = prev.order;
      moveCard(cardId, targetColumnId, newOrder);
      isOwnActionRef.current.add(`move:${cardId}`);
      try {
        await api.updateCard(cardId, {
          status: targetColumnId,
          order: newOrder,
        });
        throttledEmitRef.current?.(SOCKET_EVENTS.CARD_MOVED, {
          cardId,
          targetColumnId,
          newOrder,
        });
      } catch {
        moveCard(cardId, prevStatus, prevOrder);
        isOwnActionRef.current.delete(`move:${cardId}`);
        throw new Error('Failed to move card');
      }
    },
    [moveCard, getCardById]
  );

  return {
    addCardOptimistic,
    updateCardOptimistic,
    deleteCardOptimistic,
    moveCardOptimistic,
  };
}
