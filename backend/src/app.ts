import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './shared/middleware/errorHandler';

import authRoutes from './modules/iam/infrastructure/routes/auth.routes';
import productRoutes from './modules/inventory/infrastructure/routes/product.routes';
import batchRoutes from './modules/inventory/infrastructure/routes/batch.routes';
import dashboardRoutes from './modules/dashboard/infrastructure/routes/dashboard.routes';
import healthRoutes from './health/health.routes';
import supplierRoutes from './modules/inventory/infrastructure/routes/supplier.routes';
import purchaseOrderRoutes from './modules/inventory/infrastructure/routes/purchaseOrder.routes';
import auditRoutes from './modules/iam/infrastructure/routes/audit.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/audit', auditRoutes);

app.use(errorHandler);

export default app;