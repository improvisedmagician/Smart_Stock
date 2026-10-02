import app from './app';
import { env } from './shared/config/env';
import { connectPostgres } from './shared/database/postgres';
import { connectMongoDB } from './shared/database/mongodb';
import { rabbitMQManager } from './shared/messaging/rabbitmq';
import { startBatchExpirationJob } from './modules/cron/BatchExpirationJob';

import { startStockMonitorWorker } from './modules/messaging/infrastructure/workers/stockMonitor.worker';

const bootstrap = async () => {
  try {
    await connectPostgres();
    // await connectMongoDB();
    // await rabbitMQManager.connect();

    // Start scheduled jobs
    startBatchExpirationJob();

    // Init workers here
    // await startStockMonitorWorker();

    const server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down...');
      server.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('Error starting server', err);
    process.exit(1);
  }
};

bootstrap();
