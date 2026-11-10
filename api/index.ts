import { Router } from 'express';
import { hdbRouter } from './hdb';

export const apiRouter = Router();

// Mount HDB router at /hdb
apiRouter.use('/hdb', hdbRouter);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HDB Resale Flat API Proxy',
    timestamp: new Date().toISOString(),
  });
});
