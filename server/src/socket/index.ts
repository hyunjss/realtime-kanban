import { Server as SocketServer } from 'socket.io';
import type { Card } from '../db/types.js';
import { SOCKET_EVENTS } from './events.js';
import type { CardMovedPayload } from '../db/types.js';

const BOARD_ROOM_PREFIX = 'board:';

export function registerSocketHandlers(io: SocketServer): void {
  io.on('connection', (socket) => {
    const boardId =
      (socket.handshake.query?.boardId as string) || 'default';

    socket.join(`${BOARD_ROOM_PREFIX}${boardId}`);

    socket.emit(SOCKET_EVENTS.USER_JOINED, {
      userId: socket.id,
      boardId,
    });
    socket.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.USER_JOINED, {
      userId: socket.id,
      boardId,
    });

    socket.on(SOCKET_EVENTS.CARD_CREATED, (card: Card) => {
      socket.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_CREATED, card);
    });

    socket.on(SOCKET_EVENTS.CARD_UPDATED, (card: Card) => {
      socket.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_UPDATED, card);
    });

    socket.on(SOCKET_EVENTS.CARD_DELETED, (payload: { cardId: string }) => {
      socket
        .to(`${BOARD_ROOM_PREFIX}${boardId}`)
        .emit(SOCKET_EVENTS.CARD_DELETED, payload);
    });

    socket.on(SOCKET_EVENTS.CARD_MOVED, (payload: CardMovedPayload) => {
      socket
        .to(`${BOARD_ROOM_PREFIX}${boardId}`)
        .emit(SOCKET_EVENTS.CARD_MOVED, payload);
    });

    socket.on('disconnect', () => {
      socket.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.USER_LEFT, {
        userId: socket.id,
        boardId,
      });
    });
  });
}

/** Broadcast helpers for use in REST handlers (optional) */
export function getIo(io: SocketServer) {
  return {
    broadcastCardCreated(boardId: string, card: Card) {
      io.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_CREATED, card);
    },
    broadcastCardUpdated(boardId: string, card: Card) {
      io.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_UPDATED, card);
    },
    broadcastCardDeleted(boardId: string, cardId: string) {
      io.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_DELETED, {
        cardId,
      });
    },
    broadcastCardMoved(
      boardId: string,
      payload: CardMovedPayload
    ) {
      io.to(`${BOARD_ROOM_PREFIX}${boardId}`).emit(SOCKET_EVENTS.CARD_MOVED, payload);
    },
  };
}
