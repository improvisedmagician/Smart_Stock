export class ProcessPurchaseOrderUseCase {
  /**
   * Processa uma ordem de compra
   */
  async execute(data: any): Promise<void> {
    console.log('Processando ordem de compra para:', data);
    // Logica para criar PO no banco...
  }
}
