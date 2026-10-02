import { CheckSafetyStockUseCase } from '../../application/usecases/CheckSafetyStockUseCase';
import { rabbitMQManager } from '../../../../shared/messaging/rabbitmq';

class CircuitBreaker {
  async execute(action: () => Promise<any>): Promise<any> {
    try {
      return await action();
    } catch (error) {
      console.error('Circuit breaker alert:', error);
      throw error;
    }
  }
}

export const startStockMonitorWorker = async () => {
  const circuitBreaker = new CircuitBreaker();
  const checkSafetyStock = new CheckSafetyStockUseCase(rabbitMQManager);

  const channel = rabbitMQManager.getChannel();
  await channel.consume('stock-alerts', async (msg: any) => {
    if (msg) {
      await circuitBreaker.execute(async () => {
        const data = JSON.parse(msg.content.toString());
        await checkSafetyStock.execute(data);
        channel.ack(msg);
      });
    }
  });
  console.log('Stock monitor worker started');
};
