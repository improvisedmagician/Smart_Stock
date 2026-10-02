import amqplib, { ChannelModel, Channel } from 'amqplib';
import { env } from '../config/env';

class RabbitMQManager {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async connect() {
    try {
      this.connection = await amqplib.connect(env.RABBITMQ_URL);
      this.channel = await this.connection!.createChannel();

      await this.channel!.assertExchange('smartstock.events', 'topic', { durable: true });
      await this.channel!.assertQueue('purchase-orders', { durable: true });
      await this.channel!.assertQueue('stock-alerts', { durable: true });

      console.log('RabbitMQ connected and initialized');
    } catch (error) {
      console.error('RabbitMQ connection error', error);
      setTimeout(() => this.connect(), 5000); // reconnection logic
    }
  }

  getChannel(): Channel {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    return this.channel;
  }
}

export const rabbitMQManager = new RabbitMQManager();
