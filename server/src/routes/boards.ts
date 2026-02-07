import { Router, Request, Response } from 'express';
import { store } from '../db/index.js';
import { COLUMN_IDS, COLUMN_TITLES } from '../db/types.js';
import type { CardStatus } from '../db/types.js';

const router = Router();

/** GET /api/boards/:id - 보드 조회 (컬럼 메타 + 카드 목록 포함) */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const board = store.getBoardById(id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  const cards = store.getCardsByBoardId(id);
  const columns = COLUMN_IDS.map((colId: CardStatus) => ({
    id: colId,
    title: COLUMN_TITLES[colId],
    cards: cards.filter((c) => c.status === colId).sort((a, b) => a.order - b.order),
  }));
  res.json({ board, columns, cards });
});

export default router;
