import { Router, Request, Response } from 'express';
import { store } from '../db/index.js';
import type { CardCreateInput, CardUpdateInput } from '../db/types.js';

const router = Router();

/** POST /api/cards - 카드 생성 */
router.post('/', (req: Request, res: Response) => {
  const { title, description, status } = req.body as CardCreateInput & {
    status?: string;
  };
  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const validStatuses = ['todo', 'in_progress', 'done'];
  const cardStatus =
    status && validStatuses.includes(status) ? status : 'todo';
  const card = store.createCard({
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    status: cardStatus,
  });
  res.status(201).json(card);
});

/** PATCH /api/cards/:id - 카드 수정 */
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as CardUpdateInput;
  const card = store.getCardById(id);
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  const patch: CardUpdateInput = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.order !== undefined) patch.order = updates.order;
  const updated = store.updateCard(id, patch);
  res.json(updated);
});

/** DELETE /api/cards/:id - 카드 삭제 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = store.deleteCard(id);
  if (!deleted) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  res.status(204).send();
});

export default router;
