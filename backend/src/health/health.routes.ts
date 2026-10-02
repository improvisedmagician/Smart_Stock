import { Router } from 'express';
import { pgPool } from '../shared/database/postgres';
import mongoose from 'mongoose';
import { rabbitMQManager } from '../shared/messaging/rabbitmq';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pgPool.query('SELECT 1');
    const pgStatus = 'ok';
    
    const mongoStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';
    
    let rabbitStatus = 'error';
    try {
      if (rabbitMQManager.getChannel()) rabbitStatus = 'ok';
    } catch(e) {}

    res.json({
      status: 'ok',
      services: {
        postgres: pgStatus,
        mongodb: mongoStatus,
        rabbitmq: rabbitStatus
      }
    });
  } catch (e) {
    res.status(500).json({ status: 'error', details: e });
  }
});

export default router;
