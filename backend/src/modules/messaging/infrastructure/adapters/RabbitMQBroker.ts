import { MessageBrokerPort } from '../../domain/ports/MessageBroker.port';
import { rabbitMQManager } from '../../../../shared/messaging/rabbitmq';

export class RabbitMQBroker implements MessageBrokerPort {
  async publish(exchange: string, routingKey: string, message: any): Promise<void> {
    const channel = rabbitMQManager.getChannel();
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }

  async subscribe(queue: string, handler: (message: any) => Promise<void>): Promise<void> {
    const channel = rabbitMQManager.getChannel();
    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel.ack(msg);
        } catch (err) {
          console.error('Error processing message', err);
          channel.nack(msg);
        }
      }
    });
  }
}
