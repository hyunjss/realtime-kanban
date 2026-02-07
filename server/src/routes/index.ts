import { Router } from 'express';
import boardsRouter from './boards.js';
import cardsRouter from './cards.js';

const router = Router();

router.use('/boards', boardsRouter);
router.use('/cards', cardsRouter);

export default router;
