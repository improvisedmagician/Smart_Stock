import { Router } from 'express';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRole('GERENTE'), async (req, res) => {
  try {
    const result = await pgPool.query(
      "SELECT * FROM tb_log_auditoria ORDER BY criado_em DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
