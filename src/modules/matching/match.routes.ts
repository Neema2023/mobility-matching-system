import { Router } from 'express';
import { MatchController } from './match.controller';

const router = Router();
const controller = new MatchController();

router.get('/', controller.findMatches);
router.post('/reserve', controller.reserve);
router.post('/confirm', controller.confirm);
router.post('/cancel', controller.cancel);

export default router;