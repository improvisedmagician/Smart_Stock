export interface DashboardMetrics {
  totalProducts: number;
  totalSuppliers: number;
  lowStockCount: number;
  totalBatches: number;
  expiringSoonCount: number;
}

export interface DashboardRepository {
  getMetrics(): Promise<DashboardMetrics>;
  getExpiringBatches(days: number): Promise<any[]>;
  getTrend(): Promise<any[]>;
  getLosses(): Promise<any[]>;
}
