export class CheckSafetyStockUseCase {
  constructor(private messagingClient: any) {}

  /**
   * Verifica se o estoque está abaixo da segurança
   */
  async execute(product: any): Promise<void> {
    if (product.currentStock < product.safetyStock) {
      await this.messagingClient.publish('stock.low', {
        productId: product.id,
        currentStock: product.currentStock,
        safetyStock: product.safetyStock,
      });
    }
  }
}
