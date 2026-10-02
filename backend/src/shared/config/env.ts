import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.BACKEND_PORT || 3000,
  POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres',
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_DB: process.env.POSTGRES_DB || 'smartstock',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/smartstock_audit',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret'
};
