import { DashboardMetrics, DashboardRepository } from '../../domain/ports/DashboardRepository.port';

export class GetDashboardMetricsUseCase {
  constructor(private repository: DashboardRepository) {}

  async execute(): Promise<DashboardMetrics> {
    return this.repository.getMetrics();
  }
}
