export interface MessageBrokerPort {
  publish(exchange: string, routingKey: string, message: any): Promise<void>;
  subscribe(queue: string, handler: (message: any) => Promise<void>): Promise<void>;
}
