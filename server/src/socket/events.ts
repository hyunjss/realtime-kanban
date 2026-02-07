/** Socket.io event names (client ↔ server) */
export const SOCKET_EVENTS = {
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_MOVED: 'card:moved',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
} as const;
